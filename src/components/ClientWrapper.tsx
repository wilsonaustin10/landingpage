'use client';

import LazyReCaptchaProvider from './LazyReCaptchaProvider';
import { FormProvider } from '../context/FormContext';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <LazyReCaptchaProvider>
      <FormProvider>
        {children}
      </FormProvider>
    </LazyReCaptchaProvider>
  );
} 