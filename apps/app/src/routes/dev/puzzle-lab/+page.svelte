<script lang="ts">
	import Puzzle from '$lib/components/game/Puzzle.svelte';
	import PuzzlePlayLayout from '$lib/components/game/PuzzlePlayLayout.svelte';
	import GridEditor from '$lib/components/puzzle-lab/GridEditor.svelte';
	import TemplateEditor from '$lib/components/puzzle-lab/TemplateEditor.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { isMonochromeFlipPuzzle, PIGMENT_NAME } from '@flip/game';
	import type { Pigment, PuzzleTemplate } from '@flip/game';
	import {
	  applyTemplateToStartState,
	  configToLabState,
	  createEmptyTemplateGrid,
	  defaultLabState,
	  exportConfigJson,
	  EXAMPLE_CONFIG,
	  LAB_SOLVED_VALUE,
	  labStateToConfig,
	  parseConfigJson,
	  resizeGrid,
	  resizeTemplate,
	  rotateLabTemplate,
	  templateFitsAt,
	  templateHasActiveCells,
	  templateSummaryLabel,
	  validateLabConfig,
	  type LabState,
	  type LabValidation
	} from '$lib/utils/puzzleLab';

	type ViewMode = 'edit' | 'play';

	let lab = $state<LabState>(defaultLabState());
	let viewMode = $state<ViewMode>('edit');
	let importText = $state('');
	let importError = $state<string | null>(null);
	let exportText = $state('');
	let validation = $state<LabValidation | null>(null);
	let copyMessage = $state<string | null>(null);
	let applyError = $state<string | null>(null);
	let applyRow = $state(0);
	let applyCol = $state(0);

	const config = $derived(labStateToConfig(lab));
	const monochrome = $derived(isMonochromeFlipPuzzle(config));
	const selectedTemplate = $derived(lab.templates[lab.selectedTemplateIndex] ?? null);
	const templateRows = $derived(selectedTemplate?.shape.length ?? 2);
	const templateCols = $derived(selectedTemplate?.shape[0]?.length ?? 2);
	const configKey = $derived(exportConfigJson(config));

	function updateStartState(startState: typeof lab.startState) {
	  lab = { ...lab, startState: startState as typeof lab.startState };
	}

	function setGridSize(size: number) {
	  const clamped = Math.min(12, Math.max(2, size));
	  lab = {
	    ...lab,
	    gridSize: clamped,
	    startState: resizeGrid(lab.startState, clamped, LAB_SOLVED_VALUE)
	  };
	}

	function addTemplate() {
	  const next: PuzzleTemplate = {
	    shape: createEmptyTemplateGrid(2, 2)
	  };
	  lab = {
	    ...lab,
	    templates: [...lab.templates, next],
	    selectedTemplateIndex: lab.templates.length
	  };
	}

	function removeTemplate(index: number) {
	  if (lab.templates.length <= 1) return;
	  const templates = lab.templates.filter((_, i) => i !== index);
	  const selectedTemplateIndex = Math.min(lab.selectedTemplateIndex, templates.length - 1);
	  lab = { ...lab, templates, selectedTemplateIndex };
	}

	function updateTemplate(template: PuzzleTemplate) {
	  const templates = lab.templates.map((t, i) =>
	    i === lab.selectedTemplateIndex ? template : t
	  );
	  lab = { ...lab, templates };
	}

	const templateDefaultPigment = $derived(
	  selectedTemplate
	    ? (selectedTemplate.shape.flat().find((cell) => cell !== 0) ?? (monochrome ? 1 : 4)) as Pigment
	    : (1 as Pigment)
	);

	function updateTemplateDefaultPigment(pigment: Pigment) {
	  if (!selectedTemplate) return;
	  const shape = selectedTemplate.shape.map((row) =>
	    row.map((cell) => (cell !== 0 ? pigment : (0 as Pigment)))
	  );
	  updateTemplate({ shape });
	}

	function setTemplateSize(rows: number, cols: number) {
	  if (!selectedTemplate) return;
	  updateTemplate(resizeTemplate(selectedTemplate, rows, cols));
	}

	function rotateSelectedTemplate() {
	  if (!selectedTemplate) return;
	  applyError = null;
	  updateTemplate(rotateLabTemplate(selectedTemplate));
	}

	function applySelectedTemplateToStart() {
	  if (!selectedTemplate) return;
	  applyError = null;
	  if (!templateHasActiveCells(selectedTemplate)) {
	    applyError = 'Template has no active cells.';
	    return;
	  }
	  if (!templateFitsAt(lab.gridSize, selectedTemplate, applyRow, applyCol)) {
	    applyError = 'Template does not fit at that position on the grid.';
	    return;
	  }
	  updateStartState(
	    applyTemplateToStartState(lab.startState, selectedTemplate, applyRow, applyCol)
	  );
	}

	function clearStartGrid() {
	  lab = {
	    ...lab,
	    startState: resizeGrid(lab.startState, lab.gridSize, LAB_SOLVED_VALUE)
	  };
	}

	function runValidation() {
	  validation = validateLabConfig(config);
	}

	function loadExample() {
	  lab = configToLabState(EXAMPLE_CONFIG);
	  importText = exportConfigJson(EXAMPLE_CONFIG);
	  importError = null;
	  validation = null;
	}

	function applyImport() {
	  importError = null;
	  try {
	    const parsed = parseConfigJson(importText);
	    lab = configToLabState(parsed);
	    validation = validateLabConfig(labStateToConfig(lab));
	  } catch (e) {
	    importError = e instanceof Error ? e.message : 'Invalid JSON';
	  }
	}

	function refreshExport() {
	  exportText = exportConfigJson(config);
	  validation = validateLabConfig(config);
	}

	async function copyExport() {
	  refreshExport();
	  try {
	    await navigator.clipboard.writeText(exportText);
	    copyMessage = 'Copied to clipboard';
	    setTimeout(() => {
	      copyMessage = null;
	    }, 2000);
	  } catch {
	    copyMessage = 'Copy failed — select the JSON manually';
	  }
	}

	const pigments: Pigment[] = [0, 1, 2, 3, 4, 5, 6, 7];
