const Page = () => {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mb-6 text-gray-700">
          Your privacy is important to us. This policy explains how we collect, use, and safeguard
          personal information in connection with our services.
        </p>

        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">1. Information We Collect</h2>
            <p className="leading-relaxed text-gray-600">
              We may collect personal information such as names, contact details, medical and
              insurance information, and case-related data from claimants, organizations, and
              medical examiners.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">2. Use of Information</h2>
            <p className="leading-relaxed text-gray-600">
              Information is used to verify claimants, assign cases, enable communication, and
              ensure compliance with insurance and healthcare regulations.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">3. Data Protection</h2>
            <p className="leading-relaxed text-gray-600">
              We implement strong administrative, technical, and organizational measures including
              encryption, secure access controls, and role-based permissions to protect your data.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">4. Sharing of Information</h2>
            <p className="leading-relaxed text-gray-600">
              Information is shared only with authorized organizations, insurers, and medical
              examiners for legitimate purposes related to case management. We do not sell personal
              data to third parties.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">5. Your Rights</h2>
            <p className="leading-relaxed text-gray-600">
              You may request access to, correction of, or deletion of your personal information as
              permitted by law. Please contact us to exercise these rights.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">6. Updates</h2>
            <p className="leading-relaxed text-gray-600">
              This Privacy Policy may be updated from time to time. Updates will be posted on this
              page with the new effective date.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </section>
  );
};

export default Page;
