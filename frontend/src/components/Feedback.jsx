export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="notice notice--error" role="alert">
      <div>
        <p className="notice__title">Algo salió mal</p>
        <p className="notice__body">{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

export function SuccessNotice({ title, children }) {
  return (
    <div className="notice notice--success" role="status">
      <p className="notice__title">{title}</p>
      {children}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {hint ? <p className="empty-state__hint">{hint}</p> : null}
    </div>
  );
}

export function TableSkeleton({ rows = 4, columns = 5 }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="skeleton__row" key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <span className="skeleton__cell" key={columnIndex} />
          ))}
        </div>
      ))}
    </div>
  );
}
