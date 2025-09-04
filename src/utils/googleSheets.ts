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
      
      // IMPORTANT: Only accept complete submissions - partial submissions are blocked
      if (data.submissionType === 'partial') {
        console.error('BLOCKED: Partial submission attempted to Google Sheets');
        console.error('Only complete forms with all required fields are accepted');
        return { 
          success: false, 
          error: 'Partial submissions are no longer accepted. All form fields must be completed.' 
        };
      }

      // Validate that this is a complete submission with all required fields
      const requiredFields = ['address', 'phone', 'firstName', 'lastName', 'email', 'propertyCondition', 'timeframe', 'price'];
      const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
      
      if (missingFields.length > 0) {
        console.error('BLOCKED: Incomplete submission to Google Sheets');
        console.error('Missing required fields:', missingFields.join(', '));
        return {
          success: false,
          error: `Incomplete submission blocked. Missing fields: ${missingFields.join(', ')}`
        };
      }

      // Process complete submission - append as a new row with all the data
      const newRow = [
        timestamp,                               // A: timestamp
        data.leadId || `lead_${Date.now()}`,    // B: leadId (generate if not provided)
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

      console.log('Successfully appended complete lead to Google Sheet');
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