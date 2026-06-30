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
  await cellLocator(page, row, col).hover();
}

async function cellAriaLabel(
  page: Parameters<typeof test>[0]['page'],
  row: number,
  col: number
) {
  return (await cellLocator(page, row, col).getAttribute('aria-label')) ?? '';
}

async function getGridState(page: Parameters<typeof test>[0]['page'], size: number) {
  const state: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      const label = (await cellLocator(page, r, c).getAttribute('aria-label')) ?? '';
      row.push(label.toLowerCase().includes('light') ? 1 : 0);
    }
    state.push(row);
  }
  return state;
}

async function startTutorial(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/tutorial');
  await page.getByRole('button', { name: 'Start' }).click();
}

test.describe('Puzzle interactions — tutorial 3x3 board', () => {
  test('hover anywhere in the grid snaps preview to the center when a template is selected', async ({
    page
  }) => {
    await startTutorial(page);

    // Select first template
    await page.getByTestId('template-0').click();

    const beforePreview = await cellAriaLabel(page, 1, 1);

    // Hover top-left cell — preview snaps to the only valid 3×3 placement
    await moveToCellCenter(page, 0, 0);
    const afterHoverTopLeft = await cellAriaLabel(page, 1, 1);
    expect(afterHoverTopLeft).not.toEqual(beforePreview);

    // Hover bottom-right cell — still snapped to the same center
    await moveToCellCenter(page, 2, 2);
    const afterHoverBottomRight = await cellAriaLabel(page, 1, 1);
    expect(afterHoverBottomRight).toEqual(afterHoverTopLeft);
  });

  test('tutorial: selecting a template and placing it changes the board', async ({ page }) => {
    await startTutorial(page);

    await page.getByTestId('template-0').click();
    const before = await getGridState(page, 3);
    const { x, y } = await getCellCenter(page, 0, 0);
    await page.mouse.click(x, y);

    const after = await getGridState(page, 3);
    expect(after).not.toEqual(before);
  });

  test('dragging a template onto the grid shows preview and applies on release', async ({ page }) => {
    await startTutorial(page);

    const before = await getGridState(page, 3);
    const template = page.getByTestId('template-0');
    const templateBox = await template.boundingBox();
    if (!templateBox) throw new Error('No bounding box for template-0');

    const { x: cellX, y: cellY } = await getCellCenter(page, 0, 0);
    const startX = templateBox.x + templateBox.width / 2;
    const startY = templateBox.y + templateBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(cellX, cellY, { steps: 12 });

    await expect(page.getByTestId('template-drag-ghost')).toBeVisible();

    await page.mouse.up();

    await expect(page.getByTestId('template-drag-ghost')).toHaveCount(0);

    const after = await getGridState(page, 3);
    expect(after).not.toEqual(before);
  });

  test('drag ghost follows pointer on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startTutorial(page);

    const template = page.getByTestId('template-0');
    const templateBox = await template.boundingBox();
    if (!templateBox) throw new Error('No bounding box for template-0');

    const { x: cellX, y: cellY } = await getCellCenter(page, 0, 0);
    const startX = templateBox.x + templateBox.width / 2;
    const startY = templateBox.y + templateBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(cellX, cellY, { steps: 12 });

    const ghost = page.getByTestId('template-drag-ghost');
    await expect(ghost).toBeVisible();

    const ghostBox = await ghost.boundingBox();
    if (!ghostBox) throw new Error('No bounding box for drag ghost');

    const ghostCenterX = ghostBox.x + ghostBox.width / 2;
    const ghostCenterY = ghostBox.y + ghostBox.height / 2;
    expect(Math.abs(ghostCenterX - cellX)).toBeLessThan(40);
    expect(Math.abs(ghostCenterY - cellY)).toBeLessThan(40);

    await page.mouse.up();
  });

  test('releasing drag outside the grid does not apply the template', async ({ page }) => {
    await startTutorial(page);

    const before = await getGridState(page, 3);
    const template = page.getByTestId('template-0');
    const templateBox = await template.boundingBox();
    if (!templateBox) throw new Error('No bounding box for template-0');

    const startX = templateBox.x + templateBox.width / 2;
    const startY = templateBox.y + templateBox.height / 2;
    const releaseX = templateBox.x - 20;
    const releaseY = templateBox.y;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(releaseX, releaseY, { steps: 8 });
    await page.mouse.up();

    const after = await getGridState(page, 3);
    expect(after).toEqual(before);
  });
});

