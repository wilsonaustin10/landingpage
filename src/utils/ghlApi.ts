import { LeadFormData } from '@/types';

const GHL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GHL_API_BASE_URL = process.env.NEXT_PUBLIC_GHL_API_BASE_URL || 'https://rest.gohighlevel.com/v1';

// Check if API key exists but don't throw an error to allow graceful fallback
const isApiConfigured = !!GHL_API_KEY;

interface GHLResponse {
  success: boolean;
  error?: string;
  contactId?: string;
}

/**
 * Creates a new contact in GoHighLevel with partial lead data
 */
export async function createPartialLead(data: Partial<LeadFormData>): Promise<GHLResponse> {
  try {
    // If API key is not configured, log and return a graceful error
    if (!isApiConfigured) {
      console.warn('GoHighLevel API key is not configured. Skipping API call.');
      return {
        success: false,
        error: 'GoHighLevel integration is not configured'
      };
    }
    
    console.log('Creating partial lead with data:', {
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode
    });

    const requestBody = {
      phone: data.phone,
      address1: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      source: 'Website Form - Initial Contact',
      tags: ['Partial Lead'],
    };

    console.log('GHL API Request:', {
      url: `${GHL_API_BASE_URL}/contacts/`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestBody
    });

    const response = await fetch(`${GHL_API_BASE_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('GHL API Response status:', response.status);
    const responseData = await response.json();
    console.log('GHL API Response data:', responseData);

    if (!response.ok) {
      // Provide more detailed error for authorization issues
      if (response.status === 401) {
        throw new Error('GHL API Error: Unauthorized - Please check your API key');
      }
      throw new Error(`GHL API Error: ${responseData.message || response.statusText}`);
    }

    return {
      success: true,
      contactId: responseData.contact.id,
    };
  } catch (error) {
    console.error('Detailed error creating partial lead in GHL:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create contact in GHL',
    };
  }
}

/**
 * Updates an existing contact in GoHighLevel with complete form data
 */
export async function updateLeadWithFullDetails(data: LeadFormData): Promise<GHLResponse> {
  try {
    // If API key is not configured, log and return a graceful error
    if (!isApiConfigured) {
      console.warn('GoHighLevel API key is not configured. Skipping API call.');
      return {
        success: false,
        error: 'GoHighLevel integration is not configured'
      };
    }
    
    console.log('Updating lead with data:', {
      leadId: data.leadId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address
    });

    // Format property details for notes
    const propertyDetails = `
Property Details:
- Condition: ${data.propertyCondition}
- Timeframe to Sell: ${data.timeframe}
- Asking Price: ${data.price}
    `.trim();

    const requestBody = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address1: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      source: 'Website Form - Complete Submission',
      tags: ['Complete Lead'],
      notes: propertyDetails,
    };

    console.log('GHL API Request:', {
      url: `${GHL_API_BASE_URL}/contacts/${data.leadId}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestBody
    });

    const response = await fetch(`${GHL_API_BASE_URL}/contacts/${data.leadId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('GHL API Response status:', response.status);
    const responseData = await response.json();
    console.log('GHL API Response data:', responseData);

    if (!response.ok) {
      // Provide more detailed error for authorization issues
      if (response.status === 401) {
        throw new Error('GHL API Error: Unauthorized - Please check your API key');
      }
      throw new Error(`GHL API Error: ${responseData.message || response.statusText}`);
    }

    return {
      success: true,
      contactId: responseData.contact.id,
    };
  } catch (error) {
    console.error('Detailed error updating lead in GHL:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contact in GHL',
    };
  }
} 