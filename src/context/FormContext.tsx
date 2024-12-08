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
  submitForm: () => Promise<SubmissionResponse>;
  errors: FormErrors;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialState: FormState = {
  address: '',
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  propertyCondition: '',
  timeframe: '',
  price: '',
  isSubmitting: false,
  error: '',
};

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formState, setFormState] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leadFormData');
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    }
    return initialState;
  });

  const [currentStep, setCurrentStep] = useState<FormStep>('initial');
  const [errors, setErrors] = useState<FormErrors>({});

  // Persist form data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !formState.isSubmitting) {
      localStorage.setItem('leadFormData', JSON.stringify(formState));
    }
  }, [formState]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formState.address) newErrors.address = 'Address is required';
    if (!formState.phone) newErrors.phone = 'Phone number is required';
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (newData: Partial<FormState>) => {
    setFormState(prev => {
      const updated = { ...prev, ...newData };
      console.log('Updated form state:', updated);
      return updated;
    });
  };

  const clearFormData = () => {
    setFormState(initialState);
    setErrors({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('leadFormData');
    }
  };

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

  const submitForm = async (): Promise<SubmissionResponse> => {
    if (!validateForm()) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    updateFormData({ isSubmitting: true, error: '' });

    try {
      // Determine if this is a complete submission
      const isComplete = [
        'firstName', 'lastName', 'email',
        'propertyCondition', 'timeframe', 'price'
      ].every(field => formState[field as keyof FormState]);

      // Call appropriate endpoint based on completion
      const endpoint = isComplete ? '/api/submit-form' : '/api/submit-lead';
      console.log(`Submitting to ${endpoint}`, formState);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          lastUpdated: new Date().toISOString(),
        }),
      });

      const result: SubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      if (result.success) {
        clearFormData();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      updateFormData({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      updateFormData({ isSubmitting: false });
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