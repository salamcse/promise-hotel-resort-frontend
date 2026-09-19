import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URLS = [
  'http://127.0.0.1:4005/api/inquiries',
  'http://localhost:4005/api/inquiries',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[API Route /api/inquiries] Forwarding POST inquiry:', JSON.stringify(body));

    let lastError: any = null;
    for (const backendUrl of BACKEND_URLS) {
      try {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log(`[API Route /api/inquiries] Backend response from ${backendUrl} (${response.status}):`, data);

        if (response.ok) {
          return NextResponse.json(data, { status: response.status });
        } else {
          lastError = { status: response.status, data };
        }
      } catch (err: any) {
        console.warn(`[API Route /api/inquiries] Failed connecting to ${backendUrl}:`, err.message);
        lastError = { status: 502, data: { success: false, message: `Could not reach ${backendUrl}: ${err.message}` } };
      }
    }

    return NextResponse.json(
      lastError?.data || { success: false, message: 'Failed to communicate with backend server.' },
      { status: lastError?.status || 500 }
    );
  } catch (error: any) {
    console.error('[API Route /api/inquiries] JSON parse / unexpected error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    for (const backendUrl of BACKEND_URLS) {
      try {
        const response = await fetch(backendUrl);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch (e) {
        // try next
      }
    }
    return NextResponse.json(
      { success: false, message: 'Backend unreachable' },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
