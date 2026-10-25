/**
 * GreenClaim Lens - Evaluation Hard Quality & Safety Gates
 * Enforces quality thresholds for release candidate readiness and CI gates.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_RULES } from '@greenclaim/core';
import { type EvaluationReport, type GoldenRecord, evaluateDataset } from './index.js';

export interface EvalGateConfig {
  minAccuracy: number;
  minMacroF1: number;
  maxFalseAccusationRate: number;
  minCitationValidity: number;
}

export const DEFAULT_EVAL_GATES: EvalGateConfig = {
  minAccuracy: 0.95, // 95% overall accuracy
  minMacroF1: 0.9, // 90% Macro-F1 across all 4 verdict classes
  maxFalseAccusationRate: 0.0, // 0.0% false-accusation rate (strict safety ceiling)
  minCitationValidity: 1.0, // 100% citation validity (cite or abstain)
};

export interface GateCheckResult {
  passed: boolean;
  failures: string[];
}

export function checkEvalGates(
  report: EvaluationReport,
  gates: EvalGateConfig = DEFAULT_EVAL_GATES,
): GateCheckResult {
  const failures: string[] = [];

  if (report.accuracy < gates.minAccuracy) {
    failures.push(
      `Accuracy ${(report.accuracy * 100).toFixed(1)}% is below threshold of ${(gates.minAccuracy * 100).toFixed(1)}%`,
    );
  }

  if (report.macroF1 < gates.minMacroF1) {
    failures.push(
      `Macro-F1 ${(report.macroF1 * 100).toFixed(1)}% is below threshold of ${(gates.minMacroF1 * 100).toFixed(1)}%`,
    );
  }

  if (report.falseAccusationRate > gates.maxFalseAccusationRate) {
    failures.push(
      `False-accusation rate ${(report.falseAccusationRate * 100).toFixed(2)}% exceeds ceiling of ${(gates.maxFalseAccusationRate * 100).toFixed(2)}%`,
    );
  }

  if (report.citationValidity < gates.minCitationValidity) {
    failures.push(
      `Citation validity ${(report.citationValidity * 100).toFixed(1)}% is below required ${(gates.minCitationValidity * 100).toFixed(1)}%`,
    );
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

async function runCliGate() {
  console.log('🛡️  GreenClaim Lens — Verifying Evaluation Quality & Safety Gates...');

  const dataPath = resolve(process.cwd(), '../../data/golden/golden_v0.json');
  const raw = readFileSync(dataPath, 'utf-8');
  const dataset = JSON.parse(raw) as GoldenRecord[];

  const report = evaluateDataset(dataset, DEFAULT_RULES);
  const gateResult = checkEvalGates(report, DEFAULT_EVAL_GATES);

  console.log(`\nResults against ${dataset.length} golden cases:`);
  console.log(
    `- Accuracy:              ${(report.accuracy * 100).toFixed(1)}% (Threshold: >= ${(DEFAULT_EVAL_GATES.minAccuracy * 100).toFixed(1)}%)`,
  );
  console.log(
    `- Macro-F1:              ${(report.macroF1 * 100).toFixed(1)}% (Threshold: >= ${(DEFAULT_EVAL_GATES.minMacroF1 * 100).toFixed(1)}%)`,
  );
  console.log(
    `- False-Accusation Rate: ${(report.falseAccusationRate * 100).toFixed(2)}% (Ceiling:   <= ${(DEFAULT_EVAL_GATES.maxFalseAccusationRate * 100).toFixed(2)}%)`,
  );
  console.log(
    `- Citation Validity:     ${(report.citationValidity * 100).toFixed(1)}% (Threshold: == ${(DEFAULT_EVAL_GATES.minCitationValidity * 100).toFixed(1)}%)`,
  );

  if (!gateResult.passed) {
    console.error('\n❌ EVALUATION GATE FAILED:');
    for (const fail of gateResult.failures) {
      console.error(`  - ${fail}`);
    }
    process.exit(1);
  }

  console.log('\n✅ ALL EVALUATION HARD GATES PASSED SUCCESSFULLY.\n');
}

if (process.argv[1]?.endsWith('gate.js') || process.argv[1]?.endsWith('gate.ts')) {
  runCliGate().catch((err) => {
    console.error('Gate check failed:', err);
    process.exit(1);
  });
}
