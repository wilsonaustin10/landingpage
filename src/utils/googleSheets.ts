import { google } from 'googleapis';
import type { LeadFormData } from '../types';

async function getSheet() {
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    throw new Error('Missing required Google Sheets credentials');
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export async function appendLeadToSheet(data: Partial<LeadFormData>) {
  try {
    const sheets = await getSheet();
    
    // Format data for sheet (A to Q)
    const row = [
      data.timestamp || new Date().toISOString(),  // A: timestamp
      data.leadId || `lead_${Date.now()}`,         // B: leadId
      data.address || '',                          // C: address
      data.streetAddress || '',                    // D: streetAddress
      data.city || '',                            // E: city
      data.state || '',                           // F: state
      data.postalCode || '',                      // G: postalCode
      data.phone || '',                           // H: phone
      data.placeId || '',                         // I: placeId
      data.firstName || '',                       // J: firstName
      data.lastName || '',                        // K: lastName
      data.email || '',                           // L: email
      data.isPropertyListed ? 'Yes' : 'No',       // M: isPropertyListed
      data.propertyCondition || '',               // N: propertyCondition
      data.timeframe || '',                       // O: timeframe
      data.price || '',                           // P: price
      new Date().toISOString()                    // Q: lastUpdated
    ];

    // According to Google Sheets API docs:
    // - Sheet names with spaces must be quoted
    // - Range must be in A1 notation
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "'Form Submissions'!A:Q",  // Updated to use correct sheet name and A1 notation
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',  // Added to ensure new rows are inserted
      requestBody: {
        values: [row]
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to append to sheet');
    }

    return { success: true };
  } catch (error) {
    console.error('Error appending to sheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to append to sheet' 
    };
  }
} 