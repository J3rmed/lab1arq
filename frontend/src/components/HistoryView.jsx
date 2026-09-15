import { useCallback, useEffect, useState } from "react";
import { EmptyState, ErrorNotice, TableSkeleton } from "./Feedback.jsx";
import { getTransactionsByAccount } from "../api.js";
import { customerLabel, formatDateTime, formatMoney } from "../format.js";

export default function HistoryView({ customers, customersError, onRefresh }) {
  const [account, setAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadHistory = useCallback(async (accountNumber, isCancelled) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactionsByAccount(accountNumber);
      if (!isCancelled()) setTransactions(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (!isCancelled()) {
        setError(requestError.message);
        setTransactions([]);
      }
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!account) {
      setTransactions([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    loadHistory(account, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [account, reloadToken, loadHistory]);

  const selectedCustomer = customers.find((customer) => customer.accountNumber === account);

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h2 className="view-title">Histórico de transacciones</h2>
          <p className="view-subtitle">
            Selecciona una cuenta para ver los movimientos donde participa.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setReloadToken((token) => token + 1)}
          disabled={!account || loading}
        >
          {loading ? "Cargando…" : "Actualizar"}
        </button>
      </div>

      {customersError ? (
        <ErrorNotice message={customersError} onRetry={onRefresh} />
      ) : null}

      <div className="card form">
        <div className="field">
          <label className="field__label" htmlFor="history-account">
            Cuenta a consultar
          </label>
          <select
            id="history-account"
            className="input"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          >
            <option value="">Selecciona una cuenta</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.accountNumber}>
                {customerLabel(customer)}
              </option>
            ))}
          </select>
          {selectedCustomer ? (
            <p className="field__help">
              Saldo actual: {formatMoney(selectedCustomer.balance)}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <ErrorNotice
          message={error}
          onRetry={() => setReloadToken((token) => token + 1)}
        />
      ) : null}

      {!error && loading ? <TableSkeleton rows={4} columns={6} /> : null}

      {!error && !loading && !customersError && !account ? (
        <EmptyState
          title="Ninguna cuenta seleccionada"
          hint={
            customers.length === 0
              ? "Todavía no hay clientes creados. Registra una cuenta con POST /api/customers."
              : "Elige una cuenta en el selector para cargar su historial."
          }
        />
      ) : null}

      {!error && !loading && account && transactions.length === 0 ? (
        <EmptyState
          title="Sin movimientos"
          hint="Esta cuenta todavía no registra transacciones."
        />
      ) : null}

      {!error && !loading && transactions.length > 0 ? (
        <>
          <p className="meta">
            {transactions.length} {transactions.length === 1 ? "movimiento" : "movimientos"}
          </p>
          <div className="table-wrap">
            <table className="table">
              <caption className="visually-hidden">
                Transacciones de la cuenta {account}
              </caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Remitente</th>
                  <th scope="col">Receptor</th>
                  <th scope="col" className="ta-right">
                    Monto
                  </th>
                  <th scope="col">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const outgoing = transaction.senderAccountNumber === account;
                  return (
                    <tr key={transaction.id}>
                      <td className="num">{transaction.id}</td>
                      <td>
                        <span
                          className={`badge ${outgoing ? "badge--out" : "badge--in"}`}
                        >
                          {outgoing ? "Salida" : "Entrada"}
                        </span>
                      </td>
                      <td className="num">{transaction.senderAccountNumber}</td>
                      <td className="num">{transaction.receiverAccountNumber}</td>
                      <td className="num ta-right strong">
                        {formatMoney(transaction.amount)}
                      </td>
                      <td>{formatDateTime(transaction.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
