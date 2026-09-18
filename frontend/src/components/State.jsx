export function Loading({ label = 'Loading…' }) { return <div className="state muted"><span className="spinner" />{label}</div> }
export function ErrorState({ error, onRetry }) { return <div className="state error-state"><strong>Unable to load this section</strong><span>{error?.message || String(error)}</span>{onRetry && <button className="button secondary" onClick={onRetry}>Retry</button>}</div> }
export function Empty({ children = 'No records found.' }) { return <div className="state muted">{children}</div> }
