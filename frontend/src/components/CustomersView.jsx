import { EmptyState, ErrorNotice, TableSkeleton } from "./Feedback.jsx";
import { formatMoney } from "../format.js";

export default function CustomersView({ customers, loading, error, onRefresh }) {
  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h2 className="view-title">Clientes registrados</h2>
          <p className="view-subtitle">
            Consulta las cuentas creadas en la base de datos y su saldo actual.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {error ? <ErrorNotice message={error} onRetry={onRefresh} /> : null}

      {!error && loading ? <TableSkeleton rows={4} columns={5} /> : null}

      {!error && !loading && customers.length === 0 ? (
        <EmptyState
          title="Todavía no hay clientes"
          hint="Crea una cuenta con POST /api/customers y vuelve a actualizar esta vista."
        />
      ) : null}

      {!error && !loading && customers.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <caption className="visually-hidden">
              Listado de clientes con su número de cuenta y saldo
            </caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Apellido</th>
                <th scope="col">Número de cuenta</th>
                <th scope="col" className="ta-right">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="num">{customer.id}</td>
                  <td>{customer.firstName}</td>
                  <td>{customer.lastName}</td>
                  <td className="num">{customer.accountNumber}</td>
                  <td className="num ta-right strong">{formatMoney(customer.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
