import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { sendEmail, verifySmtpConnection, isSmtpConfigured } from '@/lib/mailer';
import { smtpTestEmail } from '@/lib/emailTemplates';

// POST /api/email/test — Send a test email and verify SMTP
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!isSmtpConfigured()) {
    return NextResponse.json({
      error: 'SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to your .env.local file.',
    }, { status: 400 });
  }

  // First verify the connection
  const verify = await verifySmtpConnection();
  if (!verify.success) {
    return NextResponse.json({
      error: `SMTP connection failed: ${verify.error}`,
    }, { status: 500 });
  }

  // Send a test email to the logged-in user's email
  const toEmail = session.user.email;
  const tpl     = smtpTestEmail({ toEmail });
  const result  = await sendEmail({ to: toEmail, ...tpl });

  if (!result.success) {
    return NextResponse.json({ error: `Failed to send test email: ${result.error}` }, { status: 500 });
  }

  return NextResponse.json({
    success:   true,
    messageId: result.messageId,
    sentTo:    toEmail,
  });
}

// GET /api/email/test — Check SMTP config status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const configured = isSmtpConfigured();
  return NextResponse.json({
    configured,
    host:     process.env.SMTP_HOST ? '✓ Set' : '✗ Missing',
    port:     process.env.SMTP_PORT || '587 (default)',
    user:     process.env.SMTP_USER ? '✓ Set' : '✗ Missing',
    pass:     process.env.SMTP_PASS ? '✓ Set' : '✗ Missing',
    from:     process.env.SMTP_FROM || `SchedulrX <${process.env.SMTP_USER || 'not set'}>`,
  });
}
