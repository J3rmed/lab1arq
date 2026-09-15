const API_BASE = "/api";

const STATUS_FALLBACK = {
  400: "La solicitud fue rechazada por el servidor.",
  404: "El recurso solicitado no existe.",
  500: "Error interno del servidor.",
};

const CONNECTION_ERROR =
  "No hay conexión con el backend. Verifica que Spring Boot esté corriendo en el puerto 8088.";

async function extractMessage(response) {
  const fallback = STATUS_FALLBACK[response.status] ?? "No se pudo completar la operación.";
  let raw;
  try {
    raw = await response.text();
  } catch {
    return fallback;
  }

  const text = raw.trim();
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string" && parsed) return parsed;
    if (parsed && typeof parsed.message === "string" && parsed.message) return parsed.message;
    return fallback;
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(CONNECTION_ERROR);
  }

  if (!response.ok) {
    throw new Error(await extractMessage(response));
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getCustomers() {
  return request("/customers");
}

export function createTransfer(transfer) {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(transfer),
  });
}

export function getTransactionsByAccount(accountNumber) {
  return request(`/transactions/account/${encodeURIComponent(accountNumber)}`);
}
