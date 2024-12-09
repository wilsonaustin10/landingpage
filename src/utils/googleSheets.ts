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
    const timestamp = new Date().toISOString();
    
    // For partial leads (initial submission)
    if (data.submissionType === 'partial') {
      const row = [
        timestamp,                                // A: timestamp
        data.leadId,                             // B: leadId
        data.address || '',                      // C: address
        data.streetAddress || '',                // D: streetAddress
        data.city || '',                         // E: city
        data.state || '',                        // F: state
        data.postalCode || '',                   // G: postalCode
        data.phone || '',                        // H: phone
        data.placeId || '',                      // I: placeId
        '',                                      // J: firstName (empty for partial)
        '',                                      // K: lastName (empty for partial)
        '',                                      // L: email (empty for partial)
        '',                                      // M: isPropertyListed
        '',                                      // N: propertyCondition
        '',                                      // O: timeframe
        '',                                      // P: price
        timestamp                                // Q: lastUpdated
      ];

      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: "'Form Submissions'!A:Q",
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [row]
        }
      });

      if (appendResponse.status !== 200) {
        throw new Error('Failed to append partial lead');
      }

      return { success: true };
    }

    // For complete submissions, find and update existing row
    if (!data.leadId) {
      throw new Error('leadId is required for complete submissions');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "'Form Submissions'!A:Q",
    });

    const rows = response.data.values || [];
    const leadIdIndex = 1; // Column B contains leadId
    const existingRowIndex = rows.findIndex(row => row[leadIdIndex] === data.leadId);

    if (existingRowIndex <= 0) {
      throw new Error('No matching partial lead found');
    }

    // Update existing row with complete data
    const row = [
      rows[existingRowIndex][0],                 // A: Keep original timestamp
      data.leadId,                               // B: Keep same leadId
      data.address || rows[existingRowIndex][2], // C: address
      data.streetAddress || rows[existingRowIndex][3],
      data.city || rows[existingRowIndex][4],
      data.state || rows[existingRowIndex][5],
      data.postalCode || rows[existingRowIndex][6],
      data.phone || rows[existingRowIndex][7],
      data.placeId || rows[existingRowIndex][8],
      data.firstName || '',                      // J: firstName
      data.lastName || '',                       // K: lastName
      data.email || '',                          // L: email
      data.isPropertyListed ? 'Yes' : 'No',      // M: isPropertyListed
      data.propertyCondition || '',              // N: propertyCondition
      data.timeframe || '',                      // O: timeframe
      data.price || '',                          // P: price
      timestamp                                  // Q: lastUpdated
    ];

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `'Form Submissions'!A${existingRowIndex + 1}:Q${existingRowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    if (updateResponse.status !== 200) {
      throw new Error('Failed to update complete submission');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in Google Sheets operation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process sheet operation' 
    };
  }
} 