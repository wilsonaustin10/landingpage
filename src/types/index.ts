export interface LeadFormData {
  // Address fields (required)
  address: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  placeId: string;

  // Contact fields (required)
  phone: string;
  firstName: string;
  lastName: string;
  email: string;

  // Property details
  isPropertyListed: boolean;
  propertyCondition: string;
  timeframe: string;
  price: string;

  // Tracking
  leadId: string;
  timestamp: string;
  lastUpdated: string;
  submissionType?: 'partial' | 'complete';
  consent?: boolean;
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

export * from './form';

export interface SubmissionResponse {
  success: boolean;
  error?: string;
  message?: string;
  leadId?: string;
}

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
}

// ... any other exports ...


 