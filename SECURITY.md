# Security Policy

## 1. Supported Versions

We release security updates and patches for active versions of GreenClaim Lens:

| Version | Supported          | Security Status |
| ------- | ------------------ | --------------- |
| 0.1.x   | :white_check_mark: | Active (Current)|
| main    | :white_check_mark: | Active (Bleeding edge) |
| < 0.1.0 | :x:                | Unsupported     |

## 2. Reporting a Vulnerability

The GreenClaim Lens project team takes security, user privacy, and data integrity seriously. If you discover a potential vulnerability, please report it privately:

- **Email:** `security@greenclaimlens.org` (or open a confidential GitHub Security Advisory).
- **PGP Key:** Available upon request or via public keyservers.
- **Expected Details:**
  - Description and severity assessment of the vulnerability.
  - Step-by-step reproduction steps or proof-of-concept (POC).
  - Affected components (`packages/core`, `apps/api`, `apps/web`, `apps/extension`, etc.).
  - Potential mitigation recommendations if known.

### Response Timelines (SLA)
- **Initial Acknowledgment:** Within **48 hours**.
- **Triage & Severity Confirmation:** Within **7 business days**.
- **Patch & Responsible Disclosure:** Targeted within **30 days** depending on complexity.

Please do **not** file public GitHub issues for security vulnerabilities until a patched release is published.

## 3. Core Security & Privacy Architecture

GreenClaim Lens is engineered around defensive architectural patterns:

1. **Pure Business Logic:** `packages/core` is strictly pure and deterministic with zero I/O, network, or file system access, eliminating server-side command execution or memory leaks.
2. **Client-Side Privacy by Default:** Camera images, barcodes, and OCR processing execute directly in the browser via Tesseract.js. No user photos or camera frames are uploaded or stored.
3. **Cite or Abstain:** Any LLM judgment that fails server-side citation validation against known legal chunk IDs is automatically discarded and converted to `INSUFFICIENT_EVIDENCE`.
4. **Adversarial Input Sanitization:** All text inputs are filtered against prompt injections, Unicode homoglyphs, and oversized payloads prior to evaluation.
5. **No Accusatory Language:** UI copy and API responses strictly assert "does not appear to meet regulatory standards", preventing defamatory assertions or liability risks.
6. **Edge Protection:** API endpoints feature sliding-window rate limiting, API key authentication, and Cloudflare Turnstile token verification to prevent scraping or denial-of-service abuse.

## 4. Responsible Disclosure & Recognition

We welcome security researchers and ethical hackers. Valid vulnerabilities discovered in accordance with this policy will be credited in our release notes and `HALL_OF_FAME.md` (unless anonymity is requested).
