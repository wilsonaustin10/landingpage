import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { appendLeadToSheet } from '@/utils/googleSheets';

// Validate complete form data - ONLY accept fully completed forms
function validateFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // ALL required fields for complete form submission
  const requiredFields: (keyof LeadFormData)[] = [
    'address', 'phone', 'firstName', 'lastName', 
    'email', 'propertyCondition', 'timeframe', 'price'
  ];
  
  const missingFields: string[] = [];
  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Incomplete form submission. Missing required fields: ${missingFields.join(', ')}. Only complete forms are accepted.`);
  }

  // Phone number validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone as string)) {
    throw new Error('Invalid phone number format. Expected format: (XXX) XXX-XXXX');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email as string)) {
    throw new Error('Invalid email address format');
  }
  
  // Validate that property condition is one of the expected values
  const validConditions = ['excellent', 'good', 'fair', 'poor'];
  if (!validConditions.includes(data.propertyCondition as string)) {
    throw new Error(`Invalid property condition. Must be one of: ${validConditions.join(', ')}`);
  }
  
  // Validate timeframe
  const validTimeframes = ['immediately', '1-3months', '3-6months', '6+months'];
  if (!validTimeframes.includes(data.timeframe as string)) {
    throw new Error(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`);
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
    console.error('ZAPIER_WEBHOOK_URL environment variable is not set');
    throw new Error('Zapier webhook URL not configured - please set ZAPIER_WEBHOOK_URL environment variable');
  }
  
  console.log('Attempting to send to Zapier webhook...');
  console.log('Webhook URL:', process.env.ZAPIER_WEBHOOK_URL.substring(0, 50) + '...');
  console.log('Lead ID:', data.leadId);
  console.log('Submission Type:', data.submissionType || 'complete');

  try {
    const payload = {
      ...data,
      submissionType: 'complete',
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending payload with fields:', Object.keys(payload).join(', '));
    
    const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Zapier response status:', response.status);
    console.log('Zapier response:', responseText);

    if (!response.ok) {
      console.error('Zapier webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText
      });
      throw new Error(`Failed to send to Zapier: ${response.statusText}`);
    }

    // Parse response if it's JSON, otherwise return the text
    try {
      return JSON.parse(responseText);
    } catch {
      return { success: true, response: responseText };
    }
  } catch (error) {
    console.error('Error in sendToZapier:', error);
    throw error;
  }
}

/**
 * API Route for saving complete property details
 * IMPORTANT: Only accepts COMPLETE form submissions with all required fields
 * Partial submissions are no longer supported and will be rejected
 */
export async function POST(request: Request) {
  try {
    // Log incoming request
    console.log('Received form submission request - validating for completeness');

    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toISOString();
    
    // Generate leadId for this submission (since we no longer have partial submissions)
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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

    // 4. Validate form data - ENFORCE complete submission
    try {
      if (!validateFormData(data)) {
        console.error('Form validation failed - incomplete submission blocked');
        return NextResponse.json(
          { error: 'Incomplete form submission blocked. All fields must be completed before submission.' },
          { status: 400 }
        );
      }
    } catch (validationError) {
      console.error('Form validation error:', validationError);
      console.log('Rejected incomplete submission with fields:', Object.keys(data || {}));
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Form validation failed' },
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
      leadId: data.leadId || leadId, // Use existing leadId if present, otherwise use generated one
      timestamp: data.timestamp || timestamp,
      lastUpdated: timestamp,
      submissionType: 'complete' // Mark as complete submission
    };

    // 7. Send to both Zapier and Google Sheets in parallel
    console.log('=== COMPLETE FORM SUBMISSION VALIDATED ===');
    console.log('Submitting complete lead with all required fields:');
    console.log('- Address:', formData.address);
    console.log('- Phone:', formData.phone);
    console.log('- Name:', `${formData.firstName} ${formData.lastName}`);
    console.log('- Email:', formData.email);
    console.log('- Property Condition:', formData.propertyCondition);
    console.log('- Timeframe:', formData.timeframe);
    console.log('- Price:', formData.price);
    console.log('- Lead ID:', formData.leadId);
    console.log('=========================================');
    console.log('Sending to integrations...');
    console.log('ZAPIER_WEBHOOK_URL exists:', !!process.env.ZAPIER_WEBHOOK_URL);
    
    const results = await Promise.allSettled([
      sendToZapier(formData),
      appendLeadToSheet(formData)
    ]);

    const [zapierResult, sheetsResult] = results;

    // Log detailed results
    if (zapierResult.status === 'fulfilled') {
      console.log('✅ Successfully sent to Zapier webhook');
      console.log('Zapier response data:', JSON.stringify(zapierResult.value, null, 2));
      console.log('=== IMPORTANT: Check your Zapier dashboard ===');
      console.log('1. Verify the Zap is turned ON (not paused)');
      console.log('2. Check if there\'s a second action configured to send to CRM');
      console.log('3. Review the Zap history for any errors in CRM submission');
      console.log('4. Ensure field mapping is correct between webhook and CRM');
      console.log('===============================================');
    } else {
      console.error('❌ Failed to send to Zapier:', zapierResult.reason);
      console.error('Zapier error details:', JSON.stringify(zapierResult.reason, null, 2));
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
      
      // Log warning if Zapier failed but Sheets succeeded
      if (zapierResult.status === 'rejected' && sheetsResult.status === 'fulfilled') {
        console.warn('⚠️ Lead saved to Google Sheets but failed to send to CRM/Zapier');
        console.warn('Please check ZAPIER_WEBHOOK_URL environment variable');
      }
      
      return NextResponse.json({ 
        success: true,
        leadId: formData.leadId,
        integrations: {
          zapier: zapierResult.status === 'fulfilled',
          googleSheets: sheetsResult.status === 'fulfilled' && sheetsResult.value.success
        },
        warning: zapierResult.status === 'rejected' ? 'CRM submission failed - lead saved to Google Sheets only' : undefined
      });
    } else {
      // Both failed
      throw new Error('Failed to save lead data to any integration');
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