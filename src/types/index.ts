export interface LeadFormData {
  // Address fields (required)
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;

  // Contact information (required)
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;

  // Property details
  isPropertyListed?: boolean;
  propertyCondition?: string;
  timeframe?: string;
  price?: string;

  // System tracking
  timestamp?: string;
  lastUpdated?: string;
  leadId?: string;
}

export interface FormState extends LeadFormData {
  isSubmitting?: boolean;
  error?: string;
}

export type FormStep = 
  | 'initial'
  | 'property-details'
  | 'timeline'
  | 'contact'
  | 'thank-you';

export interface FormErrors {
  address?: string;
  phone?: string;
  email?: string;
}

export interface SubmissionResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
}


 