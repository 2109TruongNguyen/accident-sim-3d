import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://103.179.185.199:5678/webhook/accident-gen';

export async function POST(req: Request) {
  try {
    const { caseText } = await req.json();

    if (!caseText || typeof caseText !== 'string') {
      return NextResponse.json(
        { error: 'Thiếu nội dung bản án (caseText)' },
        { status: 400 }
      );
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseText }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `n8n error: ${response.status}`, details: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
