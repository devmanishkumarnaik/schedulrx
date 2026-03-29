'use client';

import { useState, useEffect } from 'react';
import {
  Mail, Send, CheckCircle, XCircle, AlertCircle,
  ExternalLink, Copy, Check, ChevronDown, ChevronUp,
} from 'lucide-react';

const SMTP_PROVIDERS = [
  {
    name: 'Gmail',
    icon: '📧',
    host: 'smtp.gmail.com',
    port: '587',
    note: 'Use an <strong>App Password</strong> (not your Gmail password). Enable 2FA first, then go to Google Account → Security → App Passwords.',
    link: 'https://myaccount.google.com/apppasswords',
    linkLabel: 'Create App Password',
    envVars: 'SMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=you@gmail.com\nSMTP_PASS=your_16_char_app_password\nSMTP_FROM=SchedulrX <you@gmail.com>',
  },
  {
    name: 'Outlook / Hotmail',
    icon: '📨',
    host: 'smtp-mail.outlook.com',
    port: '587',
    note: 'Use your Outlook email and password. If you have 2FA, generate an app password.',
    link: 'https://account.microsoft.com/security',
    linkLabel: 'Microsoft Security Settings',
    envVars: 'SMTP_HOST=smtp-mail.outlook.com\nSMTP_PORT=587\nSMTP_USER=you@outlook.com\nSMTP_PASS=your_password\nSMTP_FROM=SchedulrX <you@outlook.com>',
  },
  {
    name: 'SendGrid',
    icon: '⚡',
    host: 'smtp.sendgrid.net',
    port: '587',
    note: 'Use <code class="bg-navy-700/50 px-1 rounded font-mono text-xs">apikey</code> as the username, and your SendGrid API Key as the password.',
    link: 'https://app.sendgrid.com/settings/api_keys',
    linkLabel: 'Get API Key',
    envVars: 'SMTP_HOST=smtp.sendgrid.net\nSMTP_PORT=587\nSMTP_USER=apikey\nSMTP_PASS=SG.your_api_key_here\nSMTP_FROM=SchedulrX <no-reply@yourdomain.com>',
  },
  {
    name: 'Mailgun',
    icon: '🔫',
    host: 'smtp.mailgun.org',
    port: '587',
    note: 'Use your Mailgun SMTP credentials from the domain settings.',
    link: 'https://app.mailgun.com/mg/dashboard',
    linkLabel: 'Mailgun Dashboard',
    envVars: 'SMTP_HOST=smtp.mailgun.org\nSMTP_PORT=587\nSMTP_USER=postmaster@mg.yourdomain.com\nSMTP_PASS=your_mailgun_password\nSMTP_FROM=SchedulrX <no-reply@yourdomain.com>',
  },
  {
    name: 'Amazon SES',
    icon: '☁️',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: '587',
    note: 'Use SMTP credentials from AWS Console → SES → SMTP settings. Verify your domain first.',
    link: 'https://console.aws.amazon.com/ses/home',
    linkLabel: 'AWS SES Console',
    envVars: 'SMTP_HOST=email-smtp.us-east-1.amazonaws.com\nSMTP_PORT=587\nSMTP_USER=YOUR_SES_SMTP_USERNAME\nSMTP_PASS=YOUR_SES_SMTP_PASSWORD\nSMTP_FROM=SchedulrX <no-reply@yourdomain.com>',
  },
];

const EMAIL_EVENTS = [
  { icon: '🎉', event: 'User Registration',       desc: 'Welcome email sent to new user after signup' },
  { icon: '✅', event: 'Booking Confirmed',         desc: 'Confirmation email to guest + notification to host' },
  { icon: '⏳', event: 'Booking Pending',           desc: 'Sent to guest when host requires manual confirmation' },
  { icon: '🎊', event: 'Booking Approved',          desc: 'Sent to guest when host confirms a pending booking' },
  { icon: '❌', event: 'Booking Cancelled',         desc: 'Cancellation notice to both guest and host' },
  { icon: '⏰', event: 'Booking Reminder',          desc: '24-hour reminder sent to guest before the meeting' },
];

