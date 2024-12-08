import debounce from 'lodash/debounce';

interface FormData {
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  phone?: string;
  email?: string;
  propertyCondition?: string;
  timeframe?: string;
  askingPrice?: string;
}

// Track last submission time to prevent duplicate submissions
const SUBMISSION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
let lastSubmissionTime: { [key: string]: number } = {};

// Save form data to localStorage
const saveToLocalStorage = (formId: string, data: Partial<FormData>): boolean => {
  try {
    const existingData = localStorage.getItem(formId);
    const updatedData = {
      ...JSON.parse(existingData || '{}'),
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(formId, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Check if enough time has passed since last submission
const canSubmitToCRM = (formId: string): boolean => {
  const now = Date.now();
  const lastSubmission = lastSubmissionTime[formId] || 0;
  return now - lastSubmission >= SUBMISSION_COOLDOWN;
};

// Generate unique key for form data to prevent duplicate submissions
const generateDataKey = (formData: Partial<FormData>): string => {
  const relevantData = {
    address: formData.address,
    phone: formData.phone,
    email: formData.email
  };
  return JSON.stringify(relevantData);
};

// Send partial form data to CRM with retry logic
const sendToCRM = async (formData: Partial<FormData>, retryCount = 0): Promise<boolean> => {
  try {
    const response = await fetch('/api/partial-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        tempEmail: localStorage.getItem('tempEmail'),
        source: typeof window !== 'undefined' ? window.location.href : '',
        submissionType: 'partial',
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send to CRM: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    if (responseData.data?.contact?.email?.includes('@gmail.com')) {
      localStorage.setItem('tempEmail', responseData.data.contact.email);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending to CRM:', error);
    
    // Retry logic for network errors
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return sendToCRM(formData, retryCount + 1);
    }
    
    return false;
  }
};

// Track partial submission in analytics
const trackPartialSubmission = (formData: Partial<FormData>): void => {
  try {
    // Google Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'partial_form_submission', {
        event_category: 'Lead',
        event_label: 'Partial Form Submit',
        value: Object.keys(formData).length,
        nonInteraction: true
      });
    }
    
    // Facebook Pixel event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'PartialFormSubmission', {
        content_name: 'Partial Lead Form',
        content_category: 'Lead',
        num_fields: Object.keys(formData).length,
        fields_completed: Object.keys(formData).join(',')
      });
    }
  } catch (error) {
    console.error('Error tracking analytics:', error);
  }
};

// Debounced function to handle form auto-save
export const autoSaveForm = debounce(async (formId: string, formData: Partial<FormData>): Promise<void> => {
  // Only proceed if we have meaningful data
  if (Object.keys(formData).length === 0) return;

  // Save to localStorage first
  const savedLocally = saveToLocalStorage(formId, formData);
  
  // If we have either address or phone, consider sending to CRM
  if ((formData.address || formData.phone) && canSubmitToCRM(formId)) {
    const dataKey = generateDataKey(formData);
    const previousData = localStorage.getItem(`${formId}_submitted`);
    
    // Check if this data combination was already submitted
    if (previousData !== dataKey) {
      const sentToCRM = await sendToCRM(formData);
      if (sentToCRM) {
        // Update submission tracking
        lastSubmissionTime[formId] = Date.now();
        localStorage.setItem(`${formId}_submitted`, dataKey);
        trackPartialSubmission(formData);
      }
    }
  }
}, 30000); // 30 second delay

// Function to retrieve saved form data
export const getSavedFormData = (formId: string): Partial<FormData> => {
  try {
    const savedData = localStorage.getItem(formId);
    return savedData ? JSON.parse(savedData) : {};
  } catch {
    return {};
  }
};

// Function to clear saved form data
export const clearSavedFormData = (formId: string): void => {
  try {
    localStorage.removeItem(formId);
    localStorage.removeItem(`${formId}_submitted`);
    delete lastSubmissionTime[formId];
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
}; 