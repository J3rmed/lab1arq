const moneyFormatter = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatMoney(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return moneyFormatter.format(value);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

export function customerLabel(customer) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return name ? `${name} · ${customer.accountNumber}` : customer.accountNumber;
}
