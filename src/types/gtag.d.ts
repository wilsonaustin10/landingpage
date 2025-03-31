interface GtagEvent {
  command: 'event' | 'config' | 'js';
  action: string | Date;
  params?: {
    send_to?: string;
    transaction_id?: string;
    linker?: {
      domains: string[];
    };
  };
}

declare global {
  interface Window {
    gtag: (...args: [GtagEvent['command'], GtagEvent['action'], GtagEvent['params']?]) => void;
  }
}

export {}; 