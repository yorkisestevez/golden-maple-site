/**
 * Deck Estimator lead notification.
 * Sends email to goldenmaplelandscaping@gmail.com when pricing is revealed.
 * Requires RESEND_API_KEY in Netlify environment.
 */

const NOTIFICATION_EMAIL = 'goldenmaplelandscaping@gmail.com';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    const name = data.name || '';
    const phone = data.phone || '';
    const email = data.email || '';
    const address = data.address || '';
    const postal = data.postal || '';
    const estimatedRange = data.estimatedRange || '';
    const estimatorData = data.estimatorData || {};

    const lines = [
      '--- Deck Estimator Lead ---',
      '',
      'Contact',
      '-------',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Address: ${address}`,
      `Postal: ${postal}`,
      '',
      'Project',
      '-------',
      `Dimensions: ${estimatorData.dimensions || '—'}`,
      `Height: ${estimatorData.height || '—'}`,
      `Materials: ${estimatorData.material || '—'}`,
      `Railing: ${estimatorData.railing || '—'}`,
      `Stairs: ${estimatorData.stairs || '—'}`,
      `Upgrades: ${Array.isArray(estimatorData.addons) ? estimatorData.addons.join(', ') : (estimatorData.addons || '—')}`,
      `Lighting: ${estimatorData.lighting || '—'}`,
      '',
      `Estimated Range: ${estimatedRange}`,
      '',
      `Source: ${data.source || 'Deck Estimator'}`,
    ];

    const body = lines.join('\n');

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY not set');
      return { statusCode: 500, body: 'Email not configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Golden Maple Landscaping <no-reply@goldenmaplelandscaping.ca>',
        to: [NOTIFICATION_EMAIL],
        subject: `Deck Estimator: ${name || email || 'New lead'} — ${estimatedRange}`,
        text: body,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend error:', response.status, errText);
      return { statusCode: 502, body: 'Email send failed' };
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('send-lead error:', err);
    return { statusCode: 500, body: 'Handler error' };
  }
};
