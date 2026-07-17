export type {
	Pigment,
	PuzzleGrid,
	PuzzleTemplate,
	PuzzleConfig,
	PuzzlePack,
	PackDefinition
} from './types.js';
export {
	PIGMENT_HEX,
	PIGMENT_NAME,
	MONO_FLIP_SOLVED_VALUE,
	PIGMENT_CLEAR_SOLVED_VALUE
} from './types.js';
export {
	packs,
	getPackBySlug,
	getPuzzleById,
	getNextPuzzleId,
	getPackPuzzleCount
} from './packs.js';
export {
	applyTemplate,
	isSolved,
	isPuzzleSolved,
	isPuzzleComplete,
	allTemplatesUsed,
	fullTemplateUsedMask,
	rotateRight,
	orientTemplate,
	areAllElementsOne,
	getValidPositions,
	getCenteredPosition
} from './PuzzleFunctions.js';
export {
	getTemplateCellPigment,
	distinctPigmentsInTemplate,
	isMultiColoredTemplate,
	isTemplateCellActive,
	maskToUnifiedShape,
	normalizeTemplate,
	migrateSplitTemplate
} from './templatePigment.js';
export { overwriteWithSubmatrix, getSubmatrix, elementWiseOperation } from './MatrixFunctions.js';
export { normalizePuzzleConfig, isMonochromeFlipPuzzle } from './puzzleNormalize.js';
export { serializePuzzleForStorage, parseStoredPuzzle } from './storedPuzzle.js';
export { getValidPuzzle } from './PuzzleValidator.js';
export type { HintMove } from './PuzzleHint.js';
export { findHintMove } from './PuzzleHint.js';
export {
	compositeDifficultyScore,
	evaluateForgivenessMetrics,
	forgivenessEaseScore,
	mechanicsDifficultyScore,
	structuralDifficultyScore
} from './puzzleForgiveness.js';
export type { ForgivenessMetrics } from './puzzleForgiveness.js';
export type { DifficultyPillars, DifficultyReport, SolutionMove } from './puzzleDifficulty.js';
export { evaluatePuzzleDifficulty, findShortestSolution } from './puzzleDifficulty.js';
export { DEFAULT_SOLVER_MAX_DEPTH } from './puzzleSolver.js';
export type { SearchBudget, SearchBudgetContext } from './searchBudget.js';
export {
	AUTHORING_BASE_DEPTH,
	AUTHORING_GRID_STEP,
	AUTHORING_MAX_DEPTH_CAP,
	PACK_SEARCH_BUDGET_OVERRIDES,
	RUNTIME_HINT_MAX_DEPTH,
	authoringMaxDepthForGridSize,
	gridSizeFromConfig,
	resolveSearchBudget
} from './searchBudget.js';
export type { GeneratedPuzzleConfig, GeneratorConfig } from './PuzzleGenerator.js';
export { gridToKey, canonicalizeGrid, getDistinctRotations } from './puzzleGrid.js';
export { generateVerifiedPuzzle, solveMinMoves, solveMinMovesGridOnly } from './PuzzleGenerator.js';
export type {
	PuzzleKind,
	PuzzleSlotSpec,
	PackGenerationSpec,
	PackPoolConfig,
	ScramblePolicy
} from './packGeneration.js';
export { DEFAULT_SCRAMBLE_POLICY } from './packGeneration.js';
export {
	buildGeneratorConfig,
	generatePackDefinition,
	generatePackFromSpec,
	generateVerifiedPuzzleForSlot,
	inferPuzzleKind,
	repeatSlot,
	stripGeneratedPuzzle,
	templateSizesFromCount,
	validatePuzzleSlot,
	PACK_GENERATION_STRATEGIES,
	poolPackStrategy,
	resolvePackStrategy,
	slotPackStrategy,
	type PackGenerationContext,
	type PackGenerationStrategy
} from './packGeneration.js';
export type {
	CandidateScoreInput,
	CandidateScorer,
	DifficultyEvaluationOptions,
	DifficultyEvaluationProfile,
	DifficultyEvaluator,
	GenerationServices,
	MinMovesSolver
} from './generation/generationServices.js';
export {
	compositeCandidateScorer,
	composableDifficultyEvaluator,
	ComposableDifficultyEvaluator,
	defaultDifficultyEvaluator,
	defaultDifficultyMetrics,
	defaultGenerationServices,
	defaultMinMovesSolver
} from './generation/generationServices.js';
export {
	resolveDifficultyOptions,
	type ResolvedDifficultyOptions
} from './generation/difficultyProfiles.js';
export type {
	SolvabilityAnalysisOptions,
	SolvabilityAnalyzer,
	SolvabilityReport
} from './generation/solvabilityAnalyzer.js';
export {
	defaultSolvabilityAnalyzer,
	Gf2SolvabilityAnalyzer
} from './generation/solvabilityAnalyzer.js';
export type {
	MuseActionPolicy,
	MuseAnalyzer,
	MuseOptions,
	MuseReport
} from './generation/museAnalyzer.js';
export { defaultMuseAnalyzer, UniformSolutionEntropyAnalyzer } from './generation/museAnalyzer.js';
export type {
	PedagogicalReport,
	PedagogyConceptId,
	PedagogyValidator
} from './generation/pedagogyValidator.js';
export {
	createPedagogyValidator,
	defaultPedagogyValidator
} from './generation/pedagogyValidator.js';
export {
	getConceptLabel,
	getConceptRules,
	PEDAGOGY_CONCEPT_RULES
} from './generation/pedagogyConcepts.js';
export type {
	PedagogyRule,
	PedagogyRuleResult,
	PedagogyValidationContext
} from './generation/pedagogyRules.js';
export {
	requiresColorChanges,
	requiresEveryTemplate,
	requiresMinMoves,
	requiresMinTemplates,
	requiresTemplateRotation
} from './generation/pedagogyRules.js';
export { computeMuse, computeDistanceToGoalMap, uniformActionEntropy } from './puzzleEntropy.js';
export type {
	PuzzleSearchSession,
	PuzzleSearchSessionOptions,
	PuzzleReachability,
	SearchPlacement
} from './puzzleSearchSession.js';
export {
	buildPuzzleSearchSession,
	buildPuzzleReachability,
	enumerateSearchPlacements,
	makePuzzleStateKeyFn,
	getShortestPath,
	getMinMoves,
	findMinMovesBfs,
	DEFAULT_PUZZLE_SEARCH_MAX_DEPTH
} from './puzzleSearchSession.js';
export type { SolvabilityEncoding } from './puzzleSolvability.js';
export { analyzeSolvability, buildMoveMatrix } from './puzzleSolvability.js';
export type { CandidateScoreBreakdown } from './generation/candidateScoring.js';
export {
	compositeOnlyDifficultyScore,
	compositeScrambleDifficultyScore,
	museWeightedCandidateScorer,
	museWeightedDifficultyScore,
	scoreCandidateBreakdown
} from './generation/candidateScoring.js';
export type { PackCandidate } from './packPoolGeneration.js';
export {
	assemblePackFromPool,
	enrichCandidatesWithForgiveness,
	difficultyScore,
	generatePackCandidatePool,
	generatePackFromPoolSpec,
	pruneTemplatesUnusedInScramble,
	tryBuildScrambledCandidate
} from './packPoolGeneration.js';
export {
	COLOR_LAB_REGEN_SLOTS,
	FIRST_STEPS_REGEN_SLOTS,
	INTRO_PACK_REGEN_SLOTS,
	PACK_GENERATION_SPECS,
	getAutoGeneratedPackSlugs,
	getPackGenerationSpec
} from './packGenerationSpecs.js';
export type { PackGenerationRuntime } from './packGenerationRuntime.js';
export {
	COLOR_GENERATION_RUNTIME,
	MONO_GENERATION_RUNTIME,
	PACK_GENERATION_RUNTIME,
	resolveGenerationRuntime
} from './packGenerationRuntime.js';
export {
	MIN_TEMPLATE_ACTIVE_CELLS,
	FULL_2X2_MONO_ACTIVE_CELLS,
	countActiveCells,
	constrainMonoTemplateSizes,
	is2x2Shape,
	mono2x2TemplateIsFullyFilled,
	templateMeetsMinActiveCells,
	templateMeetsMonoSquareFillRule
} from './templateShape.js';
export {
	MIN_SOLUTION_GRID_COVERAGE_FRACTION,
	countSolutionCellApplications,
	countSolutionGridCoverage,
	meetsMinSolutionGridCoverage,
	minSolutionGridCellsRequired
} from './solutionGridCoverage.js';
export type { SolutionCellTouchMetrics } from './solutionGridCoverage.js';
export {
	MIN_TEMPLATES_PER_PIGMENT_MULTI,
	countTemplatesByPigment,
	isMultiPigmentPuzzle,
	meetsMinTemplatesPerPigment,
	minTemplatesPerPigmentForAllowed,
	distinctPigmentsInPuzzle,
	meetsDistinctPigmentCount,
	meetsMaxPigmentsPerTemplate,
	pickPigmentPalette,
	requiredTemplateCount,
	validateMultiPigmentTemplateCounts
} from './pigmentTemplates.js';
export {
	canonicalPuzzleKey,
	canonicalTemplateKey,
	isAutoGeneratedPack,
	AUTO_GENERATED_PACK_SLUGS
} from './puzzleCanonical.js';
export {
	PRODUCTION_PACK_SLUGS,
	isProductionPack,
	type ProductionPackSlug
} from './productionPacks.js';
export { PACK_PRICES_CENTS, formatPackPriceUsd, getPackPriceUsd } from './packPricing.js';
export {
	FIRST_STEPS_SLUG,
	FIRST_STEPS_CONCEPTS,
	getFirstStepsConcept
} from './puzzles/firstSteps.js';
export { archivedFirstStepsPuzzle5 } from './puzzles/firstStepsArchive.js';
export {
	DAILY_MONO_CONFIG,
	DAILY_COLOR_CONFIG,
	epochDaysForDate,
	dailyGenerationKind,
	generateDailyPuzzle
} from './dailyGeneration.js';
