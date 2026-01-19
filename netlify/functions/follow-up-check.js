import { getStore } from '@netlify/blobs';

export const config = {
  schedule: '*/5 * * * *'
};

export const handler = async () => {
  try {
    const store = getStore('leads');
    const entries = await store.list();

    const now = Date.now();
    const TWENTY_MIN = 20 * 60 * 1000;

    for (const key of entries.keys) {
      const raw = await store.get(key);
      if (!raw) continue;

      const lead = JSON.parse(raw);

      if (lead.followUpSent) continue;
      if (now - lead.submittedAt < TWENTY_MIN) continue;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Golden Maple Landscaping <no-reply@goldenmaplelandscaping.ca>',
          to: [lead.email],
          subject: 'Quick follow-up on your request',
          html: `
            <p>Hi${lead.name ? ' ' + lead.name : ''},</p>
            <p>I just wanted to follow up and make sure your message didn’t get lost.</p>
            <p>If it helps, the next step is usually a quick clarification around scope and timing.</p>
            <p>Feel free to reply here and we can take a look together.</p>
            <p>— Yorkis</p>
          `
        })
      });

      if (response.ok) {
        lead.followUpSent = true;
        await store.set(key, JSON.stringify(lead));
      }
    }

    return {
      statusCode: 200,
      body: 'Follow-up check complete'
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Follow-up check error'
    };
  }
};

