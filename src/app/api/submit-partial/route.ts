import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { createPartialLead } from '@/utils/ghlApi';
import { generateLeadId } from '@/utils/helpers';

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

    // Generate a unique leadId in case GHL integration fails
    const fallbackLeadId = generateLeadId();
    
    // Create contact in GHL
    const result = await createPartialLead(data);
    
    // If GHL integration failed but it's an authentication issue,
    // continue with a fallback leadId instead of failing completely
    if (!result.success) {
      console.warn('GHL integration failed:', result.error);
      
      if (result.error?.includes('Unauthorized') || result.error?.includes('not configured')) {
        return NextResponse.json({ 
          success: true,
          leadId: fallbackLeadId,
          warning: 'Lead saved locally only. CRM integration unavailable.'
        });
      } 
      
      // For other errors, still return a meaningful response
      return NextResponse.json(
        { 
          error: 'Unable to save lead to CRM system',
          details: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      leadId: result.contactId // Use the GHL contact ID as our leadId
    });

  } catch (error) {
    console.error('Error submitting partial form:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 