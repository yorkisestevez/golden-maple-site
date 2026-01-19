import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  try {
    const store = getStore('leads');

    const params = new URLSearchParams(event.body || '');
    const email = params.get('email');
    const name = params.get('name') || '';

    if (!email) {
      return { statusCode: 400, body: 'Missing email' };
    }

    const lead = {
      email,
      name,
      submittedAt: Date.now(),
      followUpSent: false
    };

    await store.set(email, JSON.stringify(lead));

    return {
      statusCode: 200,
      body: 'Lead stored'
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Lead intake error'
    };
  }
};

