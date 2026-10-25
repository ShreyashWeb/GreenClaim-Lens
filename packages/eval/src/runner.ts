import { runEvaluationBaseline } from './index.js';

async function main() {
  console.log('Running GreenClaim Lens golden dataset evaluation...');
  const result = await runEvaluationBaseline();
  console.log('Baseline eval metrics:');
  console.log(`- Status: ${result.status}`);
  console.log(`- Cases evaluated: ${result.totalCases}`);
  console.log(`- Macro F1: ${result.macroF1}`);
  console.log(`- False Accusation Rate: ${result.falseAccusationRate}`);
  console.log(`- Citation Validity: ${result.citationValidity * 100}%`);
}

main().catch((err) => {
  console.error('Eval run failed:', err);
  process.exit(1);
});
