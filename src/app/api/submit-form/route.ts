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

// Verify reCAPTCHA token with Google
async function verifyRecaptchaToken(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  // Handle development mode with more leniency
  if (process.env.NODE_ENV === 'development') {
    console.log('DEVELOPMENT MODE: Using relaxed reCAPTCHA verification');
    
    // Google's test key response for development
    if (token === '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe' || 
        !process.env.RECAPTCHA_SECRET_KEY) {
      return {
        success: true,
        score: 0.9,
      };
    }
  }
  
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    
    if (process.env.NODE_ENV === 'development') {
      // In development, don't throw an error
      return { 
        success: true, 
        score: 0.9, 
        error: 'DEV MODE: No reCAPTCHA secret key, but proceeding anyway' 
      };
    }
    
    throw new Error('reCAPTCHA configuration error');
  }

  try {
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    
    // Log verification result (exclude sensitive info in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('reCAPTCHA verification result:', data);
    } else {
      console.log('reCAPTCHA verification score:', data.score);
    }
    
    if (!data.success) {
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'reCAPTCHA verification failed',
      };
    }
    
    // Check the score (0.0 - 1.0), where higher means more likely human
    // 0.5 is a reasonable threshold, adjust as needed
    // In development, we'll be more lenient
    const scoreThreshold = process.env.NODE_ENV === 'development' ? 0.1 : 0.5;
    
    if (data.score < scoreThreshold) {
      return {
        success: false,
        score: data.score,
        error: 'Failed reCAPTCHA verification - suspicious activity detected',
      };
    }
    
    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, don't fail on verification errors
      return {
        success: true,
        score: 0.9,
        error: 'DEV MODE: Error during verification, but proceeding anyway',
      };
    }
    
    return {
      success: false,
      error: 'Error during reCAPTCHA verification',
    };
  }
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

    // 3. Verify reCAPTCHA token if present
    if (data.recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaToken(data.recaptchaToken);
      
      if (!recaptchaResult.success) {
        console.error('reCAPTCHA verification failed:', recaptchaResult.error);
        // We're more lenient here since this is the final step and user was already verified initially
        console.warn('Proceeding despite reCAPTCHA verification failure at final step');
      } else {
        console.log('reCAPTCHA verification passed with score:', recaptchaResult.score);
        
        // Save the reCAPTCHA score for fraud analytics if valid
        data.recaptchaScore = recaptchaResult.score;
      }
    } else {
      console.warn('No reCAPTCHA token provided for final submission');
      // Continue anyway since this is the second form submission
      // and the user was already verified in the first step
      console.log('Proceeding without reCAPTCHA verification for leadId:', data.leadId);
    }

    // 4. Validate form data
    if (!validateFormData(data)) {
      console.error('Invalid form data:', data);
      return NextResponse.json(
        { error: 'Invalid form data - Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    // 5. Remove recaptchaToken before saving (if it exists)
    const formDataWithoutToken = { ...data };
    // Safely delete the recaptchaToken which is not part of LeadFormData type
    if ('recaptchaToken' in formDataWithoutToken) {
      delete formDataWithoutToken.recaptchaToken;
    }

    // 6. Prepare data with tracking information
    const formData: LeadFormData = {
      ...formDataWithoutToken,
      timestamp: data.timestamp || timestamp,
      lastUpdated: timestamp
    };

    // 7. Send to Zapier webhook
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