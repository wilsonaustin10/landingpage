export interface LeadFormData {
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  timeframe?: string;
  propertyCondition?: string;
  reasonForSelling?: string;
  askingPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFeet?: string;
  isPropertyListed?: boolean;
  estimatedValue?: string;
  price?: string;
  placeId?: string;
}

export interface FormErrors {
  address?: string;
  phone?: string;
  email?: string;
}

export type FormStep = 
  | 'initial'
  | 'property-details'
  | 'property-listed'
  | 'timeline'
  | 'property-value'
  | 'contact'
  | 'thank-you';

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
} 