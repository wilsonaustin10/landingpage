export const verifyGoogleApiKey = () => {
  try {
    // Log all environment variables (be careful with sensitive data)
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasGoogleKey: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
      keyPrefix: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.substring(0, 4)
    });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.error('Google Places API key is missing. Please check your .env file');
      return false;
    }

    if (apiKey === 'your_api_key_here' || apiKey === '') {
      console.error('Please replace the placeholder API key with your actual key in .env');
      return false;
    }

    if (!apiKey.startsWith('AIza')) {
      console.error('Invalid Google Places API key format. Key should start with "AIza"');
      return false;
    }

    console.log('Google Places API key verification successful');
    return true;
  } catch (error) {
    console.error('Error during API key verification:', error);
    return false;
  }
};

// Optional: Add a function to verify if the API is loaded
export const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && 
         window.google && 
         window.google.maps && 
         window.google.maps.places;
};