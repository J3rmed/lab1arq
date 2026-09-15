import { useCallback, useEffect, useState } from "react";
import CustomersView from "./components/CustomersView.jsx";
import HistoryView from "./components/HistoryView.jsx";
import TransferView from "./components/TransferView.jsx";
import { getCustomers } from "./api.js";

const VIEWS = [
  { id: "customers", label: "Clientes" },
  { id: "transfer", label: "Transferencia" },
  { id: "history", label: "Historial" },
];

export default function App() {
  const [activeView, setActiveView] = useState("customers");
  const [customers, setCustomers] = useState([]);
  const [customersError, setCustomersError] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    setCustomersError(null);
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      setCustomersError(error.message);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="brand">
            Udea<span className="brand__accent">Bank</span>
          </span>
          <nav className="nav" aria-label="Secciones principales">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav__item${activeView === item.id ? " nav__item--active" : ""}`}
                aria-current={activeView === item.id ? "page" : undefined}
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeView === "customers" ? (
          <CustomersView
            customers={customers}
            loading={loadingCustomers}
            error={customersError}
            onRefresh={loadCustomers}
          />
        ) : null}

        {activeView === "transfer" ? (
          <TransferView
            customers={customers}
            customersError={customersError}
            onRefresh={loadCustomers}
            onTransferred={loadCustomers}
          />
        ) : null}

        {activeView === "history" ? (
          <HistoryView
            customers={customers}
            customersError={customersError}
            onRefresh={loadCustomers}
          />
        ) : null}
      </main>

      <footer className="app-footer">
        <p>
          Backend en <code>localhost:8088</code> · Frontend servido por Vite en{" "}
          <code>localhost:5173</code>
        </p>
      </footer>
    </div>
  );
}
