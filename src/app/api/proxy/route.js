import { NextResponse } from 'next/server';
import { generateHMAC } from '@/utils/security';

export async function POST(request) {
  try {
    const body = await request.json();
    const { payload, signature } = body;

    if (!payload || !signature) {
      return NextResponse.json({ error: "Missing payload or signature" }, { status: 400 });
    }

    // Recalculate HMAC on the incoming payload
    const expectedSignature = generateHMAC(payload);

    // Integrity Check
    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Integrity check failed." }, { status: 403 });
    }

    // Return mocked response
    return NextResponse.json({
      response: `Enterprise AI has analyzed the document regarding ${payload}. No anomalies found in the encrypted parameters.`
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
