import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'The terms and conditions governing your use of our blog and its commenting features.',
};

export default function TermsAndConditions() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose prose-lg">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            These Terms and Conditions govern your use of our personal blog website. By accessing
            and interacting with this website, including posting comments, you accept these terms in
            full. If you disagree with these terms, please refrain from using our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, all content, articles, images, and materials displayed on
            this website are our intellectual property and protected under UK copyright laws. You
            may read and share content provided you credit us clearly and link back to our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Comments</h2>
          <p>When posting comments, you agree to:</p>
          <ul className="list-disc pl-6">
            <li>Respect other users and maintain civility at all times.</li>
            <li>
              Not post content that is defamatory, offensive, hateful, or otherwise inappropriate.
            </li>
            <li>
              Ensure that your comments do not infringe upon any third-party rights, including
              intellectual property or privacy rights.
            </li>
          </ul>
          <p>
            We reserve the right to moderate, edit, or remove any comments that breach these
            conditions or are otherwise unsuitable for our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
          <p>You must not use our website to:</p>
          <ul className="list-disc pl-6">
            <li>
              Engage in any activity that disrupts the website&apos;s functionality or availability.
            </li>
            <li>Post spam or unsolicited promotional material.</li>
            <li>Transmit harmful software, viruses, or malicious scripts.</li>
            <li>
              Collect or harvest personal data from other users without their explicit consent.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p>
            We strive to ensure accuracy and quality of content, but we do not guarantee
            completeness or accuracy. We shall not be liable for any indirect or consequential loss
            or damage arising from your use of this website or reliance on the information presented
            here.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Indemnity</h2>
          <p>
            You agree to indemnify us against any claims, liabilities, damages, costs, or expenses
            arising from your breach of these terms or your use of our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p>
            If you have any questions regarding these Terms and Conditions, please contact us at{' '}
            <a href="mailto:admin@foxleigh.me" className="text-blue-600 hover:underline">
              admin@foxleigh.me
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Any changes will be posted on this page,
            and we encourage you to review these terms periodically.
          </p>
        </section>
      </article>
    </main>
  );
}
