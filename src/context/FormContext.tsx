'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormState, FormStep, FormErrors, SubmissionResponse } from '../types';

interface FormContextType {
  formState: FormState;
  updateFormData: (data: Partial<FormState>) => void;
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  isStepCompleted: (step: FormStep) => boolean;
  clearFormData: () => void;
  submitForm: (recaptchaToken?: string) => Promise<SubmissionResponse>;
  errors: FormErrors;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialState: FormState = {
  address: '',
  phone: '',
  consent: false,
  firstName: '',
  lastName: '',
  email: '',
  propertyCondition: '',
  timeframe: '',
  price: '',
  isSubmitting: false,
  error: '',
  leadId: '',
};

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formState, setFormState] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leadFormData');
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    }
    return initialState;
  });

  // Track form load time for analytics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).pageLoadTime = Date.now();
    }
  }, []);

  const [currentStep, setCurrentStep] = useState<FormStep>('initial');
  const [errors, setErrors] = useState<FormErrors>({});

  // Persist form data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !formState.isSubmitting) {
      localStorage.setItem('leadFormData', JSON.stringify(formState));
    }
  }, [formState]);


  // Optimized form state updates with validation
  const updateFormData = (newData: Partial<FormState>) => {
    setFormState(prev => {
      const updated = { ...prev, ...newData };
      
      // Validate critical fields immediately
      const criticalErrors: FormErrors = {};
      if (updated.phone && !/^\+?[\d\s-()]{10,}$/.test(updated.phone)) {
        criticalErrors.phone = 'Invalid phone format';
      }
      if (updated.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email)) {
        criticalErrors.email = 'Invalid email format';
      }
      
      // Update errors if critical validation fails
      if (Object.keys(criticalErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...criticalErrors }));
      }
      
      return updated;
    });
  };

  // Enhanced form validation with detailed error messages
  const validateForm = (): boolean => {
    const newErrors = {} as FormErrors;

    // Required fields validation with specific messages
    if (!formState.address?.trim()) {
      newErrors.address = 'Property address is required';
    }
    if (!formState.phone?.trim()) {
      newErrors.phone = 'Valid phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formState.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formState.consent) {
      newErrors.consent = 'You must consent to be contacted';
    }
    if (formState.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Additional field validations based on current step
    if (currentStep === 'property-details' && !formState.propertyCondition) {
      newErrors.propertyCondition = 'Please select property condition';
    }
    if (currentStep === 'timeline' && !formState.timeframe) {
      newErrors.timeframe = 'Please select your preferred timeframe';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFormData = () => {
    setFormState(initialState);
    setErrors({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('leadFormData');
    }
  };


  // Modified step completion handler
  const isStepComplete = (step: FormStep): boolean => {
    switch (step) {
      case 'initial':
        return Boolean(formState.address && formState.phone);
      case 'property-details':
        return Boolean(formState.propertyCondition);
      case 'timeline':
        return Boolean(formState.timeframe);
      case 'contact':
        return Boolean(formState.firstName && formState.lastName && formState.email);
      case 'thank-you':
        return true;
      default:
        return false;
    }
  };

  // Modified form submission to include leadId
  const submitForm = async (recaptchaToken?: string): Promise<SubmissionResponse> => {
    if (!validateForm()) {
      return { success: false, error: 'Please correct the errors before submitting' };
    }

    updateFormData({ isSubmitting: true, error: '' });

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          lastUpdated: new Date().toISOString(),
          recaptchaToken
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      if (result.success) {
        clearFormData();
        // Track successful submission
        if (typeof window !== 'undefined') {
          (window as any).gtag?.('event', 'form_submission_success', {
            event_category: 'Lead',
            event_label: 'Complete'
          });
          (window as any).fbq?.('track', 'Lead');
          (window as any).hj?.('trigger', 'form_submission_success');
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      updateFormData({ error: errorMessage, isSubmitting: false });
      return { success: false, error: errorMessage };
    }
  };

  return (
    <FormContext.Provider value={{
      formState,
      updateFormData,
      currentStep,
      setCurrentStep,
      isStepCompleted: isStepComplete,
      clearFormData,
      submitForm,
      errors,
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
} 