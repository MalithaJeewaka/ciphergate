# CipherGate Enterprise DLP

CipherGate is a Zero-Trust Data Loss Prevention (DLP) proxy built with Next.js and Tailwind CSS. It is designed as an Information Security demonstration of client-side encryption and payload integrity verification.

## Overview

The application simulates a scenario where an enterprise needs to send text documents through an untrusted network (or to a third-party AI service) while ensuring sensitive Personally Identifiable Information (PII), such as emails and financial amounts, are never exposed.

CipherGate intercepts these sensitive entities on the client side, encrypts them, and cryptographically signs the payload before it ever leaves the browser.

## Security Features Demonstrated

- **Confidentiality (AES-256):** Sensitive entities (emails and monetary values) are intercepted via Regex and encrypted locally using `crypto-js` AES-256. The server only receives ciphertext (e.g., `[ENC:U2FsdGVkX1...]`).
- **Integrity (HMAC-SHA256):** The entire payload is hashed with a shared secret to generate an HMAC signature. This guarantees the payload has not been tampered with during transit.
- **Data Origin Authentication:** The backend proxy verifies the HMAC signature to ensure the request originated from a trusted client possessing the shared secret.

## Architecture

* **Frontend (Trusted Zone):** A React/Next.js client that sanitizes user input, encrypts sensitive data, and generates the HMAC signature.
* **Backend Proxy (Untrusted Zone):** A Next.js API Route (`/api/proxy`) that acts as the untrusted network. It intercepts the POST request, recalculates the HMAC, and verifies integrity before returning a response.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd ciphergate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

3. Paste a document containing an email (e.g., `admin@corp.com`) or a monetary amount (e.g., `$5,000.00`) into the "Local Client" textarea and click **Execute Secure Query**.
4. Observe the network traffic interception in the right-hand panel, demonstrating the AES-256 Ciphertext and the HMAC-SHA256 Signature.

## Technologies Used
- Next.js (App Router)
- React
- Tailwind CSS
- CryptoJS

## Disclaimer
*This project is for educational and demonstration purposes. The cryptographic keys (`CLIENT_ENCRYPTION_KEY` and `HMAC_SHARED_SECRET`) are hardcoded for simplicity. In a production environment, these keys should be securely managed using a Key Management Service (KMS) or established via secure key exchange protocols like Diffie-Hellman.*
