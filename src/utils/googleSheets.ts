import { google } from 'googleapis';
import type { LeadFormData } from '../types';

class GoogleSheetsClient {
  private sheets: any;
  private auth: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!credentials) {
        console.warn('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
        return;
      }

      console.log('Attempting to parse Google Service Account credentials...');
      
      let credentialsJson;
      try {
        credentialsJson = JSON.parse(credentials);
      } catch (e) {
        try {
          credentialsJson = JSON.parse(credentials.replace(/\\n/g, '\n'));
        } catch (e2) {
          console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY. Make sure it\'s valid JSON.');
          console.error('First 100 chars of key:', credentials.substring(0, 100));
          throw e2;
        }
      }
      
      console.log('Service account email:', credentialsJson.client_email);
      
      this.auth = new google.auth.GoogleAuth({
        credentials: credentialsJson,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      console.log('Google Sheets client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      this.initialized = false;
    }
  }

  async appendPropertyLead(data: Partial<LeadFormData>) {
    console.log('appendPropertyLead called with data:', { 
      leadId: data.leadId, 
      submissionType: data.submissionType 
    });
    
    if (!this.initialized) {
      console.log('Google Sheets client not initialized, skipping property lead submission');
      return { success: false, error: 'Google Sheets not configured' };
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;
    
    if (!spreadsheetId) {
      console.log('GOOGLE_SHEETS_PROPERTY_ID environment variable not set');
      return { success: false, error: 'Sheet ID not configured' };
    }
    
    console.log('Using property sheet ID:', spreadsheetId);

    try {
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

        const response = await this.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A:Q',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [row]
          }
        });

        if (response.status !== 200) {
          throw new Error('Failed to append partial lead');
        }

        console.log('Successfully appended partial lead to Google Sheet');
        return { success: true };
      }

      // For complete submissions, find and update existing row
      if (!data.leadId) {
        throw new Error('leadId is required for complete submissions');
      }

      const getResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A:Q',
      });

      const rows: any[][] = getResponse.data.values || [];
      const leadIdIndex = 1; // Column B contains leadId
      const existingRowIndex = rows.findIndex((row: any[]) => row[leadIdIndex] === data.leadId);

      if (existingRowIndex <= 0) {
        // No existing row found, create new one with complete data
        const newRow = [
          timestamp,                               // A: timestamp
          data.leadId,                            // B: leadId
          data.address || '',                     // C: address
          data.streetAddress || '',               // D: streetAddress
          data.city || '',                        // E: city
          data.state || '',                       // F: state
          data.postalCode || '',                  // G: postalCode
          data.phone || '',                       // H: phone
          data.placeId || '',                     // I: placeId
          data.firstName || '',                   // J: firstName
          data.lastName || '',                    // K: lastName
          data.email || '',                       // L: email
          data.isPropertyListed ? 'Yes' : 'No',   // M: isPropertyListed
          data.propertyCondition || '',           // N: propertyCondition
          data.timeframe || '',                   // O: timeframe
          data.price || '',                       // P: price
          timestamp                               // Q: lastUpdated
        ];

        const appendResponse = await this.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A:Q',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [newRow]
          }
        });

        if (appendResponse.status !== 200) {
          throw new Error('Failed to append complete lead');
        }

        console.log('Successfully appended complete lead to Google Sheet (new row)');
        return { success: true };
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

      const updateResponse = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${existingRowIndex + 1}:Q${existingRowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row]
        }
      });

      if (updateResponse.status !== 200) {
        throw new Error('Failed to update complete submission');
      }

      console.log('Successfully updated lead in Google Sheet');
      return { success: true };
    } catch (error) {
      console.error('Error in Google Sheets operation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process sheet operation' 
      };
    }
  }

  async addHeadersIfEmpty(spreadsheetId: string, headers: string[], range: string = 'Sheet1!A1') {
    if (!this.initialized) return false;

    try {
      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range,
      });

      if (!result.data.values || result.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        });
        
        const sheetId = 0;
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat.textFormat.bold',
              },
            }],
          },
        });
        
        console.log('Added headers to sheet');
      }

      return true;
    } catch (error) {
      console.error('Error adding headers:', error);
      return false;
    }
  }
}

export const googleSheetsClient = new GoogleSheetsClient();

export async function initializeGoogleSheets() {
  const propertySheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;

  if (propertySheetId) {
    const propertyHeaders = [
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
      'Is Listed',
      'Property Condition',
      'Timeframe',
      'Price',
      'Last Updated'
    ];
    
    await googleSheetsClient.addHeadersIfEmpty(propertySheetId, propertyHeaders, 'Sheet1!A1:Q1');
  }
}

// Legacy export for backward compatibility
export async function appendLeadToSheet(data: Partial<LeadFormData>) {
  await initializeGoogleSheets();
  return googleSheetsClient.appendPropertyLead(data);
}