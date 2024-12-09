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
  const timestamp = new Date().toISOString();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    if (!validatePartialData(data)) {
      return NextResponse.json(
        { error: 'Invalid partial form data' },
        { status: 400 }
      );
    }

    // Prepare data for sheet with timestamp and tracking
    const leadData: Partial<LeadFormData> = {
      ...data,
      timestamp,
      lastUpdated: timestamp,
      leadId,
      submissionType: 'partial'
    };

    const result = await appendLeadToSheet(leadData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save partial data');
    }

    return NextResponse.json({ 
      success: true,
      leadId
    });

  } catch (error) {
    console.error('Error submitting partial form:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 