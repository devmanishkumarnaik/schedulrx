/**
 * SchedulrX — Email Templates
 * Beautiful, responsive HTML emails for every transactional event.
 * Uses inline CSS (required for email clients like Gmail, Outlook).
 */

import { formatInTimeZone } from 'date-fns-tz';
import { buildGoogleCalendarLink } from '@/lib/googleCalendar';

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'SchedulrX';

// ─── Base layout wrapper ──────────────────────────────────────────────────────
function baseLayout(content, previewText = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${APP_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:none;">
  <!-- Preview text (hidden, shown in inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0f1e;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:10px;padding:8px 12px;font-size:18px;font-weight:900;color:#0a0f1e;letter-spacing:-0.5px;">
                    X
                  </td>
                  <td style="padding-left:10px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                    ${APP_NAME}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(20,31,79,0.9);border:1px solid rgba(82,113,195,0.25);border-radius:20px;overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:rgba(126,149,210,0.5);line-height:1.6;">
                © ${new Date().getFullYear()} ${APP_NAME} &nbsp;·&nbsp;
                <a href="${APP_URL}" style="color:rgba(126,149,210,0.5);text-decoration:none;">schedulrx.app</a>
                &nbsp;·&nbsp; You received this because of activity on your account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function header(icon, title, subtitle, accentColor = '#3a5ab4') {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,${accentColor}22,${accentColor}11);padding:36px 40px 28px;border-bottom:1px solid rgba(82,113,195,0.15);">
      <div style="font-size:40px;margin-bottom:12px;">${icon}</div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">${title}</h1>
      <p style="margin:0;font-size:15px;color:rgba(170,184,225,0.75);">${subtitle}</p>
    </td>
  </tr>`;
}

function body(rows) {
  return `
  <tr>
    <td style="padding:28px 40px;">
      ${rows.join('')}
    </td>
  </tr>`;
}

function detailBlock(items) {
  const rows = items.map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(82,113,195,0.1);">
        <span style="font-size:11px;font-weight:600;color:rgba(126,149,210,0.7);text-transform:uppercase;letter-spacing:0.06em;">${label}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:2px 0 10px;border-bottom:1px solid rgba(82,113,195,0.1);">
        <span style="font-size:14px;color:#ffffff;font-weight:500;">${value}</span>
      </td>
    </tr>`).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:rgba(10,15,30,0.5);border:1px solid rgba(82,113,195,0.15);border-radius:12px;padding:6px 20px;margin:16px 0;">
    <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr>
  </table>`;
}

function btn(text, url, bg = 'linear-gradient(135deg,#f59e0b,#fbbf24)', color = '#0a0f1e') {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr>
      <td style="background:${bg};border-radius:10px;padding:13px 28px;">
        <a href="${url}" style="color:${color};text-decoration:none;font-size:14px;font-weight:700;display:block;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function calendarButtons(startTime, endTime, title, description, location) {
  const gLink = buildGoogleCalendarLink({ title, description, location, startTime, endTime });
  return `
  <p style="margin:20px 0 8px;font-size:12px;font-weight:600;color:rgba(126,149,210,0.6);text-transform:uppercase;letter-spacing:0.06em;">Add to your calendar</p>
  <table cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td>
        <a href="${gLink}" style="display:inline-block;padding:9px 20px;border-radius:8px;border:1px solid rgba(82,113,195,0.3);font-size:12px;font-weight:600;color:#aab8e1;text-decoration:none;background:rgba(30,49,120,0.4);">
          📅 Add to Google Calendar
        </a>
      </td>
    </tr>
  </table>`;
}

function paragraph(text, style = '') {
  return `<p style="margin:14px 0;font-size:14px;color:rgba(170,184,225,0.8);line-height:1.65;${style}">${text}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid rgba(82,113,195,0.12);margin:20px 0;" />`;
}

function badge(text, color) {
  const map = {
    green:  ['rgba(16,185,129,0.15)',  '#34d399', 'rgba(16,185,129,0.3)'],
    amber:  ['rgba(245,158,11,0.15)',  '#fbbf24', 'rgba(245,158,11,0.3)'],
    red:    ['rgba(239,68,68,0.15)',   '#f87171', 'rgba(239,68,68,0.3)'],
    blue:   ['rgba(58,90,180,0.2)',    '#93c5fd', 'rgba(58,90,180,0.4)'],
  };
  const [bg, fg, border] = map[color] || map.blue;
  return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${bg};color:${fg};border:1px solid ${border};text-transform:uppercase;letter-spacing:0.05em;">${text}</span>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. Welcome email after registration ─────────────────────────────────────
export function welcomeEmail({ name, username }) {
  const bookingUrl = `${APP_URL}/${username}`;
  const dashUrl    = `${APP_URL}/dashboard`;

  const content = [
    header('🎉', `Welcome to ${APP_NAME}, ${name}!`, 'Your scheduling page is ready. Start booking in minutes.', '#f59e0b'),
    body([
      paragraph(`Hi <strong style="color:#fff;">${name}</strong>, your account is all set up. Here's what you can do right now:`),
      detailBlock([
        ['Your booking link', `<a href="${bookingUrl}" style="color:#fbbf24;text-decoration:none;font-family:monospace;">${bookingUrl}</a>`],
        ['Your username', `@${username}`],
      ]),
      paragraph('Share your booking link with anyone — they can pick a time that works for both of you, no back-and-forth required.'),
      btn('Go to Dashboard →', dashUrl),
      divider(),
      paragraph('<strong style="color:#fff;">Quick start checklist:</strong>'),
      paragraph('✅ Create an event type (15-min call, 30-min meeting, etc.)<br/>📅 Set your weekly availability<br/>🔗 Share your booking link<br/>📩 Connect Google Calendar for auto-sync', 'font-size:13px;'),
    ]),
  ].join('');

  return {
    subject: `Welcome to ${APP_NAME} — your booking page is live! 🚀`,
    html:    baseLayout(content, `Hi ${name}! Your SchedulrX page is ready at ${bookingUrl}`),
  };
}

// ─── 2. Booking confirmation — guest copy ─────────────────────────────────────
export function bookingConfirmedGuestEmail({ booking, event, host, guestTz }) {
  const tz        = guestTz || booking.timezone || 'UTC';
  const startFmt  = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const timeFmt   = `${formatInTimeZone(new Date(booking.startTime), tz, 'h:mm a')} – ${formatInTimeZone(new Date(booking.endTime), tz, 'h:mm a')}`;
  const managUrl  = `${APP_URL}/${host.username}`;

  const content = [
    header('✅', 'Your booking is confirmed!', `You're scheduled with ${host.name}`, '#10b981'),
    body([
      paragraph(`Hi <strong style="color:#fff;">${booking.guestName}</strong>, your meeting is booked. Here are your details:`),
      detailBlock([
        ['Meeting',   event.title],
        ['With',      host.name],
        ['Date',      startFmt],
        ['Time',      `${timeFmt} (${tz.replace(/_/g, ' ')})`],
        ['Location',  booking.location || event.location || 'To be confirmed'],
        ['Ref #',     booking.uid],
      ]),
      booking.guestNotes
        ? paragraph(`<em style="color:rgba(170,184,225,0.6);">Your notes: "${booking.guestNotes}"</em>`)
        : '',
      calendarButtons(booking.startTime, booking.endTime,
        `${event.title} with ${host.name}`,
        `SchedulrX Booking — Ref: ${booking.uid}`,
        booking.location || ''),
      divider(),
      paragraph(`Need to cancel or reschedule? Visit the host's booking page:&nbsp;<a href="${managUrl}" style="color:#fbbf24;text-decoration:none;">${managUrl}</a>`),
    ]),
  ].join('');

  return {
    subject: `✅ Confirmed: ${event.title} with ${host.name} on ${startFmt}`,
    html:    baseLayout(content, `Your ${event.title} with ${host.name} is confirmed for ${startFmt}`),
  };
}

// ─── 3. Booking notification — host copy ─────────────────────────────────────
export function bookingNotificationHostEmail({ booking, event, host }) {
  const tz       = host.timezone || 'UTC';
  const startFmt = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const timeFmt  = `${formatInTimeZone(new Date(booking.startTime), tz, 'h:mm a')} – ${formatInTimeZone(new Date(booking.endTime), tz, 'h:mm a')}`;
  const dashUrl  = `${APP_URL}/dashboard/bookings`;

  const content = [
    header('📩', 'New booking received!', `${booking.guestName} just booked time with you`, '#3a5ab4'),
    body([
      paragraph(`<strong style="color:#fff;">${booking.guestName}</strong> has booked a <strong style="color:#fff;">${event.title}</strong> with you.`),
      detailBlock([
        ['Guest name',  booking.guestName],
        ['Guest email', `<a href="mailto:${booking.guestEmail}" style="color:#fbbf24;text-decoration:none;">${booking.guestEmail}</a>`],
        ['Event',       event.title],
        ['Date',        startFmt],
        ['Time',        `${timeFmt} (your timezone)`],
        ['Location',    booking.location || event.location || '—'],
        ['Ref #',       booking.uid],
      ]),
      booking.guestNotes
        ? paragraph(`<strong style="color:#fff;">Guest notes:</strong> "${booking.guestNotes}"`)
        : '',
      btn('View in Dashboard →', dashUrl, 'linear-gradient(135deg,#3a5ab4,#5271c3)', '#fff'),
      calendarButtons(booking.startTime, booking.endTime,
        `${event.title} with ${booking.guestName}`,
        `Guest: ${booking.guestName} (${booking.guestEmail})\nRef: ${booking.uid}`,
        booking.location || ''),
    ]),
  ].join('');

  return {
    subject: `📅 New booking: ${event.title} with ${booking.guestName} on ${startFmt}`,
    html:    baseLayout(content, `${booking.guestName} booked ${event.title} on ${startFmt}`),
  };
}

// ─── 4. Booking pending (requires manual confirmation) ───────────────────────
export function bookingPendingGuestEmail({ booking, event, host, guestTz }) {
  const tz       = guestTz || booking.timezone || 'UTC';
  const startFmt = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const timeFmt  = `${formatInTimeZone(new Date(booking.startTime), tz, 'h:mm a')} – ${formatInTimeZone(new Date(booking.endTime), tz, 'h:mm a')}`;

  const content = [
    header('⏳', 'Booking request received', `Waiting for ${host.name} to confirm`, '#f59e0b'),
    body([
      paragraph(`Hi <strong style="color:#fff;">${booking.guestName}</strong>, your booking request has been received and is awaiting confirmation from ${host.name}.`),
      detailBlock([
        ['Status',    badge('Pending Confirmation', 'amber')],
        ['Meeting',   event.title],
        ['With',      host.name],
        ['Date',      startFmt],
        ['Time',      `${timeFmt} (${tz.replace(/_/g, ' ')})`],
        ['Ref #',     booking.uid],
      ]),
      paragraph(`You'll receive another email once ${host.name} confirms or declines your request. Please don't add this to your calendar yet.`),
      divider(),
      paragraph(`<em style="color:rgba(170,184,225,0.5);font-size:13px;">Keep this email for your records. Reference: ${booking.uid}</em>`),
    ]),
  ].join('');

  return {
    subject: `⏳ Booking request received — awaiting confirmation from ${host.name}`,
    html:    baseLayout(content, `Your booking with ${host.name} on ${startFmt} is pending confirmation`),
  };
}

// ─── 5. Booking confirmed by host (was pending) ───────────────────────────────
export function bookingApprovedGuestEmail({ booking, event, host, guestTz }) {
  const tz       = guestTz || booking.timezone || 'UTC';
  const startFmt = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const timeFmt  = `${formatInTimeZone(new Date(booking.startTime), tz, 'h:mm a')} – ${formatInTimeZone(new Date(booking.endTime), tz, 'h:mm a')}`;

  const content = [
    header('🎊', 'Your booking is confirmed!', `${host.name} approved your request`, '#10b981'),
    body([
      paragraph(`Great news, <strong style="color:#fff;">${booking.guestName}</strong>! ${host.name} has confirmed your booking.`),
      detailBlock([
        ['Status',    badge('Confirmed', 'green')],
        ['Meeting',   event.title],
        ['With',      host.name],
        ['Date',      startFmt],
        ['Time',      `${timeFmt} (${tz.replace(/_/g, ' ')})`],
        ['Location',  booking.location || event.location || '—'],
        ['Ref #',     booking.uid],
      ]),
      calendarButtons(booking.startTime, booking.endTime,
        `${event.title} with ${host.name}`,
        `SchedulrX Confirmed Booking — Ref: ${booking.uid}`,
        booking.location || ''),
    ]),
  ].join('');

  return {
    subject: `🎊 Confirmed by ${host.name}: ${event.title} on ${startFmt}`,
    html:    baseLayout(content, `Your booking with ${host.name} on ${startFmt} is now confirmed!`),
  };
}

// ─── 6. Booking cancelled — guest copy ───────────────────────────────────────
export function bookingCancelledGuestEmail({ booking, event, host, guestTz, reason }) {
  const tz       = guestTz || booking.timezone || 'UTC';
  const startFmt = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const bookUrl  = `${APP_URL}/${host.username}`;

  const content = [
    header('❌', 'Booking cancelled', `Your meeting with ${host.name} has been cancelled`, '#ef4444'),
    body([
      paragraph(`Hi <strong style="color:#fff;">${booking.guestName}</strong>, unfortunately your booking has been cancelled.`),
      detailBlock([
        ['Status',  badge('Cancelled', 'red')],
        ['Meeting', event.title],
        ['With',    host.name],
        ['Date',    startFmt],
        ['Ref #',   booking.uid],
      ]),
      reason
        ? paragraph(`<strong style="color:#fff;">Cancellation reason:</strong> ${reason}`)
        : '',
      paragraph(`If you'd like to reschedule, you can book a new time on ${host.name}'s booking page:`),
      btn(`Book again with ${host.name} →`, bookUrl),
    ]),
  ].join('');

  return {
    subject: `❌ Cancelled: ${event.title} with ${host.name} on ${startFmt}`,
    html:    baseLayout(content, `Your booking with ${host.name} on ${startFmt} has been cancelled`),
  };
}

// ─── 7. Booking cancelled — host copy ────────────────────────────────────────
export function bookingCancelledHostEmail({ booking, event, host }) {
  const tz       = host.timezone || 'UTC';
  const startFmt = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const dashUrl  = `${APP_URL}/dashboard/bookings`;

  const content = [
    header('🔔', 'Booking cancellation', `Your booking with ${booking.guestName} was cancelled`, '#ef4444'),
    body([
      paragraph(`This is to confirm that your <strong style="color:#fff;">${event.title}</strong> with <strong style="color:#fff;">${booking.guestName}</strong> on <strong style="color:#fff;">${startFmt}</strong> has been cancelled. That time slot is now available again.`),
      detailBlock([
        ['Guest',     booking.guestName],
        ['Email',     booking.guestEmail],
        ['Event',     event.title],
        ['Date',      startFmt],
        ['Ref #',     booking.uid],
      ]),
      btn('View Bookings →', dashUrl, 'linear-gradient(135deg,#3a5ab4,#5271c3)', '#fff'),
    ]),
  ].join('');

  return {
    subject: `🔔 Booking cancelled: ${event.title} with ${booking.guestName} on ${startFmt}`,
    html:    baseLayout(content, `${booking.guestName} cancelled their ${event.title} on ${startFmt}`),
  };
}

// ─── 8. 24-hour reminder — guest ─────────────────────────────────────────────
export function reminderGuestEmail({ booking, event, host, guestTz }) {
  const tz       = guestTz || booking.timezone || 'UTC';
  const startFmt = formatInTimeZone(new Date(booking.startTime), tz, 'EEEE, MMMM d, yyyy');
  const timeFmt  = `${formatInTimeZone(new Date(booking.startTime), tz, 'h:mm a')} – ${formatInTimeZone(new Date(booking.endTime), tz, 'h:mm a')}`;

  const content = [
    header('⏰', 'Reminder: meeting tomorrow!', `Your ${event.title} with ${host.name}`, '#f59e0b'),
    body([
      paragraph(`Hi <strong style="color:#fff;">${booking.guestName}</strong>, this is a friendly reminder that you have a meeting tomorrow.`),
      detailBlock([
        ['Meeting',  event.title],
        ['With',     host.name],
        ['Date',     startFmt],
        ['Time',     `${timeFmt} (${tz.replace(/_/g, ' ')})`],
        ['Location', booking.location || event.location || '—'],
      ]),
      calendarButtons(booking.startTime, booking.endTime,
        `${event.title} with ${host.name}`,
        `SchedulrX Booking — Ref: ${booking.uid}`,
        booking.location || ''),
    ]),
  ].join('');

  return {
    subject: `⏰ Reminder: ${event.title} with ${host.name} tomorrow at ${formatInTimeZone(new Date(booking.startTime), tz, 'h:mm a')}`,
    html:    baseLayout(content, `Don't forget — ${event.title} with ${host.name} is tomorrow!`),
  };
}

// ─── 9. Password reset ────────────────────────────────────────────────────────
export function passwordResetEmail({ name, resetUrl }) {
  const content = [
    header('🔐', 'Reset your password', 'A password reset was requested for your account', '#3a5ab4'),
    body([
      paragraph(`Hi <strong style="color:#fff;">${name}</strong>, we received a request to reset the password for your ${APP_NAME} account.`),
      btn('Reset Password →', resetUrl),
      paragraph('This link expires in <strong style="color:#fff;">1 hour</strong>. If you didn\'t request a password reset, you can safely ignore this email — your password will not change.'),
      divider(),
      paragraph(`Or copy this link into your browser:<br/><span style="font-family:monospace;font-size:12px;color:#7e95d2;word-break:break-all;">${resetUrl}</span>`, 'font-size:13px;'),
    ]),
  ].join('');

  return {
    subject: `🔐 Reset your ${APP_NAME} password`,
    html:    baseLayout(content, `Reset your ${APP_NAME} password — link expires in 1 hour`),
  };
}

// ─── 10. SMTP test email ─────────────────────────────────────────────────────
export function smtpTestEmail({ toEmail }) {
  const content = [
    header('🧪', 'SMTP connection test', `Email delivery is working correctly`, '#10b981'),
    body([
      paragraph('✅ Your SMTP configuration is set up correctly. SchedulrX can now send transactional emails.'),
      detailBlock([
        ['Sent to',  toEmail],
        ['Time',     new Date().toISOString()],
        ['Status',   badge('Delivered', 'green')],
      ]),
      paragraph('All emails — registration, booking confirmations, reminders, and cancellations — will be delivered to your users.'),
    ]),
  ].join('');

  return {
    subject: `✅ ${APP_NAME} — SMTP test successful!`,
    html:    baseLayout(content, 'Your SMTP email delivery is working perfectly'),
  };
}
