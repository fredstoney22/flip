/**
 * Injectable pedagogy validation strategy.
 *
 * Separate from puzzle generation — the reverse-shuffle generator does not
 * call this unless you inject a validator via {@link GenerationServices}.
 */

import type { PuzzleConfig } from '../types.js';
import { getConceptRules, type PedagogyConceptId } from './pedagogyConcepts.js';
import {
	type PedagogyRuleResult,
	type PedagogyValidationContext
} from './pedagogyRules.js';

export type { PedagogyConceptId };

export interface PedagogicalReport {
	targetConcept: PedagogyConceptId;
	passes: boolean;
	checks: Array<{ ruleId: string; passed: boolean; detail?: string }>;
}

export interface PedagogyValidator {
	validateConcept(config: PuzzleConfig, conceptId: PedagogyConceptId): PedagogicalReport;
}

export function createPedagogyValidator(
	ctx: PedagogyValidationContext = {}
): PedagogyValidator {
	const context: PedagogyValidationContext = { maxDepth: 12, ...ctx };

	return {
		validateConcept(config, conceptId) {
			const rules = getConceptRules(conceptId);
			if (!rules) {
				return {
					targetConcept: conceptId,
					passes: false,
					checks: [
						{
							ruleId: 'unknown-concept',
							passed: false,
							detail: `No pedagogy rules mapped for concept ${String(conceptId)}`
						}
					]
				};
			}

			const checks = rules.map((rule) => {
				const result: PedagogyRuleResult = rule.validate(config, context);
				return {
					ruleId: rule.id,
					passed: result.passed,
					detail: result.detail
				};
			});

			return {
				targetConcept: conceptId,
				passes: checks.every((check) => check.passed),
				checks
			};
		}
	};
}

export const defaultPedagogyValidator: PedagogyValidator = createPedagogyValidator();
