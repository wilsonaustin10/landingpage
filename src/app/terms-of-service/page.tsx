import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | XVR Buys Houses',
  description: 'Our terms of service outline the rules, guidelines, and legal agreements between you and XVR Buys Houses.',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">1. Acceptance of Terms</h2>
          <p className="mb-2">
            Welcome to XVR Buys Houses. These Terms of Service ("Terms") govern your access to and use of our website, services, and content. By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p>
            If you do not agree to these Terms, you should not access or use our website or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">2. Description of Services</h2>
          <p className="mb-2">
            XVR Buys Houses provides a platform for homeowners to request cash offers for their properties. Our services include but are not limited to:
          </p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>Providing online forms for property owners to submit information about their properties</li>
            <li>Evaluating properties and making cash offers</li>
            <li>Facilitating property transactions</li>
            <li>Providing information and resources related to selling properties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">3. User Accounts and Eligibility</h2>
          <p className="mb-2">
            To use certain features of our website or services, you may be required to provide certain personal information. You agree that all information you provide is accurate, complete, and current at all times.
          </p>
          <p className="mb-2">
            You must be at least 18 years old and capable of forming a binding contract to use our services. By using our services, you represent and warrant that you meet these requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">4. User Submissions</h2>
          <p className="mb-2">
            When you submit information through our website, including property details and contact information, you grant us the right to use, reproduce, modify, adapt, publish, translate, and distribute such content in connection with our services.
          </p>
          <p className="mb-2">
            You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>You own or control all rights to the content you submit</li>
            <li>The content is accurate and not misleading</li>
            <li>The content does not violate these Terms, applicable law, or the rights of any third party</li>
            <li>The content does not contain any viruses, worms, malware, or other harmful code</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">5. Intellectual Property Rights</h2>
          <p className="mb-2">
            All content, features, and functionality on our website, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are owned by XVR Buys Houses, our licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          <p className="mb-2">
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">6. Prohibited Uses</h2>
          <p className="mb-2">
            You agree not to use our website or services for any purpose that is unlawful or prohibited by these Terms. Prohibited uses include, but are not limited to:
          </p>
          <ul className="list-disc pl-6 mb-3 space-y-1">
            <li>Using the website in any way that could disable, overburden, damage, or impair the site</li>
            <li>Using any robot, spider, or other automatic device to access the website for any purpose</li>
            <li>Introducing any viruses, Trojan horses, worms, or other material that is malicious or technologically harmful</li>
            <li>Attempting to gain unauthorized access to, interfere with, damage, or disrupt any parts of the website</li>
            <li>Using the website to impersonate or attempt to impersonate our company, an employee, another user, or any other person or entity</li>
            <li>Engaging in any other conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">7. Third-Party Websites and Content</h2>
          <p className="mb-2">
            Our website may contain links to third-party websites and services. We do not control and are not responsible for the content, privacy policies, or practices of any third-party websites or services. We do not guarantee the quality, accuracy, or availability of such third-party content.
          </p>
          <p className="mb-2">
            By using our website, you acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">8. Disclaimer of Warranties</h2>
          <p className="mb-2">
            YOUR USE OF OUR WEBSITE AND SERVICES IS AT YOUR SOLE RISK. THE WEBSITE AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
          <p className="mb-2">
            XVR BUYS HOUSES EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mb-2">
            WE DO NOT WARRANT THAT THE WEBSITE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS IN THE WEBSITE WILL BE CORRECTED. THE CONTENT AND INFORMATION AVAILABLE ON THE WEBSITE MAY INCLUDE TECHNICAL INACCURACIES OR TYPOGRAPHICAL ERRORS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">9. Limitation of Liability</h2>
          <p className="mb-2">
            IN NO EVENT SHALL XVR BUYS HOUSES, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE WEBSITE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE WEBSITE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">10. Indemnification</h2>
          <p className="mb-3">
            You agree to defend, indemnify, and hold harmless XVR Buys Houses, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">11. Governing Law and Jurisdiction</h2>
          <p className="mb-3">
            These Terms and your use of the website are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Any legal suit, action, or proceeding arising out of, or related to, these Terms or the website shall be instituted exclusively in the federal courts of the United States or the courts of the State of California, although we retain the right to bring any suit, action, or proceeding against you for breach of these Terms in your country of residence or any other relevant country.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">12. Arbitration</h2>
          <p className="mb-3">
            At our sole discretion, we may require you to submit any disputes arising from these Terms or your use of the website, including disputes arising from or concerning their interpretation, violation, invalidity, non-performance, or termination, to final and binding arbitration under the Rules of Arbitration of the American Arbitration Association.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">13. Waiver and Severability</h2>
          <p className="mb-3">
            No waiver by XVR Buys Houses of any term or condition set out in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.
          </p>
          <p className="mb-3">
            If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms will continue in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">14. Changes to Terms of Service</h2>
          <p className="mb-3">
            We may update these Terms from time to time. The updated version will be effective as soon as it is accessible. We encourage you to review these Terms frequently to stay informed of any changes. Your continued use of the website after any changes to these Terms constitutes your acceptance of such changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">15. Contact Us</h2>
          <p className="mb-3">
            If you have any questions or concerns about these Terms, please contact us at:
          </p>
          <p className="mb-1">XVR Buys Houses</p>
          <p className="mb-1">Email: caesar@xvrbuyshouses.com</p>
          <p className="mb-1">Phone: (415) 843-7975</p>
        </section>
      </div>
    </div>
  );
} 