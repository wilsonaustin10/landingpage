import { NextResponse } from 'next/server';
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

  try {
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
      const errorText = await response.text();
      console.error('Zapier webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to send to Zapier: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error in sendToZapier:', error);
    throw error;
  }
}

/**
 * API Route for saving complete property details
 * Used for full form submissions with all property information
 */
export async function POST(request: Request) {
  try {
    // Log incoming request
    console.log('Received complete form submission request');

    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toISOString();
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // 2. Parse and validate request data
    let data;
    try {
      data = await request.json();
      console.log('Received form data:', {
        hasRequiredFields: true,
        leadId: data.leadId
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!validateFormData(data)) {
      console.error('Invalid form data:', data);
      return NextResponse.json(
        { error: 'Invalid form data - Missing required fields or invalid format' },
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
      console.log('Successfully sent to Zapier webhook');
      
      return NextResponse.json({ 
        success: true,
        leadId: formData.leadId
      });
    } catch (error) {
      console.error('Failed to send to Zapier:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error submitting form:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 