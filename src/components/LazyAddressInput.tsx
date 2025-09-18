'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AddressInput = dynamic(
  () => import('./AddressInput'),
  {
    loading: () => (
      <div className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-500">Loading address input...</span>
      </div>
    ),
    ssr: false // Disable SSR for this component since it uses browser APIs
  }
);

export default AddressInput;