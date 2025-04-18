import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Detailed information about how we handle and protect your personal data in compliance with GDPR and UK privacy laws.',
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose prose-lg">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            This Privacy Policy explains how we collect, use, store, and protect your personal data
            in compliance with the General Data Protection Regulation (GDPR) and the UK Data
            Protection Act 2018. Your privacy is important to us, and we are committed to
            maintaining your trust and confidence.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p>We may collect and process the following categories of personal data:</p>
          <ul className="list-disc pl-6">
            <li>
              Information you voluntarily provide when subscribing to newsletters, commenting on
              blog posts, or contacting us, such as your name, email address, and comments.
            </li>
            <li>
              Technical data collected automatically when visiting our website, including IP
              address, browser type, and usage data.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p>We use your personal information to:</p>
          <ul className="list-disc pl-6">
            <li>Deliver and improve our website and services.</li>
            <li>Send newsletters, updates, and other communications you have requested.</li>
            <li>Respond to your inquiries, comments, or feedback.</li>
            <li>Analyse website usage to enhance user experience.</li>
            <li>Ensure website security and fraud prevention.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Legal Basis for Processing</h2>
          <p>
            We process your personal data based on your consent, the necessity to perform our
            services, compliance with legal obligations, or our legitimate interests to improve our
            services and protect our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Protection and Security</h2>
          <p>
            We have implemented suitable physical, electronic, and administrative measures to
            protect your data against unauthorized access, disclosure, or loss. Your data is
            securely stored and accessed only by authorised personnel.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p>Under UK and EU data protection laws, you have the right to:</p>
          <ul className="list-disc pl-6">
            <li>Access your personal data.</li>
            <li>Rectify inaccuracies in your personal data.</li>
            <li>Request the deletion of your data.</li>
            <li>Restrict or object to processing your data.</li>
            <li>Withdraw consent at any time, where consent was the basis for processing.</li>
            <li>Request data portability.</li>
          </ul>
          <p>
            To exercise these rights, please contact us at{' '}
            <a href="mailto:admin@foxleigh.me" className="text-blue-600 hover:underline">
              admin@foxleigh.me
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Retention of Your Information</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfil the purposes
            outlined in this policy, or as required by applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p>
            If you have any questions or concerns about our privacy practices, please contact us at{' '}
            <a href="mailto:admin@foxleigh.me" className="text-blue-600 hover:underline">
              admin@foxleigh.me
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Any changes will be clearly posted on
            this page, and we encourage you to review it regularly.
          </p>
        </section>
      </article>
    </main>
  );
}
