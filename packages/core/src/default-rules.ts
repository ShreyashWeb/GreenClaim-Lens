import type { RuleDefinition } from './schemas.js';

export const DEFAULT_RULES: RuleDefinition[] = [
  {
    id: 'GCL-001',
    title: 'Unqualified broad environmental terms',
    status: 'draft',
    severity: 'medium',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: [
        'eco-friendly',
        'eco friendly',
        'green',
        'planet-friendly',
        'planet friendly',
        'environmentally friendly',
        'sustainable',
        'earth-friendly',
      ],
      languages: ['en'],
      qualifier_terms: [
        'recycled',
        'post-consumer',
        'biodegradable within',
        'certified organic',
        'fsc certified',
        'gots certified',
      ],
      substantiation_patterns: [
        'certificate',
        'certified by',
        'standard',
        'license',
        'iso',
        'bis',
        'test report',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: "Generic broad terms such as 'eco-friendly' or 'green' require specific qualifying scope and accessible substantiation.",
    },
    remediation: {
      en: "Specify the exact environmental attribute (e.g. 'made with 40% post-consumer recycled plastic') and link a verifiable certificate or standard.",
    },
    tests: [
      {
        input: '100% eco-friendly packaging',
        expect: 'flag',
        notes: 'Broad term without qualification',
      },
      {
        input:
          'Eco-friendly bottle made with 50% post-consumer recycled PET (certificate: ISO-14021)',
        expect: 'pass',
        notes: 'Qualified with recycled content and ISO standard reference',
      },
    ],
  },
  {
    id: 'GCL-002',
    title: 'Absolute environmental claim without complete lifecycle substantiation',
    status: 'draft',
    severity: 'high',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: [
        '100% natural',
        '100% green',
        '100% eco',
        'zero emission',
        'zero carbon',
        'zero impact',
        'completely natural',
        'purely organic',
      ],
      languages: ['en'],
      qualifier_terms: ['scope 1 and 2 only', 'packaging only', 'certified organic under npop'],
      substantiation_patterns: [
        'lca report',
        'life cycle assessment',
        'iso 14040',
        'third-party audit',
        'certificate',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: "Absolute claims like '100% natural' or 'zero emission' require proof across the entire lifecycle or clear qualification of scope.",
    },
    remediation: {
      en: "Avoid absolute terms like '100%' or 'zero' unless supported by a published Life Cycle Assessment (LCA) or restricted to a specific qualified component.",
    },
    tests: [
      {
        input: 'Guaranteed 100% natural fabric without chemicals',
        expect: 'flag',
        notes: 'Absolute assertion without scope qualification',
      },
      {
        input:
          '100% natural cotton: certified organic under NPOP (certificate: NPOP/NAB/001) for packaging only',
        expect: 'pass',
        notes: 'Qualified scope and accredited certificate',
      },
    ],
  },
  {
    id: 'GCL-003',
    title: 'Comparative environmental claim without verifiable baseline',
    status: 'draft',
    severity: 'high',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: [
        'greener than before',
        'more eco-friendly than',
        'less plastic than before',
        'cleaner than previous',
        'greener than leading brand',
        'more sustainable than standard',
      ],
      languages: ['en'],
      qualifier_terms: [
        'compared to 2022 baseline',
        'vs 2023 formulation',
        'measured against standard formula',
        'baseline comparison',
      ],
      substantiation_patterns: [
        'audit report',
        'lca report',
        'baseline study',
        'comparative study',
        'certificate',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: 'Comparative claims require an explicit, verifiable baseline and substantiated methodology.',
    },
    remediation: {
      en: 'State the comparison baseline (year/product) and publish the comparative test report.',
    },
    tests: [
      {
        input: 'Now 50% greener than before!',
        expect: 'flag',
        notes: 'No baseline year or product specified',
      },
      {
        input:
          'Contains 30% less plastic than before (compared to 2022 baseline, audit report #2024-PL)',
        expect: 'pass',
        notes: 'Specific baseline and report cited',
      },
    ],
  },
  {
    id: 'GCL-004',
    title: 'Future aspirational claim without clear roadmap or interim targets',
    status: 'draft',
    severity: 'medium',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: [
        'net zero by 2030',
        'net zero by 2040',
        'carbon neutral by 2030',
        'plastic free by 2025',
        'committed to zero emissions',
      ],
      languages: ['en'],
      qualifier_terms: [
        'interim milestone',
        'published roadmap',
        'transition plan',
        'interim target of',
      ],
      substantiation_patterns: [
        'transition report',
        'sbti validated',
        'sbti target',
        'annual progress report',
        'https://',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: 'Aspirational environmental targets must be supported by a concrete transition plan and verifiable interim milestones.',
    },
    remediation: {
      en: 'Include published interim targets, verification body validation (e.g. SBTi), and public roadmap link.',
    },
    tests: [
      {
        input: 'We will achieve net zero by 2030 across all operations',
        expect: 'flag',
        notes: 'Future target without interim roadmap',
      },
      {
        input:
          'Committed to net zero by 2030 with published roadmap and interim target of 50% cut by 2026 (SBTi validated)',
        expect: 'pass',
        notes: 'Verified transition plan with interim target',
      },
    ],
  },
  {
    id: 'GCL-005',
    title: 'Carbon neutral claim relying on offsets without explicit disclosure',
    status: 'draft',
    severity: 'high',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: ['carbon neutral', 'climate neutral', 'carbon positive', 'carbon negative'],
      languages: ['en'],
      qualifier_terms: [
        'gross emissions reduced by',
        'offsetting remaining emissions',
        'verified carbon credits',
      ],
      substantiation_patterns: [
        'verra registry',
        'gold standard',
        'registry id',
        'iso 14064',
        'audit report',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: 'Claims of carbon neutrality must distinguish between direct emissions reductions and carbon credits/offsets, providing accredited registry details.',
    },
    remediation: {
      en: 'Disclose gross emissions reductions achieved before offsetting, and cite the offset standard and public registry ID.',
    },
    tests: [
      {
        input: 'This delivery is 100% carbon neutral',
        expect: 'flag',
        notes: 'Unsubstantiated neutrality claim',
      },
      {
        input:
          'Carbon neutral delivery: gross emissions reduced by 40% with remaining offsets under Gold Standard (registry id: GS-2024-99)',
        expect: 'pass',
        notes: 'Disclosed reductions and verified registry ID',
      },
    ],
  },
  {
    id: 'GCL-006',
    title: 'Unsubstantiated eco-label or certification claim',
    status: 'draft',
    severity: 'high',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: [
        'certified green',
        'eco-certified',
        'green approved',
        'eco certified',
        'green certified',
        'verified eco-friendly',
      ],
      languages: ['en'],
      qualifier_terms: [
        'certified under ecomark',
        'ecomark scheme',
        'bis certified',
        'fsc 100%',
        'energy star',
      ],
      substantiation_patterns: [
        'license no',
        'cert no',
        'bis license',
        'certification code',
        'tested under standard',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: 'Eco-labels and green certification claims require an authorized certification scheme and verifiable license/registration details.',
    },
    remediation: {
      en: 'Specify the accredited certification scheme (e.g. BIS Ecomark) and display the verifiable license code.',
    },
    tests: [
      {
        input: 'Certified green packaging for home delivery',
        expect: 'flag',
        notes: 'Vague green seal claim without scheme details',
      },
      {
        input:
          'Eco-certified packaging: BIS certified under Ecomark scheme (license no: CM/L-1234567)',
        expect: 'pass',
        notes: 'Official Ecomark scheme and license code',
      },
    ],
  },
  {
    id: 'GCL-007',
    title: 'Unqualified biodegradability or compostability claim',
    status: 'draft',
    severity: 'medium',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: ['biodegradable', 'compostable', 'degradable plastic', 'oxodegradable'],
      languages: ['en'],
      qualifier_terms: [
        'compostable in industrial facilities within 180 days',
        'biodegradable in soil within 12 months',
        'home compostable within 90 days',
        'as per is/iso 17088',
      ],
      substantiation_patterns: [
        'is 17088',
        'iso 17088',
        'cpcb certificate',
        'cpcb registration',
        'lab test report',
      ],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: 'Biodegradability and compostability claims must specify the required disposal environment, timeframe, and accredited test standard.',
    },
    remediation: {
      en: 'Specify testing standard (e.g. IS/ISO 17088), degradation timeframe, and CPCB registration number.',
    },
    tests: [
      {
        input: '100% biodegradable carry bag',
        expect: 'flag',
        notes: 'Missing condition, timeframe, and CPCB standard',
      },
      {
        input:
          'Biodegradable bag: home compostable within 90 days as per IS/ISO 17088 (CPCB certificate: CPCB/WMC/2024/01)',
        expect: 'pass',
        notes: 'Fully qualified condition and CPCB certificate',
      },
    ],
  },
  {
    id: 'GCL-008',
    title: 'Unqualified Hindi broad environmental terms',
    status: 'draft',
    severity: 'medium',
    source: {
      document: 'CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024',
      clause: '<TODO: verify against official text>',
      url: '<TODO: verify against official text>',
      retrieved_on: '2024-10-25',
    },
    detect: {
      type: 'lexicon',
      terms: ['पर्यावरण अनुकूल', 'इको-फ्रेंडली', 'इको फ्रेंडली', 'प्राकृतिक रूप से सुरक्षित', 'प्रकृति के अनुकूल'],
      languages: ['hi'],
      qualifier_terms: ['पुनर्चक्रित', 'प्रमाणित', 'बायोडिग्रेडेबल'],
      substantiation_patterns: ['प्रमाणपत्र', 'मानक', 'iso', 'bis', 'certificate'],
    },
    requires: ['qualifier', 'substantiation_reference'],
    outcome_if_missing: 'flag',
    explain: {
      en: "Hindi environmental terms such as 'पर्यावरण अनुकूल' require qualifying scope and verifiable substantiation.",
      hi: 'पर्यावरण अनुकूल जैसे सामान्य दावों के लिए विशिष्ट विवरण और सत्यापन प्रमाण आवश्यक हैं।',
    },
    remediation: {
      en: 'Provide specific percentage and verification certificate reference.',
      hi: 'विशिष्ट प्रतिशत बताएं और सत्यापन प्रमाणपत्र संख्या संलग्न करें।',
    },
    tests: [
      {
        input: '100% पर्यावरण अनुकूल पैकेजिंग',
        expect: 'flag',
        notes: 'Unqualified Hindi broad claim',
      },
      {
        input: '40% पुनर्चक्रित सामग्री से निर्मित पर्यावरण अनुकूल बैग (प्रमाणपत्र: ISO-14021)',
        expect: 'pass',
        notes: 'Qualified with recycled percentage and standard',
      },
    ],
  },
];
