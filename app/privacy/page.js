import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — SchedulrX',
  description: 'Privacy Policy for SchedulrX scheduling platform.',
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-navy-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-navy-200 leading-relaxed">

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong className="text-white">SchedulrX</strong>. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Account Information:</strong> Name, email address, and password (hashed) when you register.</li>
              <li><strong className="text-white">Calendar Data:</strong> When you connect Google Calendar, we access your calendar events solely to check availability and prevent double bookings.</li>
              <li><strong className="text-white">Booking Information:</strong> Guest name, email, selected time slot, and timezone when a booking is made.</li>
              <li><strong className="text-white">Usage Data:</strong> Pages visited, timestamps, and browser/device type for improving the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the SchedulrX scheduling service.</li>
              <li>To sync with your connected Google Calendar to manage availability.</li>
              <li>To send booking confirmation and notification emails.</li>
              <li>To improve and maintain the platform.</li>
              <li>We do <strong className="text-white">not</strong> sell your data to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">4. Google Calendar Integration</h2>
            <p>
              SchedulrX uses the <strong className="text-white">Google Calendar API</strong> to read and write calendar events on your behalf. We request only the minimum required permissions (calendar read/write access). Your Google data is used exclusively for scheduling purposes and is never shared with third parties. You can revoke access at any time from your Google Account settings or from the SchedulrX dashboard.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">5. Data Storage & Security</h2>
            <p>
              Your data is stored securely in <strong className="text-white">MongoDB Atlas</strong> (cloud database). Passwords are hashed using bcrypt and never stored in plain text. OAuth tokens are encrypted and stored securely. We use HTTPS for all data in transit.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access and download your personal data.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Revoke Google Calendar access at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">8. Cookies</h2>
            <p>
              SchedulrX uses essential session cookies for authentication (via NextAuth.js). We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of SchedulrX after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-white text-lg mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@schedulrx.com" className="text-amber-400 hover:text-amber-300 transition-colors">
                privacy@schedulrx.com
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
