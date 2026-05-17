# CipherGate: Evaluation and Viva Preparation Guide

This document is designed to prepare you for your Information Security course project presentation and viva. It maps the features of the **CipherGate Enterprise DLP** application directly to the requirements outlined in your `Project Description.md`.

---

## 1. Project Overview & Architecture
**The Scenario:** You have built "CipherGate," a Data Loss Prevention (DLP) proxy designed to secure communication between a Trusted Local Client and an Untrusted Network/Backend Proxy. 
**The Mechanism:** The system intercepts sensitive enterprise data (specifically PII like emails and monetary values), encrypts them locally, and mathematically signs the entire payload before transmission. 

* **Entity A (Trusted):** The Local Client (Frontend Next.js Application).
* **Entity B (Untrusted):** The Backend Proxy (Next.js API Route).

---

## 2. Fulfillment of Security Objectives (The CIA Triad)

Your project requirements state you must ensure CIA. Here is how your project accomplishes this:

### Confidentiality
* **How it's achieved:** By using **AES-256 (Advanced Encryption Standard)** in the browser before the data is transmitted over the network.
* **Explanation:** Even if an attacker intercepts the network request (Man-in-the-Middle), they will only see `[ENC:U2FsdGVkX1...]` instead of the actual emails or monetary amounts. The backend itself also acts as an untrusted entity and never sees the raw PII.

### Integrity
* **How it's achieved:** By generating an **HMAC-SHA256 (Hash-based Message Authentication Code)** signature of the payload.
* **Explanation:** When the client sends the payload, it sends the HMAC signature alongside it. The receiving proxy recalculates the HMAC using the same payload and shared secret. If even a single character of the payload was altered in transit, the recalculated hash will be completely different, and the proxy will reject it (`403 Forbidden: Integrity check failed`).

### Availability
* **How it's achieved:** Handled generally by the robust, serverless architecture of Next.js and React. In a production scenario, you would mention DDoS protection (like Cloudflare) and rate limiting to prevent the API route from being overwhelmed.

### Authentication & Non-Repudiation (Additional Properties)
* **Data Origin Authentication:** The use of HMAC proves that the sender possessed the `HMAC_SHARED_SECRET`. Therefore, the proxy knows the request genuinely originated from the authorized client.
* *(Note: True Non-repudiation usually requires Asymmetric cryptography/Digital Signatures like RSA/ECC. HMAC is symmetric, so both parties share the key. If asked, acknowledge this distinction!)*

---

## 3. Cryptographic Mechanisms Used

Be prepared to explain *why* you chose these specific algorithms.

1. **AES-256 (Symmetric Encryption):** 
   * *Why?* It is the industry standard for securing data at rest and in transit. It is incredibly fast (suitable for client-side processing in JavaScript) and currently unbreakable by brute force.
2. **SHA-256 (Hashing):**
   * *Why?* It is a collision-resistant cryptographic hash function.
3. **HMAC (Hash-based Message Authentication Code):**
   * *Why?* A standard hash (like `SHA-256(message)`) is vulnerable to length-extension attacks. HMAC mixes a secret key with the message (`SHA-256(key + message + key)`), proving both data integrity and authenticity.

---

## 4. Threat Modeling & Mitigations

During the presentation, explain how your design mitigates specific threats:

| Threat | Mitigation in CipherGate |
| :--- | :--- |
| **Eavesdropping / Packet Sniffing** | AES-256 encryption ensures the attacker only captures ciphertext. |
| **Data Tampering (Man-in-the-Middle)** | HMAC-SHA256 guarantees that altered data will be rejected by the server. |
| **Backend Server Compromise** | The Zero-Trust model means the backend *never* receives the decryption key. A compromised backend cannot read the PII. |

---

## 5. Potential Weaknesses & Future Improvements (Crucial for Viva)

Examiners love to test if you know the limitations of your own system. **Bring these up yourself to look proactive!**

> [!WARNING]
> **Known Limitation: Hardcoded Keys**
> Currently, `CLIENT_ENCRYPTION_KEY` and `HMAC_SHARED_SECRET` are hardcoded for demonstration. 
> *Fix:* In a real system, keys would be securely exchanged using **Diffie-Hellman Key Exchange (DHKE)** or provisioned via a secure KMS (Key Management Service).

> [!CAUTION]
> **Known Limitation: Replay Attacks**
> Currently, an attacker could intercept a valid request (payload + signature) and resend it multiple times. The server would accept it because the signature is mathematically valid.
> *Fix:* Implement a **Nonce (Number used once)** or a **Timestamp** inside the payload before generating the HMAC. The server would reject requests with old timestamps or reused nonces.

---

## 6. Sample Viva Questions & Answers

**Q: Why did you use Symmetric encryption (AES) instead of Asymmetric (RSA)?**
*A: For a DLP proxy handling potentially large amounts of text, symmetric encryption is exponentially faster and less computationally expensive. If we used RSA, we would typically only use it to securely exchange the AES session key, not to encrypt the data itself.*

**Q: What is the difference between a Hash and an HMAC?**
*A: A standard hash (like SHA-256) only guarantees integrity—anyone can calculate a hash. An HMAC includes a secret key, so it guarantees both integrity AND authentication (that the sender possessed the key).*

**Q: If the backend is "untrusted", why is it checking the HMAC?**
*A: The backend acts as a gateway or firewall. By checking the HMAC, it ensures it is only forwarding legitimately formed requests from our trusted clients, dropping tampered packets before they reach external LLMs or third-party APIs. However, because it lacks the AES decryption key, it remains mathematically unable to read the confidential data.*

**Q: How does your system achieve confidentiality?**
*A: Through local, client-side encryption. We use Regex to identify sensitive data patterns (like emails and money) and encrypt them with AES-256 in the browser before the HTTP request is even constructed.*

**Q: How would you improve the key distribution?**
*A: I would implement a key-exchange protocol like Elliptic Curve Diffie-Hellman (ECDHE) at the start of the session so the client and server can mathematically agree on a shared secret without ever transmitting it over the network.*
