import { type Chunk, chunkDocument } from './chunker.js';

export const OFFICIAL_CORPUS: Chunk[] = [
  ...chunkDocument({
    document: 'CCPA_2024',
    url: '<TODO: verify against official text>',
    version: '2024.1',
    sections: [
      {
        clause: 'Clause 4(1)',
        title: 'General Broad Terms Prohibition',
        text: 'Generic and broad environmental terms including eco-friendly, green, natural, sustainable, and planet-friendly must not be used without accessible qualifiers and reliable scientific substantiation.',
      },
      {
        clause: 'Clause 4(2)',
        title: 'Absolute Claims Qualification',
        text: 'Absolute claims such as 100% natural, zero emissions, or clean energy must be substantiated by accredited life-cycle assessment (LCA) data or restricted to the specific component verified.',
      },
      {
        clause: 'Clause 5(1)',
        title: 'Comparative Claims and Baselines',
        text: 'Comparative claims claiming a product is greener, cleaner, or less polluting than before or vs competitors must state an explicit baseline year or product, and cite verifiable test methodologies.',
      },
      {
        clause: 'Clause 6(1)',
        title: 'Aspirational and Future Claims',
        text: 'Future commitments such as net zero by 2030 or plastic-free by 2025 must be accompanied by published transition roadmaps, measurable interim milestones, and accredited annual progress reporting.',
      },
      {
        clause: 'Clause 7(1)',
        title: 'Carbon Neutrality and Offsets',
        text: 'Claims of carbon neutrality must transparently disclose the share of gross emissions directly reduced versus the share compensated through carbon offsets, citing recognized registry IDs.',
      },
      {
        clause: 'Clause 8(1)',
        title: 'Eco-Labels and Certification Seals',
        text: 'Eco-labels, green seals, and certification marks must clearly identify the scheme owner, accredited standard, and public license or certificate verification code.',
      },
    ],
  }),
  ...chunkDocument({
    document: 'ECOMARK_2024',
    url: '<TODO: verify against official text>',
    version: '2024.1',
    sections: [
      {
        clause: 'Rule 6(2)',
        title: 'Ecomark Certification Scheme',
        text: 'Products claiming Ecomark compliance must hold valid Bureau of Indian Standards (BIS) licenses and meet specific environmental criteria published by the Central Pollution Control Board (CPCB).',
      },
      {
        clause: 'Rule 9(1)',
        title: 'Biodegradable and Compostable Plastics',
        text: 'Plastics claimed to be biodegradable or compostable must conform to IS/ISO 17088 standards, specify disposal conditions and timelines, and obtain CPCB manufacturer registration.',
      },
    ],
  }),
];
