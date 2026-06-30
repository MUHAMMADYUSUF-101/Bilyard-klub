import { getStore } from "@netlify/blobs";

const STORE_NAME = "bilyard-club";
const STATE_KEY = "state";

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

async function loadState(store) {
  const data = await store.get(STATE_KEY, { type: "json" });
  if (data) return data;
  const initial = { tables: [], sessions: [] };
  await store.setJSON(STATE_KEY, initial);
  return initial;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  const store = getStore(STORE_NAME);

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    body = {};
  }

  const action = body.action;

  try {
    if (action === "getState") {
      const state = await loadState(store);
      return json(200, { ok: true, tables: state.tables, sessions: state.sessions });
    }

    if (action === "save") {
      if (!Array.isArray(body.tables) || !Array.isArray(body.sessions)) {
        return json(400, { ok: false, error: "Noto'g'ri ma'lumot formati" });
      }
      const state = { tables: body.tables, sessions: body.sessions };
      await store.setJSON(STATE_KEY, state);
      return json(200, { ok: true });
    }

    return json(400, { ok: false, error: "Noma'lum amal" });
  } catch (err) {
    return json(500, { ok: false, error: String((err && err.message) || err) });
  }
};
