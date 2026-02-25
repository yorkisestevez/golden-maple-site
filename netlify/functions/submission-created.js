/**
 * Triggered when a form submission is verified (Netlify submission-created event).
 * Sends the form data to the estimator notification recipient.
 * To avoid duplicate emails, disable the built-in "Email" form notification in Netlify UI
 * (Project configuration > Notifications > Form submission notifications).
 */

const ESTIMATOR_NOTIFICATION_RECIPIENT = 'Yorkis@goldenmaplelandscaping.ca';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const data = payload.data || payload;
    const formName = payload.form_name || data.form_name || 'contact';

    const subject = (data.subject || payload.subject || '').trim() || `Form submission from ${formName}`;
    const emailBody = (data.estimator_email_body || data.body || payload.body || '').trim() || buildBodyFromData(data);

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY not set');
      return { statusCode: 500, body: 'Email not configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Golden Maple Landscaping <no-reply@goldenmaplelandscaping.ca>',
        to: [ESTIMATOR_NOTIFICATION_RECIPIENT],
        subject,
        html: `<pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(emailBody)}</pre>`
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend error:', response.status, errText);
      return { statusCode: 502, body: 'Email send failed' };
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('submission-created error:', err);
    return { statusCode: 500, body: 'Handler error' };
  }
};

function buildBodyFromData(data) {
  const lines = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === 'form-name' || value == null || value === '') continue;
    lines.push(`${key}: ${value}`);
  }
  return lines.join('\n');
}

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
