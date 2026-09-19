/**
 * Resilient API client for inquiries with automatic direct fallback
 */

export interface InquiryPayload {
  name: string;
  phone: string;
  email?: string;
  packageType?: string;
  shareCount?: number;
  message?: string;
}

export interface InquiryResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<InquiryResult> {
  const cleanPayload = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || undefined,
    packageType: payload.packageType?.trim() || 'General Inquiry',
    shareCount: payload.shareCount || 1,
    message: payload.message?.trim() || undefined,
  };

  // 1. Primary: Next.js API Route Handler (/api/inquiries)
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success || json.data) {
        return { success: true, data: json.data || json };
      }
    }
    console.warn('[submitInquiry] /api/inquiries returned non-ok status:', res.status);
  } catch (err: any) {
    console.warn('[submitInquiry] /api/inquiries network error, attempting direct backend fallback:', err.message);
  }

  // 2. Direct Fallback: Call NestJS backend directly on port 4005
  const fallbackEndpoints = [
    'http://127.0.0.1:4005/api/inquiries',
    'http://localhost:4005/api/inquiries',
  ];

  for (const endpoint of fallbackEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success || json.data) {
          return { success: true, data: json.data || json };
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  return {
    success: false,
    error: 'We were unable to submit your request at this moment. Please check your internet connection or call our advisory hotline directly.',
  };
}
