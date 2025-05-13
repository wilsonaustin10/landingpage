# Setting Up reCAPTCHA v3 for Lead Validation

This document outlines the steps to set up Google reCAPTCHA v3 in this Next.js application to validate legitimate leads vs bots or fake submissions.

## 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Google reCAPTCHA v3 keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

Replace `your_site_key_here` with the actual site key and `your_secret_key_here` with the actual secret key provided by Google.

## 2. Implementation Details

### What's Already Been Implemented

1. **Frontend Integration**:
   - Added the `react-google-recaptcha-v3` package
   - Wrapped the application with `GoogleReCaptchaProvider` in `src/app/layout.tsx`
   - Modified `PropertyForm.tsx` to generate a reCAPTCHA token on form submission
   - Token is sent along with form data to the backend

2. **Backend Integration**:
   - Added token verification logic in `/api/submit-partial/route.ts`
   - Implemented score threshold checking (default: 0.5)
   - Added error handling for invalid tokens

### Verification Logic

- The system uses a score threshold of 0.5 (configurable)
- Scores below this threshold are rejected as potential bots
- Verification results are logged for monitoring

## 3. Testing

To verify that reCAPTCHA is working properly:

1. Fill out the lead form with valid information
2. Submit the form
3. Check server logs for the reCAPTCHA verification result
4. Ensure leads with scores below the threshold are rejected

## 4. Advanced Configuration

You can adjust the score threshold in `src/app/api/submit-partial/route.ts` by modifying this line:

```javascript
if (data.score < 0.5) {
  // Change 0.5 to your desired threshold
}
```

Higher thresholds (closer to 1.0) are more strict but may reject some legitimate users.
Lower thresholds (closer to 0.0) are more lenient but may allow more bots.

## 5. Troubleshooting

If you encounter issues:

- Ensure both keys are correctly entered in your `.env.local` file
- Verify that the keys match the domain where the application is hosted
- Check browser console for client-side errors
- Check server logs for verification failures 