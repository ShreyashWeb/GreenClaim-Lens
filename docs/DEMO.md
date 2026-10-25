# GreenClaim Lens — Interactive Demonstration & Video Walkthrough Guide

This document provides a guided walkthrough and demonstration script covering all core multimodal capabilities of GreenClaim Lens.

---

## Demonstration Overview

| Part | Feature | Objective | Target Duration |
|---|---|---|---|
| **1** | Instant Web App Verification | Deterministic rule verification, 3D visualizer, non-accusatory verdict card | 60 sec |
| **2** | Multimodal OCR & Barcode | Live camera viewfinder, image drag-and-drop, Open Food Facts barcode lookup | 75 sec |
| **3** | Client-Side Grievance Drafter | Instant PDF generation with CCPA clause citations | 45 sec |
| **4** | Bilingual Localization | 100% English & Hindi dictionary parity, vernacular claim verification | 45 sec |
| **5** | Public Edge API & Typed SDK | OpenAPI 3.1 documentation (`/docs`), cURL, and typed client SDK | 60 sec |
| **6** | Browser Extension Prototype | Live DOM scanning on sample shopping page with inline badges and popup | 60 sec |

---

## Part 1: Instant Web App Verification

1. **Launch Web App:**
   ```bash
   pnpm dev
   ```
   Navigate to `http://localhost:3000`.
2. **Observe Design & Aesthetics:**
   - Dark emerald theme (`#061511`) with glassmorphism panels.
   - Header displaying brand identity, status badge, and language switcher (`EN | HI`).
3. **Run Misleading Claim Sample:**
   - Click the chip: `"100% natural organic ingredients with zero carbon emission"`.
   - Click **Verify Claim**.
   - **Observe:**
     - Compliance Risk Gauge displays `85 / 100` (High Risk).
     - Interactive 3D compliance wireframe rotates smoothly; test `prefers-reduced-motion` in browser dev tools to observe automatic 2D SVG radial gauge fallback.
     - Verdict card renders `LIKELY_MISLEADING` with strictly non-accusatory language: *"This claim does not appear to meet regulatory standards..."*.
     - Evidence list highlights triggers in the claim and cites CCPA 2024 provisions.
     - "What would make this credible" recommendations list specific actionable steps.

---

## Part 2: Multimodal OCR & Barcode Lookup

1. **OCR Packaging Scan:**
   - Click **Scan Packaging Photo** (or camera icon).
   - Modal opens with live webcam viewfinder `<video>` and drag-and-drop zone.
   - Drop a packaging image or click capture.
   - Client-side contrast preprocessing executes on canvas before Tesseract.js OCR parses text.
   - Extracted text automatically populates the input field.
2. **Barcode Lookup:**
   - Click **Scan Barcode**.
   - Enter registered EAN code `8901030382345` (or click Sample Barcode).
   - Offline product registry instantly retrieves: *"Eco-Care Bamboo Toothbrush - 100% biodegradable handle"*.
   - Click **Load Claims into Inspector** to verify.

---

## Part 3: Client-Side PDF Grievance Generator

1. On any evaluated claim with a risk verdict (`LIKELY_MISLEADING` or `VAGUE`), scroll to the action panel.
2. Click **Generate Pre-Litigation Notice (PDF)**.
3. Observe instant browser-side document generation via `pdf-lib` (zero server upload).
4. Download and inspect the resulting PDF:
   - Contains formal legal notice formatting addressed to the manufacturer.
   - Embeds Section 2(28) Consumer Protection Act 2019 and CCPA 2024 clause citations.
   - Formats a 15-day pre-litigation cure notice before filing on the National Consumer Helpline (`consumerhelpline.gov.in`).

---

## Part 4: Bilingual Hindi Localization (EN / HI)

1. Click the **हिंदी** toggle in the top-right header.
2. Observe complete UI translation parity across all elements, instructions, and error states.
3. Test a vernacular claim:
   > *"100% प्राकृतिक और पर्यावरण-अनुकूल पैकेजिंग"*
4. Click **दावे की जांच करें**.
5. Observe verdict and Hindi explainer derived from Rule GCL-008:
   - *"यह दावा दिशानिर्देशों के अनुरूप प्रतीत नहीं होता..."*

---

## Part 5: Public Edge API & Typed SDK

1. **Interactive API Reference:**
   - Visit `http://localhost:8787/docs` (or `http://localhost:3000/api/docs`).
   - Scalar interactive UI presents OpenAPI 3.1 specifications.
2. **cURL Command:**
   ```bash
   curl -X POST http://localhost:8787/v1/verify-claim \
     -H "Content-Type: application/json" \
     -d '{"claim": "100% eco-friendly and green packaging"}'
   ```
   **Response:**
   ```json
   {
     "verdict": "LIKELY_MISLEADING",
     "riskScore": 85,
     "explanation": "The claim does not appear to meet regulatory standards due to high-severity unverified or absolute assertions...",
     "whatWouldHelp": [
       "Replace generic claims (\"eco-friendly\", \"green\") with specific, measurable attributes..."
     ],
     "cached": false
   }
   ```
3. **SDK Integration:**
   ```typescript
   import { GreenClaimClient } from '@greenclaim/sdk';

   const client = new GreenClaimClient({ baseUrl: 'https://api.greenclaimlens.org' });
   const result = await client.verifyClaim({ claim: '100% organic cotton' });
   console.log(result.verdict, result.riskScore);
   ```

---

## Part 6: In-Browser Extension Prototype

1. Open `apps/extension/src/fixtures/sample-shopping-page.html` in browser.
2. Content script executes automatically:
   - Inspects product title: `"EcoClean 100% natural organic Dish Liquid"`.
   - Injects red warning badge: `⚠️ Risk 85`.
   - Inspects recycled bullet: `"Eco-friendly bottle made with 70% post-consumer recycled plastic (certified: ISO 14021)"`.
   - Injects emerald credibility badge: `✓ Credible`.
3. Click extension action icon:
   - Popup displays breakdown: `1 Misleading | 1 Vague | 1 Credible`.
   - Lists each claim with risk score and CCPA explanation.
