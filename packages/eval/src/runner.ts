import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_RULES } from '@greenclaim/core';
import { type GoldenRecord, evaluateDataset, generateMarkdownReport } from './index.js';

async function main() {
  console.log('🌿 GreenClaim Lens — Running Evaluation Benchmark...');

  // Locate data/golden/golden_v0.json
  const dataPath = resolve(process.cwd(), '../../data/golden/golden_v0.json');
  console.log(`Loading golden dataset from: ${dataPath}`);

  const raw = readFileSync(dataPath, 'utf-8');
  const dataset = JSON.parse(raw) as GoldenRecord[];

  console.log(`Evaluating ${dataset.length} items against ${DEFAULT_RULES.length} rules...`);
  const report = evaluateDataset(dataset, DEFAULT_RULES);

  console.log('\n================ EVALUATION SUMMARY ================');
  console.log(`Cases Evaluated:           ${report.totalCases}`);
  console.log(`Overall Accuracy:          ${(report.accuracy * 100).toFixed(1)}%`);
  console.log(`Macro-F1 Score:            ${(report.macroF1 * 100).toFixed(1)}%`);
  console.log(`False-Accusation Rate:     ${(report.falseAccusationRate * 100).toFixed(1)}%`);
  console.log(`Citation Validity:         ${(report.citationValidity * 100).toFixed(1)}%`);
  console.log(`Rule-Only Resolution:      ${(report.ruleOnlyResolutionRate * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  // Hard safety gates verification
  if (report.falseAccusationRate > 0.05) {
    console.error('❌ FAIL: False-accusation rate exceeds 5.0% safety ceiling.');
    process.exit(1);
  }

  if (report.citationValidity < 1.0) {
    console.error('❌ FAIL: Citation validity must be 100%.');
    process.exit(1);
  }

  // Generate markdown report and write to docs/EVAL_RESULTS.md
  const markdown = generateMarkdownReport(report);
  const evalResultsPath = resolve(process.cwd(), '../../docs/EVAL_RESULTS.md');
  writeFileSync(evalResultsPath, markdown, 'utf-8');
  console.log(`✅ Evaluation report saved to: ${evalResultsPath}`);
}

main().catch((err) => {
  console.error('Eval run failed:', err);
  process.exit(1);
});
