const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const { token } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: token,
    },
  });
};

const fill = (template, vars) =>
  Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`{{${k}}}`, 'g'), v || ''),
    template
  );

// ─── Templates ────────────────────────────────────────────────────────────────

const DEMO_CONFIRMATION = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0;background:#f4f4f5}
  .w{max-width:600px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .h{background:#2563eb;padding:32px 40px}.h h1{color:#fff;margin:0;font-size:22px;font-weight:600}
  .b{padding:40px}.b p{line-height:1.7;margin:0 0 16px}
  .box{background:#eff6ff;border-left:4px solid #2563eb;padding:18px 22px;border-radius:0 6px 6px 0;margin:24px 0}
  .box p{margin:5px 0;font-size:14px}.box strong{color:#1d4ed8}
  .f{padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
</style></head>
<body><div class="w">
  <div class="h"><h1>Demo Booking Confirmed ✓</h1></div>
  <div class="b">
    <p>Hi {{NAME}},</p>
    <p>Thanks for booking a demo with <strong>{{BUSINESS_NAME}}</strong>. We're looking forward to it!</p>
    <div class="box">
      <p><strong>Name:</strong> {{NAME}}</p>
      <p><strong>Company:</strong> {{COMPANY}}</p>
      <p><strong>Preferred Date/Time:</strong> {{DEMO_DATE}}</p>
    </div>
    <p>We'll send a calendar invite and meeting link to this address shortly. Need to reschedule? Just reply to this email.</p>
    <p>Talk soon,<br><strong>The {{BUSINESS_NAME}} Team</strong></p>
  </div>
  <div class="f">{{BUSINESS_NAME}} · You're receiving this because you booked a demo on our website.</div>
</div></body></html>`;

const DEMO_OWNER = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0;background:#f4f4f5}
  .w{max-width:600px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .h{background:#16a34a;padding:32px 40px}.h h1{color:#fff;margin:0;font-size:22px;font-weight:600}
  .b{padding:40px}.b p{line-height:1.7;margin:0 0 16px}
  .box{background:#f0fdf4;border-left:4px solid #16a34a;padding:18px 22px;border-radius:0 6px 6px 0;margin:24px 0}
  .box p{margin:5px 0;font-size:14px}.box strong{color:#15803d}
  .msg{background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;padding:18px;margin:16px 0;font-size:14px;line-height:1.7;white-space:pre-wrap}
  .f{padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
</style></head>
<body><div class="w">
  <div class="h"><h1>New Demo Booking</h1></div>
  <div class="b">
    <p>You have a new demo booking from your website:</p>
    <div class="box">
      <p><strong>Name:</strong> {{NAME}}</p>
      <p><strong>Email:</strong> {{EMAIL}}</p>
      <p><strong>Company:</strong> {{COMPANY}}</p>
      <p><strong>Preferred Date/Time:</strong> {{DEMO_DATE}}</p>
    </div>
    <p><strong>Message:</strong></p>
    <div class="msg">{{MESSAGE}}</div>
    <p>Reply to this email to contact them directly, or send a calendar invite to <strong>{{EMAIL}}</strong>.</p>
  </div>
  <div class="f">Sent from your {{BUSINESS_NAME}} website · demo-booking form</div>
</div></body></html>`;

const WISHLIST_CONFIRMATION = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0;background:#f4f4f5}
  .w{max-width:600px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .h{background:#7c3aed;padding:32px 40px}.h h1{color:#fff;margin:0;font-size:22px;font-weight:600}
  .b{padding:40px}.b p{line-height:1.7;margin:0 0 16px}
  .box{background:#f5f3ff;border-left:4px solid #7c3aed;padding:18px 22px;border-radius:0 6px 6px 0;margin:24px 0}
  .box p{margin:0;font-size:14px;color:#5b21b6}
  .f{padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
  .f a{color:#9ca3af}
</style></head>
<body><div class="w">
  <div class="h"><h1>You're on the list!</h1></div>
  <div class="b">
    <p>Hi {{NAME}},</p>
    <p>You've been added to the <strong>{{BUSINESS_NAME}}</strong> wishlist. You'll be among the first to know when we launch something new.</p>
    <div class="box">
      <p>We'll send exclusive updates and early access offers to <strong>{{EMAIL}}</strong>.</p>
    </div>
    <p>Stay tuned — exciting things are coming.</p>
    <p>Best,<br><strong>The {{BUSINESS_NAME}} Team</strong></p>
  </div>
  <div class="f">{{BUSINESS_NAME}} · <a href="#">Unsubscribe</a></div>
</div></body></html>`;

const CONTACT_AUTOREPLY = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0;background:#f4f4f5}
  .w{max-width:600px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .h{background:#0f172a;padding:32px 40px}.h h1{color:#fff;margin:0;font-size:22px;font-weight:600}
  .b{padding:40px}.b p{line-height:1.7;margin:0 0 16px}
  .msg{background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;padding:18px;margin:16px 0;font-size:14px;line-height:1.7;white-space:pre-wrap}
  .f{padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
</style></head>
<body><div class="w">
  <div class="h"><h1>We got your message</h1></div>
  <div class="b">
    <p>Hi {{NAME}},</p>
    <p>Thanks for reaching out to <strong>{{BUSINESS_NAME}}</strong>. We've received your message and will get back to you within 1–2 business days.</p>
    <p><strong>Your message:</strong></p>
    <div class="msg">{{MESSAGE}}</div>
    <p>If it's urgent, just reply directly to this email.</p>
    <p>Talk soon,<br><strong>The {{BUSINESS_NAME}} Team</strong></p>
  </div>
  <div class="f">{{BUSINESS_NAME}} · You're receiving this because you contacted us via our website.</div>
</div></body></html>`;

const CONTACT_OWNER = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;margin:0;padding:0;background:#f4f4f5}
  .w{max-width:600px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .h{background:#b45309;padding:32px 40px}.h h1{color:#fff;margin:0;font-size:22px;font-weight:600}
  .b{padding:40px}.b p{line-height:1.7;margin:0 0 16px}
  .box{background:#fffbeb;border-left:4px solid #b45309;padding:18px 22px;border-radius:0 6px 6px 0;margin:24px 0}
  .box p{margin:5px 0;font-size:14px}.box strong{color:#92400e}
  .msg{background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;padding:18px;margin:16px 0;font-size:14px;line-height:1.7;white-space:pre-wrap}
  .f{padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
</style></head>
<body><div class="w">
  <div class="h"><h1>New Contact Form Message</h1></div>
  <div class="b">
    <p>Someone just submitted your contact form:</p>
    <div class="box">
      <p><strong>Name:</strong> {{NAME}}</p>
      <p><strong>Email:</strong> {{EMAIL}}</p>
      <p><strong>Subject:</strong> {{SUBJECT}}</p>
    </div>
    <p><strong>Message:</strong></p>
    <div class="msg">{{MESSAGE}}</div>
    <p>Reply to this email to respond directly to <strong>{{NAME}}</strong>.</p>
  </div>
  <div class="f">Sent from your {{BUSINESS_NAME}} website · contact form</div>
</div></body></html>`;

// ─── Form handlers ─────────────────────────────────────────────────────────────

const handleDemoBooking = async (transport, f) => {
  const vars = {
    NAME: f.name,
    EMAIL: f.email,
    COMPANY: f.company || 'N/A',
    DEMO_DATE: f['preferred-date'] || f['preferred-datetime'] || f.preferred_date || 'TBD',
    MESSAGE: f.message || '(none)',
    BUSINESS_NAME: process.env.BUSINESS_NAME,
  };

  await transport.sendMail({
    from: `"${process.env.BUSINESS_NAME}" <${process.env.GMAIL_USER}>`,
    to: f.email,
    subject: `Demo Booking Confirmed — ${process.env.BUSINESS_NAME}`,
    html: fill(DEMO_CONFIRMATION, vars),
  });

  await transport.sendMail({
    from: `"${process.env.BUSINESS_NAME} Website" <${process.env.GMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    replyTo: f.email,
    subject: `New Demo Booking: ${f.name}${f.company ? ` (${f.company})` : ''}`,
    html: fill(DEMO_OWNER, vars),
  });
};

const handleWishlist = async (transport, f) => {
  await transport.sendMail({
    from: `"${process.env.BUSINESS_NAME}" <${process.env.GMAIL_USER}>`,
    to: f.email,
    subject: `You're on the ${process.env.BUSINESS_NAME} wishlist!`,
    html: fill(WISHLIST_CONFIRMATION, {
      NAME: f.name,
      EMAIL: f.email,
      BUSINESS_NAME: process.env.BUSINESS_NAME,
    }),
  });
};

const handleContact = async (transport, f) => {
  const vars = {
    NAME: f.name,
    EMAIL: f.email,
    SUBJECT: f.subject || '(no subject)',
    MESSAGE: f.message || '(none)',
    BUSINESS_NAME: process.env.BUSINESS_NAME,
  };

  await transport.sendMail({
    from: `"${process.env.BUSINESS_NAME}" <${process.env.GMAIL_USER}>`,
    to: f.email,
    subject: `We received your message — ${process.env.BUSINESS_NAME}`,
    html: fill(CONTACT_AUTOREPLY, vars),
  });

  await transport.sendMail({
    from: `"${process.env.BUSINESS_NAME} Website" <${process.env.GMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    replyTo: f.email,
    subject: `Contact Form: ${f.subject || f.name}`,
    html: fill(CONTACT_OWNER, vars),
  });
};

// ─── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Netlify webhook sends JSON; direct form posts send URL-encoded
    let fields;
    const ct = (event.headers['content-type'] || '').toLowerCase();

    if (ct.includes('application/json')) {
      const body = JSON.parse(event.body);
      fields = { 'form-name': body.form_name, ...body.data };
    } else {
      fields = Object.fromEntries(new URLSearchParams(event.body).entries());
    }

    const formName = fields['form-name'];
    if (!formName) return { statusCode: 400, body: 'Missing form-name' };

    const transport = await createTransporter();

    switch (formName) {
      case 'demo-booking': await handleDemoBooking(transport, fields); break;
      case 'wishlist':     await handleWishlist(transport, fields);    break;
      case 'contact':      await handleContact(transport, fields);      break;
      default:
        console.warn(`Unknown form: ${formName}`);
        return { statusCode: 400, body: `Unknown form: ${formName}` };
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('email-agent error:', err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
