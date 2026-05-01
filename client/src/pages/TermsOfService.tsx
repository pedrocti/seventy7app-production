import { motion } from 'framer-motion';
import { Link } from 'wouter';

const TermsOfService = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Link href="/" className="inline-flex items-center text-[#0AEFFF] mb-8 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="mb-6 text-gray-400">Last Updated: January 03, 2026</p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Introduction and Acceptance of Terms</h2>
            <p>
              These Terms and Conditions ("Agreement") constitute a legally binding contract between Seventy7 Trading Academy (Company Registration No. 16892948) ("the Company", "we", "us", or "our") and you ("the Client", "you", or "your").
            </p>
            <p>
              <strong>1.1 Eligibility and Age Restriction</strong><br />
              To use any of our services, including but not limited to investing facilitation, portfolio management, mentorship programmes, educational content, signals, or any other offerings, you must:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Be at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction if higher);</li>
              <li>Have full legal capacity to enter into binding contracts;</li>
              <li>Reside in a jurisdiction where access to our services is not prohibited by law;</li>
              <li>Provide accurate, complete, and current information during registration and onboarding, including proof of age and identity where requested.</li>
            </ul>
            <p className="mt-4">
              By accessing or using our services, you represent and warrant that you meet all the above eligibility criteria. If you are under 18 years of age or otherwise ineligible, you are strictly prohibited from using our services, and any attempt to do so constitutes a material breach of this Agreement. The Company reserves the right to suspend or terminate access immediately and without refund if we discover (or reasonably suspect) that you do not meet these requirements.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Nature of Services – Important Disclaimers</h2>
            <p>
              The Company provides educational training, structured mentorship, trading guidance, and (where separately agreed) discretionary portfolio management or investment facilitation services. <strong>We are a regulated financial services provider under the Financial Conduct Authority (FCA) and we provide regulated investment advice, financial advice and not tax advice or legal advice.</strong>
            </p>
            <p>
              All content, strategies, signals, mentorship/internship sessions, portfolio Management and materials are provided for educational and investment purposes only. Nothing contained in our services constitutes a recommendation, solicitation, or offer to buy or sell any financial instrument or security.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Risk Disclosure Statement</h2>
            <p className="font-semibold text-rose-300">
              Trading, investing, and participating in financial markets involve a <strong>high degree of risk</strong> and are not suitable for all persons. You may lose some or a substantial portion <strong>of your invested capital</strong>.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-300">
              <li>Past performance is not indicative of, and does not guarantee, future results.</li>
              <li>Markets are volatile and can move rapidly against ROI, Regardless minimum returns of any plan are gurranteed</li>
              <li>Leverage, derivatives, cryptocurrencies, and other instruments can magnify both gains and losses.</li>
              <li>All investment decisions are made solely by you at your own risk and discretion.</li>
              <li>The Company makes trading decisions and entery on your behalf and interest with  representation, warranty, guarantee regarding profits, returns, performance and avoidance of loss.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Investing Services</h2>
            <p>
              Where you participate in our investing facilitation services:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Minimum initial deposit: USD $500.</li>
              <li>Invested capital is locked for a fixed term of 365 days from the date of deposit.</li>
              <li>Accrued profits may be withdrawn or reinvested every 30 days.</li>
              <li>Early withdrawal of capital before the 365-day term incurs a penalty on the withdrawn amount and requires 30 days’ prior written notice by email.</li>
              <li>Any purported early withdrawal without compliance shall be invalid and may result in additional charges.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Portfolio Management Services</h2>
            <p>
              Portfolio management is available only to High Net Worth Individuals and is subject to a separate written agreement specifying capital size, risk parameters, profit-sharing (if any), and other terms. The Company manages such portfolios in good faith and transparent performance and return of capital.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">6. Mentorship Services</h2>
            <p>
              Mentorship is provided to experienced traders seeking structured guidance. You agree to comply fully with all mentor instructions, trading rules, risk frameworks, and programme requirements. Non-compliance may result in immediate termination or further liability on the part of the Company.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the Company, its directors, officers, employees, mentors, agents, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, trading losses, business interruption, or any other financial or non-financial loss arising from:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Your use of or reliance on any service, content, advice, or material provided;</li>
              <li>Errors, omissions, delays, or inaccuracies in information;</li>
              <li>Market movements, third-party actions, or force majeure events;</li>
              <li>Termination or suspension of your account or services.</li>
            </ul>
            <p className="mt-4">
              In any event, the Company’s total aggregate liability shall not exceed the total fees paid by you to the Company in the twelve (12) months immediately preceding the claim.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">8. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless the Company and its directors, officers, employees, mentors, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with your use of the services, breach of this Agreement, violation of any law, or any act or omission by you.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">9. Termination and Suspension</h2>
            <p>
              The Company reserves the right, at its sole discretion and with or without notice or liability, to suspend or terminate your access to any or all services, including but not limited to cases of breach of this Agreement, provision of false information, unethical conduct, non-compliance with rules, or any other conduct deemed detrimental. No refunds shall be provided in such circumstances.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">10. No Refunds Policy</h2>
            <p>
              All payments for services like programmes, mentorship/intern, or deposits are non-refundable except as explicitly stated in this Agreement (e.g. early withdrawal penalty provisions). You acknowledge that services commence immediately upon payment or enrolment.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">11. Data Protection</h2>
            <p>
              We process your personal data in accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and our Privacy Policy (available on our website). By using our services, you consent to such processing as described therein.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">12. Governing Law and Jurisdiction</h2>
            <p>
              This Agreement is governed by and construed in accordance with the laws of England and Wales. You irrevocably submit to the exclusive jurisdiction of the courts of England and Wales for any dispute arising out of or in connection with this Agreement.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">13. Miscellaneous</h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>This Agreement constitutes the entire understanding between you and the Company and supersedes all prior agreements.</li>
              <li>No waiver of any breach shall constitute a waiver of any subsequent breach.</li>
              <li>If any provision is held invalid, the remainder shall continue in full force.</li>
              <li>We may amend these terms at any time; continued use constitutes acceptance of changes.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">14. Contact</h2>
            <p>
              For any questions regarding these Terms and Conditions, contact us at support@seventy7hub.com.
            </p>

            <p className="mt-12 text-center text-gray-400 italic">
              By engaging with Seventy7 Trading Academy, you confirm that you have read, fully understood, and agree to be legally bound by this Agreement.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;