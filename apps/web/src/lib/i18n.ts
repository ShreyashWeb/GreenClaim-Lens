export type Language = 'en' | 'hi';

export interface Translations {
  appName: string;
  appTagline: string;
  engineBadge: string;
  verifyTitle: string;
  verifySubtitle: string;
  claimPlaceholder: string;
  verifyButton: string;
  analyzingButton: string;
  clearButton: string;
  sampleClaimsTitle: string;
  photoButton: string;
  barcodeButton: string;
  assessmentTitle: string;
  riskIndex: string;
  riskLevels: {
    low: string;
    medium: string;
    high: string;
  };
  verdictThemes: {
    credible: { title: string; badge: string };
    vague: { title: string; badge: string };
    misleading: { title: string; badge: string };
    insufficient: { title: string; badge: string };
  };
  whatWouldHelpTitle: string;
  whatWouldHelpSubtitle: string;
  rulesEvaluatedTitle: string;
  retrievedContextTitle: string;
  provisionsTitle: string;
  exportNoticeButton: string;
  modalTitle: string;
  modalSubtitle: string;
  brandLabel: string;
  productLabel: string;
  cancelButton: string;
  downloadPdfButton: string;
  disclaimer: string;
  sampleClaims: string[];
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'GreenClaim Lens',
    appTagline: 'Regulatory Verification Engine · CCPA 2024 Standards',
    engineBadge: 'Deterministic Engine v1.0',
    verifyTitle: 'Verify an Environmental Claim',
    verifySubtitle:
      'Paste packaging copy, commercial tagline, or marketing statements to verify compliance with CCPA Greenwashing Guidelines 2024.',
    claimPlaceholder: 'e.g. 100% eco-friendly packaging, completely biodegradable in nature...',
    verifyButton: 'Verify Claim',
    analyzingButton: 'Analyzing Claim...',
    clearButton: 'Clear Input',
    sampleClaimsTitle: 'Or try a sample claim:',
    photoButton: '📷 Capture / Upload Photo',
    barcodeButton: '🏷️ Scan Barcode',
    assessmentTitle: 'Assessment Summary',
    riskIndex: 'Risk Index',
    riskLevels: {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
    },
    verdictThemes: {
      credible: {
        title: 'Credible Claim',
        badge: 'Meets Substantiation Criteria',
      },
      vague: {
        title: 'Vague or Unsubstantiated',
        badge: 'Broad / Unqualified Claim',
      },
      misleading: {
        title: 'Does Not Appear to Meet Standards',
        badge: 'Potential Greenwashing Flag',
      },
      insufficient: {
        title: 'Insufficient Evidence to Verify',
        badge: 'Unverified / Incomplete Context',
      },
    },
    whatWouldHelpTitle: 'What Would Make This Credible?',
    whatWouldHelpSubtitle:
      'Under CCPA 2024 guidelines, environmental assertions can achieve compliance through specific disclosures and verifiable substantiation:',
    rulesEvaluatedTitle: 'Rule Checks',
    retrievedContextTitle: 'Retrieved Context Clauses (Hybrid BM25 + Vector)',
    provisionsTitle: 'Governing Regulatory Provisions',
    exportNoticeButton: '📄 Export Grievance Notice (PDF)',
    modalTitle: 'Export Formal Grievance Notice',
    modalSubtitle:
      'Generate a pre-formatted inquiry letter citing CCPA 2024 provisions and identifying claim compliance discrepancies for corporate or statutory inquiry.',
    brandLabel: 'Brand / Manufacturer Name (Optional)',
    productLabel: 'Product / Service Name (Optional)',
    cancelButton: 'Cancel',
    downloadPdfButton: 'Download PDF',
    disclaimer:
      'Assessments indicate technical compliance against CCPA 2024 Greenwashing Guidelines and Ecomark Rules. Findings strictly reflect evidentiary substantiation criteria and do not constitute legal rulings.',
    sampleClaims: [
      '100% natural organic ingredients with zero emission',
      'Eco-friendly everyday cleaning solution',
      'Eco-friendly bottle made with 50% post-consumer recycled PET (certificate: ISO-14021)',
      'Carbon neutral by 2030 through renewable energy transition',
    ],
  },
  hi: {
    appName: 'ग्रीनक्लेम लेंस (GreenClaim Lens)',
    appTagline: 'नियामक सत्यापन इंजन · CCPA 2024 दिशानिर्देश',
    engineBadge: 'नियम-आधारित इंजन v1.0',
    verifyTitle: 'पर्यावरणीय दावे का सत्यापन करें',
    verifySubtitle:
      'CCPA 2024 ग्रीनवॉशिंग दिशानिर्देशों के अनुपालन की जांच के लिए पैकेजिंग टेक्स्ट या विज्ञापन दावा दर्ज करें।',
    claimPlaceholder: 'उदा. 100% पर्यावरण-अनुकूल पैकेजिंग, पूरी तरह से प्राकृतिक...',
    verifyButton: 'दावा सत्यापित करें',
    analyzingButton: 'जांच जारी है...',
    clearButton: 'साफ़ करें',
    sampleClaimsTitle: 'या नमूना दावा चुनें:',
    photoButton: '📷 फोटो अपलोड / कैप्चर करें',
    barcodeButton: '🏷️ बारकोड स्कैन करें',
    assessmentTitle: 'सत्यापन सारांश',
    riskIndex: 'जोखिम सूचकांक',
    riskLevels: {
      low: 'कम (LOW)',
      medium: 'मध्यम (MED)',
      high: 'उच्च (HIGH)',
    },
    verdictThemes: {
      credible: {
        title: 'विश्वसनीय दावा (Credible Claim)',
        badge: 'मानकों के अनुरूप',
      },
      vague: {
        title: 'अस्पष्ट या निराधार दावा (Vague)',
        badge: 'अस्पष्ट सामान्य दावा',
      },
      misleading: {
        title: 'दिशानिर्देशों के अनुरूप प्रतीत नहीं होता',
        badge: 'संभावित ग्रीनवॉशिंग',
      },
      insufficient: {
        title: 'सत्यापन हेतु अपर्याप्त साक्ष्य',
        badge: 'असत्यापित संदर्भ',
      },
    },
    whatWouldHelpTitle: 'इसे विश्वसनीय क्या बनाएगा?',
    whatWouldHelpSubtitle:
      'CCPA 2024 दिशानिर्देशों के अंतर्गत, पर्यावरणीय दावों को विशिष्ट प्रमाणों द्वारा अनुपालन योग्य बनाया जा सकता है:',
    rulesEvaluatedTitle: 'नियम मूल्यांकन',
    retrievedContextTitle: 'प्रासंगिक विनियामक खंड (Hybrid BM25 + Vector)',
    provisionsTitle: 'शासी विनियामक प्रावधान',
    exportNoticeButton: '📄 शिकायत प्रारूप डाउनलोड करें (PDF)',
    modalTitle: 'औपचारिक शिकायत नोटिस निर्यात करें',
    modalSubtitle:
      'CCPA 2024 के प्रावधानों को उद्धृत करते हुए निर्माता या कंपनी को पूछताछ हेतु औपचारिक पत्र तैयार करें।',
    brandLabel: 'ब्रांड / निर्माता का नाम (वैकल्पिक)',
    productLabel: 'उत्पाद का नाम (वैकल्पिक)',
    cancelButton: 'रद्द करें',
    downloadPdfButton: 'PDF डाउनलोड करें',
    disclaimer:
      'यह मूल्यांकन CCPA 2024 ग्रीनवॉशिंग दिशानिर्देशों के तकनीकी अनुपालन को दर्शाता है और न्यायिक निर्णय नहीं है।',
    sampleClaims: [
      '100% प्राकृतिक और बिना रासायनिक घटक',
      'पर्यावरण-अनुकूल दैनिक उपयोग उत्पाद',
      '50% पुनर्चक्रित (Recycled) प्लास्टिक से निर्मित (ISO-14021 प्रमाणित)',
      'प्राकृतिक और पर्यावरण-अनुकूल पैकेजिंग',
    ],
  },
};
