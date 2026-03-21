import process from "process";

const API_BASE = process.env.SMOKE_API_BASE || "http://localhost:5000/api";

const print = (title, value) => {
  console.log(`[SMOKE] ${title}: ${value}`);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { response, data };
};

const run = async () => {
  print("API", API_BASE);

  const { response: healthRes, data: healthData } = await requestJson(`${API_BASE}/health`);
  if (!healthRes.ok) {
    throw new Error(`Health check failed with ${healthRes.status}`);
  }
  print("Health", "OK");
  print("Database", healthData?.database || "unknown");

  const email = process.env.SMOKE_USER_EMAIL;
  const password = process.env.SMOKE_USER_PASSWORD;
  if (!email || !password) {
    print("Auth flow", "Skipped (SMOKE_USER_EMAIL / SMOKE_USER_PASSWORD not set)");
    return;
  }

  const { response: loginRes, data: loginData } = await requestJson(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok || !loginData?.token) {
    throw new Error(`Login smoke test failed (${loginRes.status})`);
  }
  print("Auth", "OK");

  const { response: ordersRes } = await requestJson(`${API_BASE}/orders/mine`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  if (!ordersRes.ok) {
    throw new Error(`Orders smoke test failed (${ordersRes.status})`);
  }
  print("Orders API", "OK");
};

run()
  .then(() => {
    print("Result", "PASS");
  })
  .catch((error) => {
    print("Result", `FAIL - ${error.message}`);
    process.exit(1);
  });