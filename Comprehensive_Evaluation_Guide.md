# Comprehensive Security Evaluation & Architecture Guide

This document is specifically tailored for your project evaluation. It details the system's workflow, the attacks we mitigate (with their exact implementations in the codebase), and critically, the known limitations of the system and how they should be addressed in a real-world production environment.

---

## 1. The Full Project Workflow

The CipherGate application follows a strict 4-phase lifecycle to ensure Data Loss Prevention (DLP) between a Trusted Local Client and an Untrusted Backend Proxy.

### Phase 1: Local Client Processing (Trusted Zone)
* **Location:** `src/app/page.tsx` & `src/utils/security.js`
* **Action:** The user enters text containing PII (like emails, credit cards, or money). The client-side application scans this text using Regex (`sanitizeEnterprisePrompt`). Any matched PII is instantly encrypted using **AES-256** into a `[ENC:...]` format. 
* **Security Metadata:** The client generates a `timestamp` and a unique `nonce` (UUID). It then combines the encrypted payload, timestamp, and nonce, and generates an **HMAC-SHA256 signature** using a shared secret.

### Phase 2: Network Transmission (Untrusted Zone)
* **Location:** Browser Network Layer -> `src/app/api/proxy/route.js`
* **Action:** The client sends an HTTP POST request to the backend. The request body contains: `{ payload, signature, timestamp, nonce }`. Because the payload is already encrypted, any eavesdropper on the network only sees ciphertext.

### Phase 3: Backend Verification (The Gateway)
* **Location:** `src/app/api/proxy/route.js`
* **Action:** Before processing the data, the backend acts as a strict security gate:
  1. It checks if the `timestamp` is within a 5-minute window.
  2. It checks if the `nonce` has already been used in previous requests.
  3. It calculates its own HMAC signature based on the received payload, timestamp, and nonce. If its signature matches the client's signature, the data is verified as authentic and untampered.
* **Response:** If all checks pass, it returns a simulated Enterprise AI response containing the encrypted data.

### Phase 4: Local Decryption (Trusted Zone)
* **Location:** `src/app/page.tsx` & `src/utils/security.js`
* **Action:** The client receives the response. It scans the response for any `[ENC:...]` blocks and uses the local AES decryption key to convert them back to plaintext. If decryption fails or data was tampered with, it safely outputs `[DECRYPTION_FAILED]`.

---

## 2. Attacks Prevented & Their Implementations

Here is a breakdown of the attacks your system actively prevents, and where exactly the code lives.

### A. Eavesdropping & Packet Sniffing
* **The Attack:** An attacker intercepts the network traffic (e.g., via public Wi-Fi) to read sensitive PII like credit card numbers or emails.
* **How it is prevented:** We use **AES-256 Symmetric Encryption** on the client side before any network transmission occurs.
* **Implementation Directory:** `src/utils/security.js`
* **How it works:** The `encryptEntity()` function uses the `NEXT_PUBLIC_CLIENT_ENCRYPTION_KEY` to turn PII into unreadable ciphertext.

### B. Man-in-the-Middle (MitM) & Data Tampering
* **The Attack:** An attacker intercepts the request and maliciously alters the payload (e.g., changing an invoice amount from $500 to $5000) before it reaches the server.
* **How it is prevented:** We use **HMAC-SHA256 (Hash-based Message Authentication Code)** signatures.
* **Implementation Directory:** `src/utils/security.js` (generation) & `src/app/api/proxy/route.js` (validation)
* **How it works:** The client creates a mathematical signature of the payload. The server recalculates this signature. If even a single character in the payload is changed by an attacker, the server's recalculated signature won't match, and the request is rejected with a `403 Forbidden` error.

### C. Replay Attacks
* **The Attack:** An attacker intercepts a perfectly valid request (valid encrypted payload + valid signature) and repeatedly resends it to the server to trigger unauthorized actions multiple times.
* **How it is prevented:** We use a combination of **Timestamps** and **Nonces (Number Used Once)**.
* **Implementation Directory:** `src/app/api/proxy/route.js`
* **How it works:** 
  1. The proxy checks `now - timestamp > 5 minutes`. If it is too old, it is rejected.
  2. The proxy maintains a `usedNonces` Set. If the specific `nonce` has been seen before, the server identifies it as a replay and rejects it.

### D. Ciphertext Manipulation / Fail-Open Vulnerability
* **The Attack:** An attacker alters the `[ENC:...]` ciphertext block returned by the server. If the decryption fails silently and returns the raw string, malicious code could be injected into the UI.
* **How it is prevented:** Strict "Fail-Secure" logic during decryption.
* **Implementation Directory:** `src/utils/security.js`
* **How it works:** The `decryptEntity()` function is wrapped in a `try/catch` block. If `CryptoJS.AES.decrypt` fails or the format is wrong, it immediately returns the string `[DECRYPTION_FAILED]` rather than passing through the tampered data.

---

## 3. System Limitations: What it CANNOT do & How to fix it

Examiners will test if you understand the limitations of your own architecture. **You must be able to explain these flaws and propose the exact solutions.**

### Limitation 1: Client-Side Symmetric Encryption Flaw
* **What it cannot do:** It cannot achieve a true "Zero-Trust" architecture for the client browser. 
* **The Flaw:** Because we are encrypting data *in the browser* using AES (a symmetric algorithm), the browser must possess the encryption key. We expose this via `NEXT_PUBLIC_CLIENT_ENCRYPTION_KEY`. Any user or malicious script can open Developer Tools, read the environment variables, and extract the key, allowing them to decrypt anything or forge encrypted data.
* **What we have to do for that:** 
  * **Solution A:** Move all encryption to the backend server. The client should send data securely over standard TLS (HTTPS), and the backend handles the DLP sanitization and encryption before storing it.
  * **Solution B (If client encryption is strictly required):** Switch to **Asymmetric Encryption (e.g., RSA or Elliptic Curve Cryptography)**. Give the client *only* the Public Key, which can only be used to *encrypt* data. Keep the Private Key strictly on the server to *decrypt* it.

### Limitation 2: Static Key Distribution
* **What it cannot do:** It cannot dynamically rotate keys or securely exchange them.
* **The Flaw:** The cryptographic keys are stored statically in a `.env.local` file. If the keys are ever leaked, an administrator has to manually issue new keys and redeploy the application.
* **What we have to do for that:** Implement an automated **Key Management Service (KMS)** (like AWS KMS) or implement a **Diffie-Hellman Key Exchange (DHKE)** protocol so that the client and server can mathematically agree on a temporary, rotating session key without ever transmitting the key itself.

### Limitation 3: In-Memory Nonce Storage is Not Scalable
* **What it cannot do:** It cannot prevent replay attacks across multiple server instances in a large-scale production environment.
* **The Flaw:** In `route.js`, we use `const usedNonces = new Set();`. This stores nonces in the local memory of that specific Node.js process. In a serverless environment (like Vercel) or a load-balanced cluster, different requests hit different server instances, meaning the `Set` of used nonces is not shared.
* **What we have to do for that:** We must replace the in-memory `Set` with a centralized, high-speed database like **Redis**. When a request comes in, the server checks Redis to see if the nonce exists, ensuring all server instances share the same state.
