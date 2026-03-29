import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — SchedulrX',
  description: 'Terms of Service for SchedulrX scheduling platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{ background: 'rgba(10,15,30,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(82,113,195,0.15)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm text-navy-900"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>X</div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white">SchedulrX</span>
        </Link>
        <Link href="/" className="text-navy-300 hover:text-white text-sm transition-colors">← Back to Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="font-display font-black text-white mb-2" style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)' }}>
          Terms of Service
        </h1>
        <p className="text-navy-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-navy-200 leading-relaxed">

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong className="text-white">SchedulrX</strong> ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">2. Description of Service</h2>
            <p>
              SchedulrX is a smart scheduling platform that allows users to set their availability, create event types, share booking links, and sync with external calendar services such as Google Calendar. The Service is provided as-is for personal and professional scheduling purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information when registering.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>One person may not maintain more than one free account.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to use SchedulrX to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violate any applicable laws or regulations.</li>
              <li>Impersonate any person or entity.</li>
              <li>Send spam or unsolicited communications through the platform.</li>
              <li>Attempt to gain unauthorized access to any systems or data.</li>
              <li>Interfere with or disrupt the integrity of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">5. Google Calendar Integration</h2>
            <p>
              By connecting your Google Calendar, you authorize SchedulrX to access and manage your calendar events for scheduling purposes. This access is governed by{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-colors">
                Google's Privacy Policy
              </a>{' '}
              and Terms of Service in addition to ours. You may revoke this access at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of SchedulrX — including but not limited to the design, code, and branding — are the exclusive property of SchedulrX. You may not copy, modify, or distribute any part of the Service without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">7. Disclaimer of Warranties</h2>
            <p>
              SchedulrX is provided <strong className="text-white">"as is"</strong> without warranties of any kind. We do not guarantee the Service will be uninterrupted, error-free, or meet your specific requirements. Use of the Service is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, SchedulrX shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may also delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify users of significant changes. Continued use of SchedulrX after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">11. Contact Us</h2>
            <p>
              For any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@schedulrx.com" className="text-amber-400 hover:text-amber-300 transition-colors">
                support@schedulrx.com
              </a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="py-6 px-4 text-center text-navy-600 text-xs sm:text-sm"
        style={{ borderTop: '1px solid rgba(82,113,195,0.1)' }}>
        © {new Date().getFullYear()} SchedulrX —{' '}
        <Link href="/privacy" className="hover:text-navy-400 transition-colors">Privacy Policy</Link>
        {' · '}
        <Link href="/terms" className="hover:text-navy-400 transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}
