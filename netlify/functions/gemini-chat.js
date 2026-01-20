// VERSION: 1.0.1 - FORCED REFRESH
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
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ reply: 'Method not allowed.' })
    };
  }

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
        item.role !== 'user' ||
        typeof item.content !== 'string'
    )
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: 'Invalid messages format.' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: 'Service unavailable.' })
    };
  }

  const contents = messages.map((message) => ({
    role: 'user',
    parts: [{ text: message.content }]
  }));

  try {
    const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC8F0MzUqZrxq_IloY1dsHqPXctVsbZD70"
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return {
        statusCode: 502,
        body: JSON.stringify({ reply: 'Upstream service error.' })
      };
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        ?.join("")
        ?.trim();
    
    if (!reply) {
      console.error("Gemini returned no text:", JSON.stringify(data));
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Gemini returned no usable text"
        })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
    