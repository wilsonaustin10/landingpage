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

  if (!data.phone || typeof data.phone !== 'string') {
    throw new Error('Phone number is required');
  }

  if (!data.address || typeof data.address !== 'string') {
    throw new Error('Address is required');
  }

  // Phone number validation (XXX) XXX-XXXX
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone)) {
    throw new Error('Invalid phone number format');
  }

  // Address validation - ensure it's not just whitespace
  if (!data.address.trim()) {
    throw new Error('Invalid address format');
  }

  return true;
}

/**
 * API Route for quick lead capture with essential information
 * Used for initial lead capture before full form submission
 */
export async function POST(request: Request) {
  const logContext = {
    timestamp: new Date().toISOString(),
    leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.warn('Rate limit exceeded for lead capture', { ...logContext, ip });
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

    // Prepare data for sheet with timestamp and tracking
    const leadData = {
      ...data,
      timestamp: logContext.timestamp,
      lastUpdated: logContext.timestamp,
      ipAddress: ip,
      leadId: logContext.leadId
    };

    const result = await appendLeadToSheet(leadData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save lead');
    }

    return NextResponse.json({ 
      success: true,
      leadId: logContext.leadId
    });

  } catch (error) {
    console.error('Error capturing lead:', {
      ...logContext,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error
    });

    return NextResponse.json(
      { 
        error: 'Failed to capture lead',
        message: error instanceof Error ? error.message : 'Unknown error',
        leadId: logContext.leadId
      },
      { status: 500 }
    );
  }
} 