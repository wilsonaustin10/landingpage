import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | XVR Buys Houses',
  description: 'Our privacy policy explains how we collect, use, and protect your personal information when you use our services.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">1. Introduction</h2>
          <p className="mb-2">
            XVR Buys Houses ("we," "our," or "us") is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including when you submit information through forms on our site.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">2. Information We Collect</h2>
          <p className="mb-2">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and mailing address.</li>
            <li><strong>Property Information:</strong> Property address, condition, status, and other details you provide about your property.</li>
            <li><strong>Communication Records:</strong> Records of your communications and interactions with us.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, operating system, referring URLs, pages visited, and access times.</li>
            <li><strong>Usage Data:</strong> How you interact with our website, including buttons clicked and forms submitted.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">3. How We Collect Information</h2>
          <p className="mb-2">We collect information through:</p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li><strong>Direct Interactions:</strong> Information you provide when filling out forms, subscribing to updates, or contacting us.</li>
            <li><strong>Automated Technologies:</strong> Cookies, web beacons, and similar technologies that collect data about your browsing actions and patterns.</li>
            <li><strong>Third-Party Sources:</strong> Information from service providers, business partners, and publicly available sources.</li>
            <li><strong>Google Places API:</strong> For address auto-completion and verification.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">4. How We Use Your Information</h2>
          <p className="mb-2">We may use your information to:</p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>Provide, maintain, and improve our services.</li>
            <li>Process and complete transactions.</li>
            <li>Respond to your inquiries and fulfill your requests.</li>
            <li>Send administrative information, such as updates, security alerts, and support messages.</li>
            <li>Personalize your experience on our website.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Analyze and understand how our services are used.</li>
            <li>Communicate with you about offers, promotions, and news about products and services we believe may be of interest to you.</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
            <li>Comply with our legal and regulatory obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">5. Disclosure of Your Information</h2>
          <p className="mb-2">We may share your information with:</p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li><strong>Service Providers:</strong> Companies that perform services on our behalf, such as website hosting, data analysis, payment processing, and customer service.</li>
            <li><strong>Business Partners:</strong> Third parties with whom we partner to offer products or services.</li>
            <li><strong>Legal Requirements:</strong> When required by applicable law, regulation, legal process, or governmental request.</li>
            <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
            <li><strong>With Your Consent:</strong> In other ways with your consent or at your direction.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">6. Cookies and Other Tracking Technologies</h2>
          <p className="mb-3">
            We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p>
            We use both session cookies (which expire once you close your web browser) and persistent cookies (which stay on your device until you delete them) to provide a more personalized and interactive experience on our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">7. Analytics and Third-Party Tools</h2>
          <p className="mb-3">
            We use third-party analytics tools, such as Google Analytics, Facebook Pixel, and Hotjar, to help us measure traffic and usage trends and understand the demographics of our users. These tools collect information sent by your browser or mobile device, including the pages you visit and other information that assists us in improving our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">8. Data Security</h2>
          <p className="mb-3">
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards, no security system is impenetrable. We cannot guarantee the security of our databases, nor can we guarantee that information you supply will not be intercepted while being transmitted to us over the Internet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">9. Your Data Protection Rights</h2>
          <p className="mb-2">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li><strong>Access:</strong> The right to request copies of your personal information.</li>
            <li><strong>Rectification:</strong> The right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li><strong>Erasure:</strong> The right to request that we erase your personal information under certain conditions.</li>
            <li><strong>Restriction:</strong> The right to request that we restrict the processing of your personal information under certain conditions.</li>
            <li><strong>Object:</strong> The right to object to our processing of your personal information under certain conditions.</li>
            <li><strong>Data Portability:</strong> The right to request that we transfer the data we have collected to another organization or directly to you under certain conditions.</li>
          </ul>
          <p>
            If you would like to exercise any of these rights, please contact us using the contact information provided below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">10. Children's Privacy</h2>
          <p className="mb-3">
            Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">11. Changes to This Privacy Policy</h2>
          <p className="mb-3">
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date at the top of this Privacy Policy. We encourage you to review this Privacy Policy frequently to stay informed about how we are protecting your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">12. Contact Us</h2>
          <p className="mb-3">
            If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p className="mb-1">XVR Buys Houses</p>
          <p className="mb-1">Email: caesar@xvrbuyshouses.com</p>
          <p className="mb-1">Phone: (415) 843-7975</p>
        </section>
      </div>
    </div>
  );
} 