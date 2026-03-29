/**
 * SchedulrX — SMTP Email Transport
 * Uses nodemailer with connection pooling for production efficiency.
 * Supports Gmail, Outlook, SendGrid, Mailgun, and any SMTP server.
 */

import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Get (or create) a cached nodemailer transporter.
 * Called lazily so the module loads fine even if SMTP env vars aren't set yet.
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to your .env.local file.'
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,           // true for 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: { user, pass },
    pool: true,                     // Connection pooling — reuse connections
    maxConnections: 5,
    maxMessages: 100,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return transporter;
}

/**
 * Send an email. Returns { success, messageId } or { success: false, error }.
 * Never throws — email failures should not crash the request.
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const transport = getTransporter();
    const from      = process.env.SMTP_FROM || `SchedulrX <${process.env.SMTP_USER}>`;

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),   // Auto-generate plain text fallback
    });

    console.log(`[Email] ✓ Sent to ${to} — ${subject} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] ✗ Failed to send to ${to} — ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Verify SMTP connection (used in the settings page test).
 */
export async function verifySmtpConnection() {
  try {
    const transport = getTransporter();
    await transport.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Check if SMTP is configured in environment variables.
 */
export function isSmtpConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}
