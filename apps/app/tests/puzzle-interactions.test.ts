import { expect, test } from '@playwright/test';

function cellLocator(page: Parameters<typeof test>[0]['page'], row: number, col: number) {
  // Scope to the main puzzle grid; there is also a nested grid inside the template preview.
  const grid = page.getByTestId('puzzle-container').first();
  return grid.getByTestId(`puzzle-square-${row}-${col}`);
}

async function getCellCenter(page: Parameters<typeof test>[0]['page'], row: number, col: number) {
  const box = await cellLocator(page, row, col).boundingBox();
  if (!box) throw new Error(`No bounding box for cell ${row},${col}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function moveToCellCenter(page: Parameters<typeof test>[0]['page'], row: number, col: number) {
  const { x, y } = await getCellCenter(page, row, col);
  await page.mouse.move(x, y);
}

async function getHighlightMask(page: Parameters<typeof test>[0]['page'], size: number) {
  const mask: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const classes = await cellLocator(page, r, c).getAttribute('class');
      row.push(!!classes && classes.includes('highlighted'));
    }
    mask.push(row);
  }
  return mask;
}

async function getGridState(page: Parameters<typeof test>[0]['page'], size: number) {
  const state: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      const label = (await cellLocator(page, r, c).getAttribute('aria-label')) ?? '';
      row.push(label.includes('light') ? 1 : 0);
    }
    state.push(row);
  }
  return state;
}

test.describe('Puzzle interactions — tutorial 3x3 board', () => {
  test('hover anywhere in the grid snaps preview to the center when a template is selected', async ({
    page
  }) => {
    await page.goto('/tutorial');

    // Select first template
    await page.getByTestId('template-0').click();

    // Hover top-left cell
    await moveToCellCenter(page, 0, 0);
    let mask = await getHighlightMask(page, 3);
    // All cells should be highlighted (3x3 template over 3x3 board)
    expect(mask).toEqual([
      [true, true, true],
      [true, true, true],
      [true, true, true]
    ]);

    // Hover bottom-right cell — still snapped to the same center
    await moveToCellCenter(page, 2, 2);
    mask = await getHighlightMask(page, 3);
    expect(mask).toEqual([
      [true, true, true],
      [true, true, true],
      [true, true, true]
    ]);
  });

  test('click applies the template at the snapped center and solves the tutorial puzzle', async ({
    page
  }) => {
    await page.goto('/tutorial');

    await page.getByTestId('template-0').click();

    const { x, y } = await getCellCenter(page, 0, 0);
    await page.mouse.click(x, y);

    const after = await getGridState(page, 3);

    // Tutorial puzzle is designed so a single application solves it: all zeros (cleared)
    expect(after).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]);
  });
});

