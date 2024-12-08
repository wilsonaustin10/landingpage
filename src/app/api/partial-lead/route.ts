import { NextResponse } from 'next/server';

const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GO_HIGH_LEVEL_LOCATION_ID = process.env.GO_HIGH_LEVEL_LOCATION_ID;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts: { [key: string]: { count: number; timestamp: number } } = {};

// Validate phone number format
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\d{10,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting check
const isRateLimited = (clientId: string): boolean => {
  const now = Date.now();
  const clientRequests = requestCounts[clientId];

  if (!clientRequests || now - clientRequests.timestamp >= RATE_LIMIT_WINDOW) {
    requestCounts[clientId] = { count: 1, timestamp: now };
    return false;
  }

  if (clientRequests.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientRequests.count++;
  return false;
};

// Define interfaces for type safety
interface CRMCustomFields {
  property_condition: string;
  reason_for_selling: string;
  estimated_value: string;
  minimum_price: string;
  timeframe: string;
  submission_type: string;
  last_updated: string;
  client_ip: string;
  is_temp_email: boolean;
}

interface CRMData {
  locationId: string;
  type: string;
  source: string;
  tags: string[];
  customFields: CRMCustomFields;
  address?: {
    line1: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Generate a temporary email for partial leads
const generateTempEmail = (data: any): string => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  const identifier = data.address ? 
    data.address.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toLowerCase() : 
    `lead${randomNum}`;
  return `${identifier}.${timestamp}@gmail.com`;
};

// Get or create temporary email
const getOrCreateTempEmail = (data: any): string => {
  const stored = data.tempEmail;
  if (stored) return stored;
  
  const newTemp = generateTempEmail(data);
  return newTemp;
};

// Search for existing contact by email
const findExistingContact = async (email: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/search?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Error searching for contact:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.contacts && data.contacts.length > 0) {
      return data.contacts[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error searching for contact:', error);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Add detailed logging
    console.log('Raw request data:', {
      fullData: data,
      addressPresent: !!data.address,
      phonePresent: !!data.phone,
      addressValue: data.address,
      phoneValue: data.phone
    });

    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      hasApiKey: !!GOHIGHLEVEL_API_KEY,
      hasLocationId: !!GO_HIGH_LEVEL_LOCATION_ID,
      nodeEnv: process.env.NODE_ENV,
      envKeys: Object.keys(process.env)
    });

    // Get client IP or identifier
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limiting
    if (isRateLimited(clientId)) {
      console.log('Rate limited request from:', clientId);
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Validate API configuration
    if (!GOHIGHLEVEL_API_KEY) {
      console.error('Missing Go High Level API key');
      return NextResponse.json(
        { error: 'Service configuration error - Missing API key' },
        { status: 500 }
      );
    }

    if (!GO_HIGH_LEVEL_LOCATION_ID) {
      console.error('Missing Go High Level Location ID');
      return NextResponse.json(
        { error: 'Service configuration error - Missing Location ID' },
        { status: 500 }
      );
    }

    console.log('Received form data:', {
      hasAddress: !!data.address,
      hasPhone: !!data.phone,
      hasEmail: !!data.email,
      source: data.source,
      contactId: data.contactId,
      tempEmail: data.tempEmail
    });
    
    // Prepare data for Go High Level
    const crmData: CRMData = {
      locationId: GO_HIGH_LEVEL_LOCATION_ID,
      type: 'lead',
      source: data.source || 'Website Form',
      tags: ['partial_submission'],
      customFields: {
        property_condition: data.propertyCondition || '',
        reason_for_selling: data.reasonForSelling || '',
        estimated_value: data.estimatedValue || '',
        minimum_price: data.minimumPrice || '',
        timeframe: data.timeframe || '',
        submission_type: data.submissionType || 'partial',
        last_updated: data.timestamp || new Date().toISOString(),
        client_ip: clientId,
        is_temp_email: !data.email
      }
    };

    // Add contact fields only if they are valid
    if (data.address) {
      crmData.address = {
        line1: data.address,
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: 'US'
      };
    }

    if (data.phone) {
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (isValidPhone(cleanPhone)) {
        crmData.phone = cleanPhone;
      }
    }

    // Handle contact ID and email
    let existingContactId = data.contactId || null;
    
    if (!existingContactId && data.tempEmail) {
      // Try to find contact by temp email
      existingContactId = await findExistingContact(data.tempEmail);
    }

    if (data.email && isValidEmail(data.email)) {
      // Real email provided
      crmData.email = data.email;
      if (!existingContactId) {
        // Check if contact exists with this email
        existingContactId = await findExistingContact(data.email);
      }
    } else if (data.tempEmail) {
      // Use existing temp email
      crmData.email = data.tempEmail;
    } else {
      // Generate new temp email only if we don't have any email
      crmData.email = generateTempEmail(data);
    }

    // Add name fields if present
    if (data.firstName) {
      crmData.firstName = data.firstName;
    }
    if (data.lastName) {
      crmData.lastName = data.lastName;
    }

    console.log('Preparing to send to CRM:', {
      url: existingContactId 
        ? `https://rest.gohighlevel.com/v1/contacts/${existingContactId}`
        : 'https://rest.gohighlevel.com/v1/contacts/',
      method: existingContactId ? 'PUT' : 'POST',
      hasAuth: !!GOHIGHLEVEL_API_KEY,
      dataShape: Object.keys(crmData)
    });

    // Send to Go High Level CRM
    const response = await fetch(
      existingContactId 
        ? `https://rest.gohighlevel.com/v1/contacts/${existingContactId}`
        : 'https://rest.gohighlevel.com/v1/contacts/',
      {
        method: existingContactId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(crmData)
      }
    );

    const responseData = await response.json();
    console.log('CRM Response:', {
      status: response.status,
      ok: response.ok,
      data: responseData
    });

    // Set response headers for contact tracking
    const headers = new Headers();
    const finalContactId = existingContactId || responseData.contact?.id;
    if (finalContactId) {
      headers.set('X-Contact-Id', finalContactId);
    }
    if (crmData.email) {
      headers.set('X-Temp-Email', crmData.email);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to save lead data' },
        { status: response.status, headers }
      );
    }

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 