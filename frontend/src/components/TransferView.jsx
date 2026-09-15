import { useState } from "react";
import { EmptyState, ErrorNotice, SuccessNotice } from "./Feedback.jsx";
import { createTransfer } from "../api.js";
import { customerLabel, formatDateTime, formatMoney } from "../format.js";

export default function TransferView({ customers, customersError, onRefresh, onTransferred }) {
  const [senderAccount, setSenderAccount] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [created, setCreated] = useState(null);

  const sender = customers.find((customer) => customer.accountNumber === senderAccount);

  function validate() {
    const errors = {};
    const numericAmount = Number(amount);

    if (!senderAccount) errors.senderAccount = "Selecciona la cuenta de origen.";
    if (!receiverAccount) errors.receiverAccount = "Selecciona la cuenta de destino.";
    if (senderAccount && senderAccount === receiverAccount) {
      errors.receiverAccount = "La cuenta de destino debe ser distinta a la de origen.";
    }
    if (!amount.trim()) {
      errors.amount = "Ingresa el monto a transferir.";
    } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = "El monto debe ser un número mayor que cero.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setRequestError(null);
    setCreated(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const transaction = await createTransfer({
        senderAccountNumber: senderAccount,
        receiverAccountNumber: receiverAccount,
        amount: Number(amount),
      });
      setCreated(transaction);
      setAmount("");
      await onTransferred();
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const viewHeader = (
    <div className="view-header">
      <div>
        <h2 className="view-title">Realizar transferencia</h2>
        <p className="view-subtitle">
          El saldo se descuenta del origen y se acredita en el destino al confirmar.
        </p>
      </div>
    </div>
  );

  if (customersError) {
    return (
      <section className="view">
        {viewHeader}
        <ErrorNotice message={customersError} onRetry={onRefresh} />
      </section>
    );
  }

  if (customers.length === 0) {
    return (
      <section className="view">
        {viewHeader}
        <EmptyState
          title="No hay cuentas disponibles"
          hint="Crea clientes con POST /api/customers para habilitar las transferencias."
        />
      </section>
    );
  }

  return (
    <section className="view">
      {viewHeader}

      {requestError ? <ErrorNotice message={requestError} /> : null}

      {created ? (
        <SuccessNotice title="Transferencia registrada">
          <dl className="result-grid">
            <div>
              <dt>Transacción</dt>
              <dd className="num">#{created.id}</dd>
            </div>
            <div>
              <dt>Monto</dt>
              <dd className="num">{formatMoney(created.amount)}</dd>
            </div>
            <div>
              <dt>Origen</dt>
              <dd className="num">{created.senderAccountNumber}</dd>
            </div>
            <div>
              <dt>Destino</dt>
              <dd className="num">{created.receiverAccountNumber}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{formatDateTime(created.timestamp)}</dd>
            </div>
          </dl>
        </SuccessNotice>
      ) : null}

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="sender">
            Cuenta de origen
          </label>
          <select
            id="sender"
            className="input"
            value={senderAccount}
            onChange={(event) => {
              setSenderAccount(event.target.value);
              setFieldErrors((previous) => ({ ...previous, senderAccount: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.senderAccount)}
            aria-describedby={fieldErrors.senderAccount ? "sender-error" : "sender-help"}
          >
            <option value="">Selecciona una cuenta</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.accountNumber}>
                {customerLabel(customer)}
              </option>
            ))}
          </select>
          <p className="field__help" id="sender-help">
            {sender
              ? `Saldo disponible: ${formatMoney(sender.balance)}`
              : "Elige la cuenta que enviará el dinero."}
          </p>
          {fieldErrors.senderAccount ? (
            <p className="field__error" id="sender-error">
              {fieldErrors.senderAccount}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="receiver">
            Cuenta de destino
          </label>
          <select
            id="receiver"
            className="input"
            value={receiverAccount}
            onChange={(event) => {
              setReceiverAccount(event.target.value);
              setFieldErrors((previous) => ({ ...previous, receiverAccount: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.receiverAccount)}
            aria-describedby={fieldErrors.receiverAccount ? "receiver-error" : undefined}
          >
            <option value="">Selecciona una cuenta</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.accountNumber}>
                {customerLabel(customer)}
              </option>
            ))}
          </select>
          {fieldErrors.receiverAccount ? (
            <p className="field__error" id="receiver-error">
              {fieldErrors.receiverAccount}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="amount">
            Monto
          </label>
          <input
            id="amount"
            className="input"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            placeholder="100.00"
            onChange={(event) => {
              setAmount(event.target.value);
              setFieldErrors((previous) => ({ ...previous, amount: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.amount)}
            aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
          />
          {fieldErrors.amount ? (
            <p className="field__error" id="amount-error">
              {fieldErrors.amount}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Enviando…" : "Transferir"}
        </button>
      </form>
    </section>
  );
}
