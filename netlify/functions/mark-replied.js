const fs = require("fs");

const STORE_PATH = "/tmp/lead-store.json";

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      return JSON.parse(raw || "{}");
    }
  } catch (err) {
    // Best-effort store; okay to reset for V1.
  }
  return {};
}

function saveStore(store) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (err) {
    // Best-effort store; fine for V1.
  }
}

exports.handler = async event => {
  const leadId =
    event.queryStringParameters?.lead_id ||
    event.queryStringParameters?.id ||
    null;

  if (!leadId) {
    return { statusCode: 400, body: "Missing lead_id" };
  }

  const store = loadStore();
  if (!store[leadId]) {
    return { statusCode: 404, body: "Lead not found" };
  }

  store[leadId].manual_reply_sent = true;
  saveStore(store);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, lead_id: leadId })
  };
};

