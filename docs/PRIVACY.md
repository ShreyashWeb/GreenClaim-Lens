# Privacy Policy — GreenClaim Lens

**Effective Date:** October 25, 2026  
**Last Updated:** October 25, 2026  

GreenClaim Lens is an open-source, public-interest automated tool designed to evaluate commercial environmental claims against Indian consumer protection and greenwashing regulations.

We operate under a strict **privacy-by-default** and **data-minimization** philosophy.

---

## 1. Information We Do NOT Collect

1. **User Identity:** You can use the web application, API, and browser extension completely anonymously. We do not require account registration, email addresses, names, or phone numbers.
2. **Camera Images & Packaging Photos:** All camera viewfinders, barcode detections, and Optical Character Recognition (OCR) execute **entirely within your browser or device** using client-side WebAssembly (Tesseract.js). Your images and camera streams are **never uploaded to our servers, stored on disk, or transferred to third parties**.
3. **Personal Identifying Data to AI Models:** When external AI models (e.g. Gemini, Groq) are invoked for gray-area analysis, we send **only** the normalized product claim text and public statutory clauses. We never transmit user identifiers, IP addresses, or device fingerprints to AI vendors.

---

## 2. Information We Process

1. **Environmental Claim Text:** When you submit a commercial marketing claim for verification, the text is evaluated against our deterministic rule base. The text is hashed using SHA-256 for cache deduplication.
2. **Operational Telemetry:** We record minimal, non-identifying operational metrics:
   - Request timestamp and execution duration.
   - Evaluated claim hash and assigned compliance verdict (`CREDIBLE`, `VAGUE`, `LIKELY_MISLEADING`, `INSUFFICIENT_EVIDENCE`).
   - Rule engine and corpus version numbers.
3. **Transient Rate Limiting:** We process transient IP addresses in volatile memory solely for sliding-window abuse prevention (e.g. 60 requests per minute). IP addresses are purged automatically upon expiration of the rate-limiting window (60 seconds) and are never written to permanent database storage.

---

## 3. Compliance with Data Protection Laws

### Digital Personal Data Protection Act (DPDP), 2023 (India)
GreenClaim Lens processes zero personal data as defined by the DPDP Act. Because claims evaluated are public commercial advertisements, no personal identifying data of the user is retained or shared.

### General Data Protection Regulation (GDPR)
Where applicable, European Union residents possess the right to verify that no personal data or tracking cookies are attached to their sessions. Analytics are strictly opt-out and cookieless.

---

## 4. Third-Party Integrations & Free Tiers

- **Open Food Facts API:** When scanning product barcodes, queries are sent directly to the public Open Food Facts database to retrieve published ingredient/packaging data.
- **Cloudflare Turnstile:** Used optionally on edge endpoints to distinguish legitimate human traffic from abusive automated scrapers without collecting user tracking cookies.

---

## 5. Contact & Data Inquiries

For questions regarding this policy or privacy practices:
- **Email:** `privacy@greenclaimlens.org`
- **GitHub Repository:** [https://github.com/ShreyashWeb/GreenClaim-Lens](https://github.com/ShreyashWeb/GreenClaim-Lens)
