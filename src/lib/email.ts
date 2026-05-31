import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AFIRMIA <hello@afirmia.app>';

// ─── Welcome Email ────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Welcome to AFIRMIA — Your mind, reprogrammed.',
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f8f9fa; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 32px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px; }
  .content { padding: 40px 32px; }
  .content h2 { font-size: 22px; margin: 0 0 16px; color: #1a1a1a; }
  .content p { font-size: 16px; color: #4a4a4a; margin: 0 0 16px; }
  .cta { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 24px 0; }
  .features { background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0; }
  .features ul { margin: 0; padding-left: 20px; }
  .features li { margin: 8px 0; color: #4a4a4a; }
  .footer { padding: 24px 32px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 1px solid #f1f3f5; }
  .footer a { color: #6366f1; text-decoration: none; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AFIRMIA</h1>
      <p>Your mind, reprogrammed.</p>
    </div>
    <div class="content">
      <h2>Welcome, ${firstName}.</h2>
      <p>You're now part of something different — affirmations in <strong>your own voice</strong>, layered with healing frequencies and binaural beats.</p>
      <p>Here's what makes AFIRMIA powerful:</p>
      <div class="features">
        <ul>
          <li>🎤 <strong>Your voice, cloned</strong> — affirmations spoken by you</li>
          <li>🌊 <strong>Healing frequencies</strong> — 396Hz, 528Hz, 741Hz and more</li>
          <li>🧠 <strong>Binaural beats</strong> — engineered for deep subconscious reprogramming</li>
          <li>📅 <strong>21-day cycles</strong> — guided transformation</li>
        </ul>
      </div>
      <p>Ready to start?</p>
      <a href="https://afirmia.app/dashboard" class="cta">Open your dashboard</a>
      <p style="font-size: 14px; color: #9ca3af; margin-top: 32px;">
        Got questions? Just reply to this email — we read everything.
      </p>
    </div>
    <div class="footer">
      <p>AFIRMIA · <a href="https://afirmia.app">afirmia.app</a></p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('[email] Welcome send error:', error);
      return { success: false, error };
    }

    console.log('[email] Welcome sent to:', to, 'id:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[email] Welcome exception:', err);
    return { success: false, error: err };
  }
}

// ─── Payment Confirmation Email ───────────────────────────────
export async function sendPaymentConfirmationEmail(
  to: string,
  plan: 'pro' | 'premium',
  amount: number,
  currency: string = 'USD',
  name?: string
) {
  const firstName = name?.split(' ')[0] || 'there';
  const planName = plan === 'premium' ? 'Premium' : 'Pro';
  const formattedAmount = `$${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Welcome to AFIRMIA ${planName} 🎉`,
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f8f9fa; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 32px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.95); margin: 8px 0 0; font-size: 16px; }
  .content { padding: 40px 32px; }
  .content h2 { font-size: 22px; margin: 0 0 16px; }
  .content p { font-size: 16px; color: #4a4a4a; margin: 0 0 16px; }
  .receipt { background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0; }
  .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
  .receipt-row:last-child { border-bottom: none; font-weight: 600; padding-top: 16px; font-size: 18px; }
  .receipt-row span:first-child { color: #6b7280; }
  .cta { display: inline-block; background: #10b981; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 24px 0; }
  .footer { padding: 24px 32px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 1px solid #f1f3f5; }
  .footer a { color: #10b981; text-decoration: none; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed ✓</h1>
      <p>You're now on AFIRMIA ${planName}</p>
    </div>
    <div class="content">
      <h2>Thanks, ${firstName}!</h2>
      <p>Your payment was processed successfully. All ${planName} features are now unlocked on your account.</p>
      <div class="receipt">
        <div class="receipt-row">
          <span>Plan</span>
          <span>AFIRMIA ${planName}</span>
        </div>
        <div class="receipt-row">
          <span>Status</span>
          <span style="color: #10b981;">Active</span>
        </div>
        <div class="receipt-row">
          <span>Total</span>
          <span>${formattedAmount}</span>
        </div>
      </div>
      <p>Ready to dive in?</p>
      <a href="https://afirmia.app/dashboard" class="cta">Open AFIRMIA</a>
      <p style="font-size: 14px; color: #9ca3af; margin-top: 32px;">
        Need help or want to manage your subscription? Just reply to this email.
      </p>
    </div>
    <div class="footer">
      <p>AFIRMIA · <a href="https://afirmia.app">afirmia.app</a></p>
      <p style="margin-top: 8px;">This is a receipt for your records.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('[email] Payment confirmation send error:', error);
      return { success: false, error };
    }

    console.log('[email] Payment confirmation sent to:', to, 'id:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[email] Payment confirmation exception:', err);
    return { success: false, error: err };
  }
}