export default function EmailSettingsPage() {
  const [smtpStatus,   setSmtpStatus]   = useState(null);
  const [testing,      setTesting]      = useState(false);
  const [testResult,   setTestResult]   = useState(null);
  const [openProvider, setOpenProvider] = useState(null);
  const [copied,       setCopied]       = useState('');

  useEffect(() => {
    fetch('/api/email/test')
      .then(r => r.json())
      .then(d => setSmtpStatus(d));
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res  = await fetch('/api/email/test', { method: 'POST' });
    const data = await res.json();
    setTestResult({ success: res.ok, ...data });
    setTesting(false);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="space-y-8 pt-12 lg:pt-0 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Email Settings</h1>
        <p className="text-navy-300 mt-1">
          Configure SMTP to send real transactional emails to users and guests.
        </p>
      </div>

      {/* SMTP Status Card */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <h2 className="font-display font-semibold text-white text-lg flex items-center gap-2">
              <Mail size={18} className="text-amber-400" /> SMTP Status
            </h2>
            <p className="text-navy-400 text-sm mt-0.5">Current email configuration</p>
          </div>
          {smtpStatus && (
            smtpStatus.configured
              ? <span className="badge badge-confirmed flex items-center gap-1.5">
                  <CheckCircle size={12} /> Configured
                </span>
              : <span className="badge badge-cancelled flex items-center gap-1.5">
                  <XCircle size={12} /> Not configured
                </span>
          )}
        </div>

        {smtpStatus && (
          <div className="space-y-3 mb-5">
            {[
              ['SMTP_HOST', smtpStatus.host],
              ['SMTP_PORT', smtpStatus.port],
              ['SMTP_USER', smtpStatus.user],
              ['SMTP_PASS', smtpStatus.pass],
              ['SMTP_FROM', smtpStatus.from],
            ].map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-3 py-2 border-b border-navy-700/20">
                <span className="font-mono text-xs text-navy-400">{key}</span>
                <span className={`text-xs font-medium ${val?.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTest}
            disabled={testing || !smtpStatus?.configured}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={15} />
            {testing ? 'Sending test email…' : 'Send Test Email'}
          </button>
          {!smtpStatus?.configured && (
            <p className="text-navy-500 text-xs self-center">
              Configure SMTP variables first, then restart the server.
            </p>
          )}
        </div>

        {testResult && (
          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
            testResult.success
              ? 'bg-green-500/10 border border-green-500/25'
              : 'bg-red-500/10 border border-red-500/25'
          }`}>
            {testResult.success
              ? <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
              : <XCircle    size={18} className="text-red-400 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-semibold ${testResult.success ? 'text-green-300' : 'text-red-300'}`}>
                {testResult.success ? '✅ Test email sent successfully!' : '❌ Test failed'}
              </p>
              <p className="text-navy-400 text-xs mt-1">
                {testResult.success
                  ? `Delivered to ${testResult.sentTo}. Check your inbox!`
                  : testResult.error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* What emails get sent */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-white mb-4">Emails sent automatically</h2>
        <div className="space-y-3">
          {EMAIL_EVENTS.map((e, i) => (
            <div key={i} className="flex items-start gap-4 py-3 border-b border-navy-700/20 last:border-0">
              <span className="text-xl mt-0.5">{e.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold">{e.event}</p>
                <p className="text-navy-400 text-xs mt-0.5">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SMTP Provider Setup Guides */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-white mb-2">Setup Guide — Choose Your Provider</h2>
        <p className="text-navy-400 text-sm mb-5">
          Add these variables to your <code className="bg-navy-700/50 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code> file, then restart the dev server.
        </p>

        <div className="space-y-2">
          {SMTP_PROVIDERS.map((p, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(82,113,195,0.2)' }}>
              <button
                onClick={() => setOpenProvider(openProvider === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-navy-700/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-display font-semibold text-white">{p.name}</span>
                  <code className="text-navy-500 font-mono text-xs hidden sm:block">{p.host}:{p.port}</code>
                </div>
                {openProvider === i ? <ChevronUp size={16} className="text-navy-400 shrink-0" /> : <ChevronDown size={16} className="text-navy-400 shrink-0" />}
              </button>

              {openProvider === i && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(82,113,195,0.1)' }}>
                  <p className="text-navy-300 text-sm leading-relaxed pt-4"
                    dangerouslySetInnerHTML={{ __html: p.note }} />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-navy-500 uppercase tracking-wide">
                        Add to .env.local
                      </span>
                      <button
                        onClick={() => handleCopy(p.envVars, `provider-${i}`)}
                        className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-white transition-colors"
                      >
                        {copied === `provider-${i}`
                          ? <><Check size={12} className="text-green-400" /> Copied!</>
                          : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-green-300 px-4 py-3 rounded-lg overflow-x-auto"
                      style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(82,113,195,0.2)' }}>
                      {p.envVars}
                    </pre>
                  </div>

                  <a href={p.link} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    {p.linkLabel} <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
