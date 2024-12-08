import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import type { LeadFormData } from '../types';

interface LeadData extends LeadFormData {
  timestamp?: string;
  lastUpdated?: string;
}

// Initialize auth client as shown in ISD-soft article
const getAuthClient = () => {
  try {
    return new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('Error initializing auth client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
};

// Constants for sheet configuration
const SHEET_NAME = 'Form Submissions';
const COLUMN_RANGE = 'A:Q';
const HEADERS = [
  'Timestamp',
  'Lead ID',
  'Address',
  'Street Address',
  'City',
  'State',
  'Postal Code',
  'Phone',
  'Place ID',
  'First Name',
  'Last Name',
  'Email',
  'Property Listed',
  'Property Condition',
  'Timeframe',
  'Price',
  'Last Updated'
];

// Format lead data according to sheet structure
const formatLeadData = (data: LeadData): string[] => {
  const timestamp = new Date().toISOString();
  return [
    timestamp, // timestamp
    data.leadId || '', // leadId
    data.address || '',
    data.streetAddress || '',
    data.city || '',
    data.state || '',
    data.postalCode || '',
    data.phone || '',
    data.placeId || '',
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    data.isPropertyListed ? 'Yes' : 'No',
    data.propertyCondition || '',
    data.timeframe || '',
    data.price || '',
    timestamp, // lastUpdated
  ];
};

// Validate environment variables as shown in hackernoon article
const validateConfig = () => {
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
};

// Retry mechanism as recommended in ISD-soft article
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxRetries) break;
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Ensure sheet exists, create if it doesn't
async function ensureSheetExists(sheets: any, spreadsheetId: string) {
  try {
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title', // Optimize by requesting only needed fields
    });

    // Check if our sheet exists
    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet: { properties?: { title?: string } }) => sheet.properties?.title === SHEET_NAME
    );

    if (!sheetExists) {
      console.log(`Creating sheet "${SHEET_NAME}"...`);
      
      // Create new sheet with frozen header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                  gridProperties: {
                    frozenRowCount: 1 // Freeze header row
                  }
                }
              }
            }
          ]
        }
      });

      // Add headers using batchUpdate for better performance
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: [{
            range: `${SHEET_NAME}!A1:Q1`,
            values: [HEADERS]
          }]
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error ensuring sheet exists:', error);
    throw error;
  }
}

// Main function following sheetsinstructions.md pattern
export async function appendLeadToSheet(leadData: LeadData) {
  const logContext = { 
    leadId: leadData.leadId || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString() 
  };

  try {
    // 1. Validate configuration
    validateConfig();

    // 2. Initialize auth client
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // 3. Ensure sheet exists
    await ensureSheetExists(sheets, process.env.GOOGLE_SHEETS_SPREADSHEET_ID!);

    // 4. Format data for sheet
    const dataWithId = {
      ...leadData,
      leadId: logContext.leadId
    };
    const values = [formatLeadData(dataWithId)];

    // 5. Append to sheet using batchUpdate for better performance
    const response = await retryOperation(() => 
      sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
        range: `${SHEET_NAME}!${COLUMN_RANGE}`,
        valueInputOption: 'USER_ENTERED', // Changed to handle date formatting
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values }
      })
    );

    console.log('Lead successfully added to sheet', {
      ...logContext,
      updatedRange: response.data.updates?.updatedRange,
      updatedRows: response.data.updates?.updatedRows,
    });

    return { 
      success: true,
      leadId: logContext.leadId,
    };

  } catch (error) {
    console.error('Error in appendLeadToSheet:', {
      ...logContext,
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      leadId: logContext.leadId,
    };
  }
} 