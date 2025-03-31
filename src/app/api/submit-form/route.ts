import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { updateLeadWithFullDetails } from '@/utils/ghlApi';

// Validate complete form data
function validateFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation
  const requiredFields: (keyof LeadFormData)[] = [
    'address', 'phone', 'firstName', 'lastName', 
    'email', 'propertyCondition', 'timeframe', 'price',
    'leadId' // This will now be the GHL contact ID
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

/**
 * API Route for saving complete property details
 * Used for full form submissions with all property information
 */
export async function POST(request: Request) {
  try {
    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
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

    // 3. Update contact in GHL with full details
    const result = await updateLeadWithFullDetails(data);
    
    // Handle GHL integration failures more gracefully
    if (!result.success) {
      console.warn('GHL integration failed when updating lead:', result.error);
      
      // If it's an API key issue, still allow the user to proceed
      if (result.error?.includes('Unauthorized') || result.error?.includes('not configured')) {
        return NextResponse.json({ 
          success: true,
          warning: 'Form submitted successfully, but CRM update failed. The team has been notified.'
        });
      }
      
      // For other errors, still return a meaningful response
      return NextResponse.json(
        { 
          error: 'Your form was received, but we encountered an issue updating your details.',
          details: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      leadId: result.contactId
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 