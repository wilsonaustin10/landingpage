import { NextResponse } from 'next/server';
import { appendLeadToSheet } from '@/utils/googleSheets';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';

// Validate complete form data
function validateFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation
  const requiredFields: (keyof LeadFormData)[] = [
    'address', 'phone', 'firstName', 'lastName', 
    'email', 'propertyCondition', 'timeframe', 'price',
    'leadId'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Phone number validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone as string)) {
    throw new Error('Invalid phone number format');
  }

  return true;
}

// Send data to Zapier webhook
async function sendToZapier(data: LeadFormData) {
  if (!process.env.ZAPIER_WEBHOOK_URL) {
    throw new Error('Zapier webhook URL not configured');
  }

  const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      submissionType: 'complete',
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send to Zapier: ${response.statusText}`);
  }

  return response.json();
}

/**
 * API Route for saving complete property details
 * Used for full form submissions with all property information
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
    if (!validateFormData(data)) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // 3. Prepare data with tracking information
    const formData: LeadFormData = {
      ...data,
      timestamp: data.timestamp || timestamp,
      lastUpdated: timestamp
    };

    // 4. Send to Zapier webhook
    try {
      await sendToZapier(formData);
    } catch (error) {
      console.error('Failed to send to Zapier:', error);
      // Continue with Google Sheets submission even if Zapier fails
    }

    // 5. Append to Google Sheet using shared utility
    const result = await appendLeadToSheet(formData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save form data');
    }

    return NextResponse.json({ 
      success: true,
      leadId: formData.leadId
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 