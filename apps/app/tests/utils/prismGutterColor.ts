import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';

const GRID_GRAY = { r: 238, g: 242, b: 246 };

interface Rgb {
	r: number;
	g: number;
	b: number;
}

interface GapSample {
	x: number;
	y: number;
	rgb: Rgb;
	saturation: number;
	distanceFromGridGray: number;
}

function colorDistance(a: Rgb, b: Rgb): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

/** Sample RGB at a viewport point via a 1×1 screenshot clip. */
async function sampleRgbAt(page: Page, x: number, y: number): Promise<Rgb> {
  const buffer = await page.screenshot({
    clip: {
      x: Math.max(0, Math.floor(x)),
      y: Math.max(0, Math.floor(y)),
      width: 1,
      height: 1
    }
  });

  const png = PNG.sync.read(buffer);
  return {
    r: png.data[0] ?? 0,
    g: png.data[1] ?? 0,
    b: png.data[2] ?? 0
  };
}

async function sampleGapBetweenCells(
  page: Page,
  cellTestIdA: string,
  cellTestIdB: string,
  axis: 'horizontal' | 'vertical'
): Promise<GapSample> {
  const boxA = await page.getByTestId(cellTestIdA).boundingBox();
  const boxB = await page.getByTestId(cellTestIdB).boundingBox();
  if (!boxA || !boxB) {
    throw new Error(`Missing bounding box for ${cellTestIdA} or ${cellTestIdB}`);
  }

  const x =
		axis === 'horizontal'
		  ? boxA.x + boxA.width + (boxB.x - (boxA.x + boxA.width)) / 2
		  : boxA.x + boxA.width / 2;
  const y =
		axis === 'vertical'
		  ? boxA.y + boxA.height + (boxB.y - (boxA.y + boxA.height)) / 2
		  : boxA.y + boxA.height / 2;

  const rgb = await sampleRgbAt(page, x, y);
  return {
    x,
    y,
    rgb,
    saturation: saturation(rgb),
    distanceFromGridGray: colorDistance(rgb, GRID_GRAY)
  };
}

export interface PrismGutterCheck {
	prismCellSaturation: number;
	gutterSamples: GapSample[];
}

/** Assert prism cells are colorful while gutters between them stay near grid gray. */
export async function checkPrismGuttersNeutral(
  page: Page,
  prismCellTestId: string,
  gutterPairs: Array<{ a: string; b: string; axis: 'horizontal' | 'vertical' }>
): Promise<PrismGutterCheck> {
  const prismBox = await page.getByTestId(prismCellTestId).boundingBox();
  if (!prismBox) {
    throw new Error(`Missing prism cell ${prismCellTestId}`);
  }

  const prismRgb = await sampleRgbAt(
    page,
    prismBox.x + prismBox.width / 2,
    prismBox.y + prismBox.height / 2
  );

  const gutterSamples: GapSample[] = [];
  for (const pair of gutterPairs) {
    gutterSamples.push(await sampleGapBetweenCells(page, pair.a, pair.b, pair.axis));
  }

  return {
    prismCellSaturation: saturation(prismRgb),
    gutterSamples
  };
}

export const GUTTER_MAX_SATURATION = 0.14;
export const GUTTER_MAX_COLOR_DISTANCE = 28;
export const PRISM_MIN_SATURATION = 0.18;
