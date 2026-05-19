import { NextResponse } from 'next/server';
import { generateHMAC } from '@/utils/security';

const usedNonces = new Set();

export async function POST(request) {
  try {
    const body = await request.json();
    const { payload, signature, timestamp, nonce } = body;

    if (!payload || !signature || !timestamp || !nonce) {
      return NextResponse.json({ error: "Missing payload, signature, timestamp, or nonce" }, { status: 400 });
    }

    // Replay Protection Checks
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    // 1. Check if timestamp is within the acceptable window
    if (now - timestamp > FIVE_MINUTES || timestamp > now + 60000) {
      return NextResponse.json({ error: "Request expired or invalid timestamp." }, { status: 403 });
    }

    // 2. Check if nonce has already been used
    if (usedNonces.has(nonce)) {
      return NextResponse.json({ error: "Replay attack detected." }, { status: 403 });
    }

    // Recalculate HMAC on the incoming payload + timestamp + nonce
    const signatureData = `${payload}|${timestamp}|${nonce}`;
    const expectedSignature = generateHMAC(signatureData);

    // Integrity Check
    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Integrity check failed." }, { status: 403 });
    }

    // Mark nonce as used
    usedNonces.add(nonce);
    
    // Simple cleanup for demo purposes to prevent memory leak
    if (usedNonces.size > 10000) {
      usedNonces.clear();
    }

    // Return mocked response
    return NextResponse.json({
      response: `Enterprise AI has analyzed the document regarding ${payload}. No anomalies found in the encrypted parameters.`
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
