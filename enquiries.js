const STORE_KEY = "gengbatik:enquiries";

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        req.destroy();
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function getStorageConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

async function redisCommand(command) {
  const { url, token } = getStorageConfig();
  if (!url || !token) {
    throw new Error("Storage is not configured");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    throw new Error(json.error || "Storage request failed");
  }

  return json.result;
}

module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const body = JSON.parse(await readBody(req));
      const record = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        name: String(body.name || "").trim(),
        contact: String(body.contact || "").trim(),
        type: String(body.type || "").trim(),
        message: String(body.message || "").trim(),
        source: "website",
        status: "Baru",
      };

      if (!record.name || !record.contact || !record.type || !record.message) {
        return send(res, 400, { ok: false, error: "Maklumat tidak lengkap." });
      }

      await redisCommand(["LPUSH", STORE_KEY, JSON.stringify(record)]);
      return send(res, 200, { ok: true, record });
    } catch (error) {
      return send(res, 500, { ok: false, error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const password = req.query?.password || "";
      if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
        return send(res, 401, { ok: false, error: "Kata laluan salah." });
      }

      const rows = await redisCommand(["LRANGE", STORE_KEY, "0", "250"]);
      const records = rows
        .map((row) => {
          try {
            return JSON.parse(row);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      return send(res, 200, { ok: true, records });
    } catch (error) {
      return send(res, 500, { ok: false, error: error.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return send(res, 405, { ok: false, error: "Method not allowed" });
};
