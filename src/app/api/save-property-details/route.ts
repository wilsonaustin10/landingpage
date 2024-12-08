import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { headers } from 'next/headers';
import { rateLimit } from '@/utils/rateLimit';
import type { LeadFormData } from '@/types';

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Validate required environment variables
function validateConfig() {
  const requiredEnvVars = {
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Validate complete form data
function validateFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields
  if (!data.address?.trim()) {
    throw new Error('Property address is required');
  }

  if (!data.phone?.trim()) {
    throw new Error('Phone number is required');
  }

  // Phone number validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone)) {
    throw new Error('Invalid phone number format');
  }

  return true;
}

/**
 * API Route for saving complete property details
 * Used after initial lead capture for collecting additional information
 */
export async function POST(request: Request) {
  const logContext = {
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  try {
    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.warn('Rate limit exceeded', { ...logContext, ip });
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // 2. Validate environment variables
    validateConfig();

    // 3. Parse and validate request data
    const data = await request.json();
    if (!validateFormData(data)) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // 4. Prepare row data with tracking information
    const row = [
      logContext.timestamp,           // Timestamp
      data.address || '',            // Property Address
      data.phone || '',              // Phone
      data.email || '',              // Email
      data.firstName || '',          // First Name
      data.lastName || '',           // Last Name
      data.isPropertyListed || '',   // Listed Status
      data.timeframe || '',          // Timeframe
      data.propertyCondition || '',  // Condition
      data.price || '',             // Price
      ip,                           // IP Address
      logContext.requestId          // Request ID
    ];

    // 5. Append to Google Sheet
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Form Submissions!A:O',  // Updated range to include tracking columns
      valueInputOption: 'RAW',
      requestBody: {
        values: [row]
      },
    });

    console.log('Property details saved successfully', {
      ...logContext,
      updatedRange: appendResult.data.updates?.updatedRange,
      updatedRows: appendResult.data.updates?.updatedRows
    });

    return NextResponse.json({ 
      success: true,
      message: 'Property details saved successfully',
      requestId: logContext.requestId,
      details: {
        updatedRange: appendResult.data.updates?.updatedRange,
        updatedRows: appendResult.data.updates?.updatedRows
      }
    });

  } catch (error) {
    console.error('Error saving property details:', {
      ...logContext,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error
    });

    return NextResponse.json(
      { 
        error: 'Failed to save property details',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId: logContext.requestId
      },
      { status: 500 }
    );
  }
} 