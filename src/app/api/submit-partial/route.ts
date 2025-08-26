import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { appendLeadToSheet } from '@/utils/googleSheets';

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
async function sendToZapier(data: Partial<LeadFormData>) {
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
        submissionType: 'partial',
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
 * API Route for saving initial lead data (address and phone)
 * Called when user clicks first "Get Cash Offer" button
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Log incoming request
    console.log('Received partial form submission request');

    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Parse and validate request data
    let data;
    try {
      data = await request.json();
      console.log('Received form data:', {
        hasAddress: !!data.address,
        hasPhone: !!data.phone,
        phone: data.phone
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (!validatePartialData(data)) {
      console.error('Invalid form data:', data);
      return NextResponse.json(
        { error: 'Invalid partial form data - Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token if present
    if (data.recaptchaToken) {
      try {
        const recaptchaResult = await verifyRecaptchaToken(data.recaptchaToken);
        
        if (!recaptchaResult.success) {
          console.error('reCAPTCHA verification failed:', recaptchaResult.error);
          
          // In development mode, allow bypass if reCAPTCHA verification fails
          if (process.env.NODE_ENV === 'development') {
            console.warn('DEVELOPMENT MODE: Bypassing reCAPTCHA verification failure');
          } else {
            return NextResponse.json(
              { error: 'Security check failed. Please try again.' },
              { status: 400 }
            );
          }
        } else {
          console.log('reCAPTCHA verification passed with score:', recaptchaResult.score);
          
          // Save the reCAPTCHA score for fraud analytics
          data.recaptchaScore = recaptchaResult.score;
        }
      } catch (verifyError) {
        console.error('Error during reCAPTCHA verification:', verifyError);
        
        // In development mode, continue even if verification throws an error
        if (process.env.NODE_ENV === 'development') {
          console.warn('DEVELOPMENT MODE: Continuing despite reCAPTCHA verification error');
        } else {
          return NextResponse.json(
            { error: 'Security verification failed. Please try again later.' },
            { status: 500 }
          );
        }
      }
    } else {
      console.warn('No reCAPTCHA token provided');
      
      // In development mode, allow form submission without token
      if (process.env.NODE_ENV === 'development') {
        console.warn('DEVELOPMENT MODE: Proceeding without reCAPTCHA token');
      } else {
        return NextResponse.json(
          { error: 'Security token missing' },
          { status: 400 }
        );
      }
    }

    // Prepare data with timestamp and tracking (remove the token before saving)
    const { recaptchaToken, ...cleanData } = data;
    
    const leadData: Partial<LeadFormData> = {
      ...cleanData,
      timestamp,
      lastUpdated: timestamp,
      leadId,
      submissionType: 'partial'
    };

    console.log('Prepared lead data:', {
      leadId,
      timestamp,
      submissionType: 'partial'
    });

    // Send to both Zapier and Google Sheets in parallel
    const results = await Promise.allSettled([
      sendToZapier(leadData),
      appendLeadToSheet(leadData)
    ]);

    const [zapierResult, sheetsResult] = results;

    // Log results
    if (zapierResult.status === 'fulfilled') {
      console.log('Successfully sent to Zapier webhook');
    } else {
      console.error('Failed to send to Zapier:', zapierResult.reason);
    }

    if (sheetsResult.status === 'fulfilled' && sheetsResult.value.success) {
      console.log('Successfully sent to Google Sheets');
    } else if (sheetsResult.status === 'rejected') {
      console.error('Failed to send to Google Sheets:', sheetsResult.reason);
    } else if (sheetsResult.status === 'fulfilled' && !sheetsResult.value.success) {
      console.error('Google Sheets returned error:', sheetsResult.value.error);
    }

    // Return success if at least one integration succeeded
    if (zapierResult.status === 'fulfilled' || 
        (sheetsResult.status === 'fulfilled' && sheetsResult.value.success)) {
      return NextResponse.json({ 
        success: true,
        leadId,
        integrations: {
          zapier: zapierResult.status === 'fulfilled',
          googleSheets: sheetsResult.status === 'fulfilled' && sheetsResult.value.success
        }
      });
    } else {
      // Both failed
      throw new Error('Failed to save lead data to any integration');
    }

  } catch (error) {
    console.error('Error submitting partial form:', error);
    // Return a specific error message
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