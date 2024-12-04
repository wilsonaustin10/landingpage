'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LeadFormData, FormStep } from '../types';

interface FormContextType {
  formData: LeadFormData;
  updateFormData: (data: Partial<LeadFormData>) => void;
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  isStepCompleted: (step: FormStep) => boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<LeadFormData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leadFormData');
      return saved ? JSON.parse(saved) : {
        address: '',
        phone: '',
        firstName: '',
        lastName: '',
        email: '',
        estimatedValue: '',
        Price: '',
      };
    }
    return {
      address: '',
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      estimatedValue: '',
      Price: '',
    };
  });

  const [currentStep, setCurrentStep] = useState<FormStep>('initial');

  useEffect(() => {
    localStorage.setItem('leadFormData', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (newData: Partial<LeadFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const isStepCompleted = (step: FormStep): boolean => {
    switch (step) {
      case 'initial':
        return Boolean(formData.address && formData.phone);
      case 'property-details':
        return true;
      case 'property-listed':
        return true;
      case 'timeline':
        return true;
      case 'property-value':
        return Boolean(formData.estimatedValue && formData.Price);
      case 'contact':
        return Boolean(formData.firstName && formData.lastName && formData.email);
      case 'thank-you':
        return true;
      default:
        return false;
    }
  };

  return (
    <FormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      isStepCompleted,
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