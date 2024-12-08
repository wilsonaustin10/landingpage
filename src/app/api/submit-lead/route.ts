import { NextResponse } from 'next/server';
import { appendLeadToSheet } from '@/utils/googleSheets';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';

// Validate lead data according to required fields
function validateLeadData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation
  const requiredFields: (keyof LeadFormData)[] = ['address', 'phone'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // At this point, we know phone and address exist
  const phone = data.phone as string;
  const address = data.address as string;

  // Phone number validation (XXX) XXX-XXXX
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone number format');
  }

  // Address validation - ensure it's not just whitespace
  if (!address.trim()) {
    throw new Error('Invalid address format');
  }

  return true;
}

// Check if this is a partial lead (only basic info) or complete submission
function isPartialLead(data: Partial<LeadFormData>): boolean {
  const completeFields = [
    'firstName',
    'lastName',
    'email',
    'propertyCondition',
    'timeframe',
    'price'
  ];
  
  // Return true if ANY of the complete fields are missing
  return completeFields.some(field => !data[field as keyof LeadFormData]);
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toISOString();
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    if (!validateLeadData(data)) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Only proceed if this is a partial lead (form abandoned or timeout)
    if (!isPartialLead(data)) {
      return NextResponse.json({
        success: true,
        message: 'Complete form data detected, skipping partial lead submission'
      });
    }

    // Prepare data for sheet with timestamp and tracking
    const leadData: LeadFormData = {
      ...data,
      timestamp,
      lastUpdated: timestamp,
      leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const result = await appendLeadToSheet(leadData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save lead');
    }

    return NextResponse.json({ 
      success: true,
      leadId: leadData.leadId
    });

  } catch (error) {
    console.error('Error submitting lead:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 