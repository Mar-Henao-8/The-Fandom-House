export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="estado" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function ErrorCaja({ mensaje, reintentar }) {
  return (
    <div className="alerta alerta--error" role="alert">
      <p>{mensaje}</p>
      {reintentar && (
        <button className="btn btn--fantasma" type="button" onClick={reintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function ExitoCaja({ mensaje }) {
  return (
    <div className="alerta alerta--ok" role="status">
      <p>{mensaje}</p>
    </div>
  );
}