</script>

<svelte:head>
	<title>Puzzle Lab — Flip (dev)</title>
</svelte:head>

{#if viewMode === 'play'}
	<PuzzlePlayLayout backHref="/dev/puzzle-lab" backLabel="← Back to editor" title="Puzzle Lab — Play test">
		{#snippet sidePanel()}
			<div class="lab-play-side">
				<p class="lab-play-note">Testing the current configuration. Return to edit to change grids or templates.</p>
				<button type="button" class="lab-btn lab-btn-secondary" onclick={() => (viewMode = 'edit')}>
					Back to editor
				</button>
			</div>
		{/snippet}
		{#key configKey}
			<Puzzle puzzleConfig={config} packName="Puzzle Lab" puzzleId={1} />
		{/key}
	</PuzzlePlayLayout>
{:else}
	<div class="lab-page">
		<PageHeader backHref="/" backLabel="← Home" title="Puzzle Lab" trailingLabel="dev" />

		<main class="lab-main">
			<aside class="lab-sidebar">
				<div class="lab-panel">
					<h2 class="lab-panel-title">Puzzle settings</h2>
					<p class="lab-solved-note">Solved state is always an empty white grid.</p>
					<label class="lab-field">
						<span>Grid size</span>
						<input
							type="number"
							min="2"
							max="12"
							value={lab.gridSize}
							onchange={(e) => setGridSize(Number(e.currentTarget.value))}
						/>
					</label>

					<div class="lab-field-row">
						<button type="button" class="lab-btn lab-btn-ghost" onclick={clearStartGrid}>
							Clear grid (white)
						</button>
					</div>

					<label class="lab-checkbox">
						<input
							type="checkbox"
							checked={lab.allowTemplateRotation}
							onchange={(e) => {
							  lab = { ...lab, allowTemplateRotation: e.currentTarget.checked };
							}}
						/>
						Allow template rotation
					</label>

					<label class="lab-field">
						<span>Par (minMovesToSolve)</span>
						<input
							type="number"
							min="1"
							max="20"
							placeholder="optional"
							value={lab.minMovesToSolve ?? ''}
							onchange={(e) => {
							  const raw = e.currentTarget.value;
							  lab = {
							    ...lab,
							    minMovesToSolve: raw === '' ? null : Number(raw)
							  };
							}}
						/>
					</label>
				</div>

				<div class="lab-panel">
					<div class="lab-panel-header">
						<h2 class="lab-panel-title">Templates</h2>
						<button type="button" class="lab-btn lab-btn-small" onclick={addTemplate}>+ Add</button>
					</div>
					<ul class="lab-template-list">
						{#each lab.templates as template, index}
							<li>
								<button
									type="button"
									class="lab-template-tab"
									class:active={lab.selectedTemplateIndex === index}
									onclick={() => {
									  lab = { ...lab, selectedTemplateIndex: index };
									}}
								>
									Template {index + 1}
									<span class="lab-template-meta">{templateSummaryLabel(template)}</span>
								</button>
								{#if lab.templates.length > 1}
									<button
										type="button"
										class="lab-template-remove"
										aria-label={`Remove template ${index + 1}`}
										onclick={() => removeTemplate(index)}
									>
										×
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				</div>

				<div class="lab-panel">
					<h2 class="lab-panel-title">Validate & export</h2>
					<div class="lab-field-row">
						<button type="button" class="lab-btn" onclick={runValidation}>Validate</button>
						<button type="button" class="lab-btn lab-btn-secondary" onclick={() => (viewMode = 'play')}>
							Play test
						</button>
					</div>
					{#if validation}
						<ul class="lab-validation" class:ok={validation.ok} class:bad={!validation.ok}>
							{#each validation.messages as message}
								<li>{message}</li>
							{/each}
						</ul>
					{/if}
					<div class="lab-field-row">
						<button type="button" class="lab-btn lab-btn-ghost" onclick={refreshExport}>Refresh JSON</button>
						<button type="button" class="lab-btn" onclick={copyExport}>Copy JSON</button>
					</div>
					{#if copyMessage}
						<p class="lab-copy-msg">{copyMessage}</p>
					{/if}
					<textarea class="lab-json" readonly rows="8" bind:value={exportText} placeholder="Click Refresh JSON to preview export"></textarea>
				</div>

				<div class="lab-panel">
					<h2 class="lab-panel-title">Import</h2>
					<button type="button" class="lab-btn lab-btn-ghost" onclick={loadExample}>Load example</button>
					<textarea
						class="lab-json"
						rows="6"
						placeholder="Paste PuzzleConfig JSON…"
						bind:value={importText}
					></textarea>
					{#if importError}
						<p class="lab-error">{importError}</p>
					{/if}
					<button type="button" class="lab-btn" onclick={applyImport}>Apply import</button>
				</div>
			</aside>

			<section class="lab-canvas">
				<GridEditor
					label="Start state"
					mode="pigment"
					grid={lab.startState}
					monochromePreview={monochrome}
					cellSize={44}
					onChange={(grid) => updateStartState(grid as typeof lab.startState)}
				/>

				{#if selectedTemplate}
					<div class="lab-template-editor">
						<h2 class="lab-section-title">Edit template {lab.selectedTemplateIndex + 1}</h2>
						<div class="lab-template-controls">
							<label class="lab-field">
								<span>Default pigment</span>
								<select
									value={templateDefaultPigment}
									onchange={(e) => updateTemplateDefaultPigment(Number(e.currentTarget.value) as Pigment)}
								>
									{#each pigments as pigment}
										{#if pigment !== 0}
											<option value={pigment}>{PIGMENT_NAME[pigment]} ({pigment})</option>
										{/if}
									{/each}
								</select>
							</label>
							<label class="lab-field">
								<span>Rows</span>
								<input
									type="number"
									min="1"
									max="12"
									value={templateRows}
									onchange={(e) =>
									  setTemplateSize(Number(e.currentTarget.value), templateCols)}
								/>
							</label>
							<label class="lab-field">
								<span>Cols</span>
								<input
									type="number"
									min="1"
									max="12"
									value={templateCols}
									onchange={(e) =>
									  setTemplateSize(templateRows, Number(e.currentTarget.value))}
								/>
							</label>
						</div>
						<div class="lab-template-actions">
							<button type="button" class="lab-btn lab-btn-ghost" onclick={rotateSelectedTemplate}>
								Rotate lens 90°
							</button>
							<div class="lab-apply-row">
								<label class="lab-field lab-field-inline">
									<span>Apply at row</span>
									<input
										type="number"
										min="0"
										max={lab.gridSize - 1}
										bind:value={applyRow}
									/>
								</label>
								<label class="lab-field lab-field-inline">
									<span>col</span>
									<input
										type="number"
										min="0"
										max={lab.gridSize - 1}
										bind:value={applyCol}
									/>
								</label>
								<button type="button" class="lab-btn" onclick={applySelectedTemplateToStart}>
									Apply to start state
								</button>
							</div>
							{#if applyError}
								<p class="lab-error">{applyError}</p>
							{/if}
							<p class="lab-apply-hint">
								Toggles color on covered squares (same XOR rules as play mode). Adjust row/col for placement.
							</p>
						</div>
						<TemplateEditor
							template={selectedTemplate}
							cellSize={40}
							onChange={updateTemplate}
						/>
					</div>
				{/if}
			</section>
		</main>
	</div>
{/if}

<style>
	/* Fixed overlay so the lab isn't crushed by the root layout + footer. */
	.lab-page {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: #f9fafb;
	}

	.lab-main {
		display: flex;
		flex: 1 1 0;
		min-height: 0;
		gap: 1rem;
		padding: 0.75rem 1rem 1rem;
		max-width: 72rem;
		margin: 0 auto;
		width: 100%;
		overflow: hidden;
	}

	.lab-sidebar {
		flex: 0 0 18rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		min-height: 0;
	}

	.lab-panel {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.lab-panel-title {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #111827;
	}

	.lab-solved-note {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.lab-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.lab-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: #4b5563;
	}

	.lab-field input,
	.lab-field select,
	.lab-json {
		font: inherit;
		font-size: 0.8125rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 0.375rem 0.5rem;
		background: white;
	}

	.lab-field-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.lab-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #374151;
	}

	.lab-btn {
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.4375rem 0.75rem;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		background: #4f46e5;
		color: white;
	}

	.lab-btn:hover {
		background: #4338ca;
	}

	.lab-btn-secondary {
		background: #111827;
	}

	.lab-btn-secondary:hover {
		background: #1f2937;
	}

	.lab-btn-ghost {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #e5e7eb;
	}

	.lab-btn-ghost:hover {
		background: #e5e7eb;
	}

	.lab-btn-small {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.lab-template-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.lab-template-list li {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.lab-template-tab {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: #f9fafb;
		font-size: 0.8125rem;
		cursor: pointer;
	}

	.lab-template-tab.active {
		border-color: #6366f1;
		background: #eef2ff;
	}

	.lab-template-meta {
		font-size: 0.6875rem;
		color: #6b7280;
	}

	.lab-template-remove {
		width: 1.75rem;
		height: 1.75rem;
		border: none;
		border-radius: 6px;
		background: #fee2e2;
		color: #b91c1c;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}

	.lab-validation {
		margin: 0;
		padding: 0.5rem 0.625rem;
		border-radius: 6px;
		font-size: 0.75rem;
		list-style: disc;
		padding-left: 1.25rem;
	}

	.lab-validation.ok {
		background: #ecfdf5;
		color: #065f46;
	}

	.lab-validation.bad {
		background: #fef2f2;
		color: #991b1b;
	}

	.lab-json {
		width: 100%;
		resize: vertical;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.6875rem;
	}

	.lab-copy-msg {
		margin: 0;
		font-size: 0.75rem;
		color: #059669;
	}

	.lab-error {
		margin: 0;
		font-size: 0.75rem;
		color: #dc2626;
	}

	.lab-canvas {
		flex: 1 1 0;
		min-width: 0;
		min-height: 12rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 0.5rem;
	}

	.lab-template-editor {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
	}

	.lab-section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
	}

	.lab-template-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.lab-template-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.lab-apply-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.lab-field-inline {
		flex: 0 0 auto;
		min-width: 4.5rem;
	}

	.lab-apply-hint {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.lab-play-side {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		font-size: 0.75rem;
		color: #4b5563;
	}

	.lab-play-note {
		margin: 0;
		line-height: 1.4;
	}

	@media (max-width: 900px) {
		.lab-main {
			flex-direction: column;
			overflow-y: auto;
		}

		.lab-canvas {
			order: -1;
			flex: 0 0 auto;
			overflow: visible;
		}

		.lab-sidebar {
			flex: 0 0 auto;
			max-height: none;
			overflow: visible;
		}
	}
</style>
