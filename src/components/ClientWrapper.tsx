'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { FormProvider } from '../context/FormContext';

// Development mode fallback key (this is not a real key, just for development)
const DEV_FALLBACK_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  // Get the reCAPTCHA site key from env, use fallback in development
  const reCaptchaSiteKey = 
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 
    (process.env.NODE_ENV === 'development' ? DEV_FALLBACK_SITE_KEY : '');

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <FormProvider>
        {children}
      </FormProvider>
    </GoogleReCaptchaProvider>
  );
} 