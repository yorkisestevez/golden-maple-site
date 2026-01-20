// VERSION: 1.0.5 — SINGLE HANDLER, GEMINI 2.5 FLASH, NETLIFY PROD SAFE

const SYSTEM_PROMPT = `
You are Golden Maple Landscaping’s Design & Planning Assistant.

Your role is to help homeowners understand our design-build process, timelines, materials, and what to expect when planning a premium outdoor living project.

Rules:
- Do NOT provide pricing, square-foot rates, or cost estimates
- Do NOT book appointments or collect contact details
- Do NOT discuss discounts or promotions
- If a homeowner appears ready to proceed, direct them to the “Start Your Project” button on the website
- Tone must be calm, professional, and confident
- Keep responses concise and informative
- Focus on planning, design decisions, materials, construction process, and long-term durability
`;

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ reply: 'Method not allowed.' })
    };
  }

  // Parse request body
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: 'Invalid JSON body.' })
    };
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : null;
  if (
    !messages ||
    messages.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        typeof item.role !== 'string' ||
        typeof item.content !== 'string'
    )
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: 'Invalid messages format.' })
    };
  }

  // Read API key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: 'Server configuration error.' })
    };
  }

  // Build Gemini contents payload
  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    },
    ...messages.map((message) => ({
      role: 'user',
      parts: [{ text: message.content }]
    }))
  ];
  

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', response.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({
          reply: "Sorry, I couldn't generate a response right now."
        })
      };
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts.map((part) => part.text || '').join('').trim()
      : '';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: reply || '' })
    };
  } catch (error) {
    console.error('Gemini unexpected error:', error?.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: 'Unexpected error.' })
    };
  }
};
