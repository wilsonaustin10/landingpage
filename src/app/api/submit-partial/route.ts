import { NextResponse } from 'next/server';
import { appendLeadToSheet } from '@/utils/googleSheets';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';

// Validate partial form data (only address and phone)
function validatePartialData(data: Partial<LeadFormData>): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!data.address || !data.phone) return false;
  
  // Phone validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone)) return false;
  
  return true;
}

/**
 * API Route for saving initial lead data (address and phone)
 * Called when user clicks first "Get Cash Offer" button
 */
export async function POST(request: Request) {
  try {
    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toISOString();
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // 2. Parse and validate request data
    const data = await request.json();
    if (!validatePartialData(data)) {
      return NextResponse.json(
        { error: 'Invalid partial form data' },
        { status: 400 }
      );
    }

    // 3. Prepare partial data with tracking information
    const formData: Partial<LeadFormData> = {
      address: data.address,
      phone: data.phone,
      timestamp,
      lastUpdated: timestamp,
      leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // 4. Append to Google Sheet with partial flag
    const result = await appendLeadToSheet({
      ...formData,
      submissionType: 'partial'
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to save partial data');
    }

    // 5. Return leadId for later use
    return NextResponse.json({ 
      success: true,
      leadId: formData.leadId
    });

  } catch (error) {
    console.error('Error submitting partial form:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 