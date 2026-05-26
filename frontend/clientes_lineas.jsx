// ============== CLIENTES ==============
const riesgoBadgeC = (r) => ({
  bajo:  <span className="badge b-grn">Bajo</span>,
  medio: <span className="badge b-ylw">Medio</span>,
  alto:  <span className="badge b-red">Alto</span>,
}[r]);

const estatusBadgeC = (e) => ({
  'al-corriente': <span className="badge b-grn"><span className="dot"></span>Al corriente</span>,
  'mora-temprana':<span className="badge b-ylw"><span className="dot"></span>Mora temprana</span>,
  'vencido':      <span className="badge b-red"><span className="dot"></span>Vencido</span>,
}[e]);

// Normaliza cliente de API al formato local
const normalizeC = (c) => ({
  ...c,
  id:     c.folio || c.id,
  _apiId: c.id,
  nombre: c.nombre,
  tel:    c.telefono || c.tel || '—',
  sucursal: c.sucursal?.nombre || c.sucursalId || '—',
  compras: c.totalCompras || 0,
  riesgo: (c.riesgo || 'MEDIO').toLowerCase(),
  estatus: (c.estatus || 'AL_CORRIENTE').toLowerCase().replace(/_/g, '-'),
  linea:   Number(c.lineaCredito?.lineaAprobada || 0),
  usado:   Number(c.lineaCredito?.lineaUsada || 0),
  proximo: c.proximoPago ? new Date(c.proximoPago).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—',
  score:   c.scoreInterno || c.scoreBuro || 0,
});

// FIX: búsqueda funcional en Clientes con datos reales de backend
const Clientes = ({ onOpenClient }) => {
  const [q, setQ] = useState('');
  const [filtroRiesgo, setFiltroRiesgo] = useState('todos');
  const [clientes, setClientes] = useState(CLIENTES);
  const [kpisC, setKpisC] = useState({ total: 3184, lineaProm: 26500, recompra: 62, leales: 411 });

  useEffect(() => {
    window.CRM_API.clientes.getAll({ limit: 100 }).catch(() => null).then(r => {
      if (r?.data?.length) {
        const norm = r.data.map(normalizeC);
        setClientes(norm);
        const lineaProm = norm.reduce((s, c) => s + c.linea, 0) / norm.length || 0;
        setKpisC(prev => ({ ...prev, total: r.total || norm.length, lineaProm: Math.round(lineaProm) }));
      }
    });
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const matchQ = !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase()) || (c.tel || '').includes(q);
      const matchR = filtroRiesgo === 'todos' || c.riesgo === filtroRiesgo;
      return matchQ && matchR;
    });
  }, [q, filtroRiesgo, clientes]);

  return (
  <>
    <div className="page-head">
      <div>
        <h1>Clientes</h1>
        <div className="sub">{clientesFiltrados.length} de {clientes.length} clientes · línea promedio {money(kpisC.lineaProm)} · ticket promedio $14,200</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" onClick={() => setFiltroRiesgo(filtroRiesgo === 'todos' ? 'alto' : 'todos')}>
          <Icon name="filter" size={15}/> {filtroRiesgo === 'todos' ? 'Segmentos' : `Riesgo: ${filtroRiesgo}`}
        </button>
        {/* PENDIENTE BACKEND: POST /clientes — modal de alta requiere guardado en DB */}
        <button className="btn btn-accent" onClick={() => alert('Alta de clientes disponible con backend conectado.\nEndpoint: POST /clientes')}><Icon name="plus" size={15}/> Nuevo cliente</button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
      <Kpi icon="user"  label="Clientes activos" value={kpisC.total.toLocaleString('es-MX')} sub={<><span className="delta-up">▲ 142</span> nuevos este mes</>} color="var(--azul-100)" stroke="var(--azul)"/>
      <Kpi icon="trend" label="Línea promedio" value={money(kpisC.lineaProm)} sub="Crecimiento +18% YoY" color="var(--turquesa-100)" stroke="var(--turquesa-600)"/>
      <Kpi icon="cart"  label="Recompra" value={kpisC.recompra + '%'} sub="Clientes con 2+ ventas" color="var(--naranja-100)" stroke="#b56600"/>
      <Kpi icon="shield"label="Cliente leal" value={kpisC.leales.toLocaleString('es-MX')} sub="5+ años con Casa Ruiz" color="var(--verde-100)" stroke="#0f7d56"/>
    </div>

    <div className="card">
      <div className="card-head">
        <h3>Cartera</h3>
        <div className="right">
          <div className="search" style={{ width: 240, margin: 0 }}>
            <span className="sicon"><Icon name="search" size={14}/></span>
            <input
              placeholder="Buscar por nombre, ID, tel..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            {q && <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-400)', padding: '0 4px' }}>✕</button>}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['todos','bajo','medio','alto'].map(r => (
              <button key={r} onClick={() => setFiltroRiesgo(r)} className="btn btn-sm"
                style={{ background: filtroRiesgo === r ? 'var(--azul)' : 'var(--ink-50)', color: filtroRiesgo === r ? '#fff' : 'var(--ink-700)', padding: '4px 10px', fontSize: 11 }}>
                {r === 'todos' ? 'Todos' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {clientesFiltrados.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-400)', fontSize: 14 }}>
          <Icon name="search" size={32} stroke="var(--ink-200)"/><br/>
          No se encontraron clientes con "{q}"
        </div>
      )}
      <table className="tbl" style={{ display: clientesFiltrados.length === 0 ? 'none' : '' }}>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Sucursal</th><th>Línea / Uso</th><th>Score</th><th>Riesgo</th><th>Estatus</th><th>Próx. pago</th><th>Compras</th><th></th></tr>
        </thead>
        <tbody>
          {clientesFiltrados.map(c => {
            const usoPct = (c.usado / c.linea) * 100;
            return (
              <tr key={c.id} onClick={() => onOpenClient(c)} style={{ cursor: 'pointer' }}>
                <td><span className="cell-strong">{c.id}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.nombre} size={30}/>
                    <div>
                      <div className="cell-strong">{c.nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Desde {c.desde}</div>
                    </div>
                  </div>
                </td>
                <td>{c.sucursal}</td>
                <td>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{money(c.usado)} / {money(c.linea)}</div>
                  <div style={{ width: 120, height: 5, background: 'var(--ink-100)', borderRadius: 3, marginTop: 4 }}>
                    <div style={{ width: usoPct + '%', height: '100%', background: usoPct >= 80 ? 'var(--rojo)' : usoPct >= 60 ? 'var(--amarillo)' : 'var(--turquesa)', borderRadius: 3 }}></div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 50, background: c.score >= 700 ? 'var(--verde)' : c.score >= 600 ? 'var(--amarillo)' : 'var(--rojo)' }}></span>
                    <span style={{ fontFamily: 'Elza', fontWeight: 700, color: 'var(--azul)' }}>{c.score}</span>
                  </div>
                </td>
                <td>{riesgoBadgeC(c.riesgo)}</td>
                <td>{estatusBadgeC(c.estatus)}</td>
                <td style={{ fontSize: 12 }}>{c.proxPago}</td>
                <td><b>{c.compras}</b></td>
                <td><button className="btn btn-light btn-sm"><Icon name="right" size={13}/></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
  );
};

// ============== CLIENT DETAIL DRAWER ==============
const ClienteDetail = ({ c, onClose }) => {
  const [aprobandoLinea, setAprobandoLinea] = useState(false);
  const [aprobadoLinea, setAprobadoLinea] = useState(false);
  if (!c) return null;
  const usoPct = (c.usado / c.linea) * 100;
  const lineGrowth = [8000, 12000, 18000, 24000, c.linea];
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: 560 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={c.nombre} size={48}/>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18 }}>{c.nombre}</h3>
            <div style={{ color: 'var(--ink-500)', fontSize: 12 }}>{c.id} · Cliente desde {c.desde} · {c.sucursal}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x"/></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 14, background: 'var(--turquesa-50)', borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--turquesa-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Línea de crédito</div>
              <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 26, color: 'var(--turquesa-600)', marginTop: 4 }}>{money(c.linea)}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>Disponible: {money(c.linea - c.usado)}</div>
              <div className="progress" style={{ marginTop: 8 }}><div style={{ width: usoPct + '%', background: usoPct >= 80 ? 'var(--rojo)' : usoPct >= 60 ? 'var(--amarillo)' : 'var(--turquesa)' }}></div></div>
            </div>
            <div style={{ padding: 14, background: 'var(--azul-50)', borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--azul)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Score interno</div>
              <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 26, color: 'var(--azul)', marginTop: 4 }}>{c.score}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {riesgoBadgeC(c.riesgo)}
                {estatusBadgeC(c.estatus)}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 10 }}>Crecimiento de línea</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Elza', fontWeight: 700, color: 'var(--azul)' }}>
              {lineGrowth.map((v, i) => (
                <React.Fragment key={i}>
                  <span style={{ padding: '6px 12px', background: i === lineGrowth.length - 1 ? 'var(--turquesa)' : 'var(--ink-100)', color: i === lineGrowth.length - 1 ? '#fff' : 'var(--azul)', borderRadius: 8, fontSize: 13 }}>{money(v)}</span>
                  {i < lineGrowth.length - 1 && <Icon name="right" size={12} stroke="var(--ink-300)"/>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: 12, background: 'var(--verde-100)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="sparkle" size={16} stroke="#0f7d56"/>
              <div>
                <div style={{ fontWeight: 700, color: '#0f7d56', fontSize: 13 }}>Elegible para aumento a {money(c.linea * 1.4)}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-700)', marginTop: 2 }}>3 pagos consecutivos puntuales + score arriba de 700.</div>
                <button className="btn btn-sm" style={{ marginTop: 8, background: '#0f7d56', color: '#fff' }}
                  disabled={aprobandoLinea}
                  onClick={async () => {
                    setAprobandoLinea(true);
                    try {
                      const nuevoMonto = Math.round((c.linea || 0) * 1.4);
                      await window.CRM_API.clientes.aumentarLinea(c._apiId || c.id, {
                        montoNuevo: nuevoMonto,
                        motivo: '3 pagos puntuales + score > 700',
                      });
                      setAprobadoLinea(true);
                      setTimeout(() => setAprobadoLinea(false), 2500);
                    } catch (e) {
                      alert('Error: ' + (e.message || 'No se pudo aprobar el aumento'));
                    } finally { setAprobandoLinea(false); }
                  }}>
                  {aprobandoLinea ? 'Procesando…' : aprobadoLinea ? <><Icon name="check" size={12}/> Aprobado</> : 'Aprobar aumento'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 10 }}>Información financiera</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {[['Vivienda', c.vivienda], ['Salario', money(c.salario) + '/mes'], ['Antigüedad', c.antig], ['Teléfono', c.tel], ['Email', c.email], ['Compras totales', c.compras]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--ink-100)' }}>
                  <span style={{ color: 'var(--ink-500)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '0 24px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 10 }}>Historial de compras</div>
            {[
              ['Refrigerador LG 14p · TV TCL 55"', 22400, '27 Nov 2025'],
              ['Lavadora Mabe 17kg',                8900, '14 Sep 2025'],
              ['Sala 3 piezas Roma',               24500, '02 Mar 2025'],
              ['Comedor Toscana 6p',               16800, '18 Dic 2024'],
            ].map(([p, m, f], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ink-100)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--azul-50)', color: 'var(--azul)', display: 'grid', placeItems: 'center' }}><Icon name="package" size={16}/></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{f}</div>
                </div>
                <b style={{ color: 'var(--azul)' }}>{money(m)}</b>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 8 }}>
          {/* FIX: click-to-call real */}
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => window.location.href = `tel:${c.tel.replace(/\D/g,'')}`}>
            <Icon name="phone" size={14}/> Llamar
          </button>
          {/* PENDIENTE BACKEND: flujo de nueva venta / solicitud de crédito */}
          <button className="btn btn-accent" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => alert(`Nueva venta para ${c.nombre} — disponible con backend conectado.\nConectará a módulo de Créditos y Scoring.`)}>
            <Icon name="cards" size={14}/> Nueva venta
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== LÍNEAS DE CRÉDITO ==============
const Lineas = () => {
  const [clientesL, setClientesL] = useState(CLIENTES);
  const [sel, setSel] = useState(CLIENTES[4]); // Patricia (fallback mock)
  const [aprobandoAumento, setAprobandoAumento] = useState(false);
  const [aprobadoAumento, setAprobadoAumento] = useState(false);
  const sample = sel;
  const histLine = [8000, 12000, 18000, 26000, sample.linea, Math.round(sample.linea * 1.4)];
  const labels = ['Ene 21', 'Ago 21', 'Mar 22', 'Oct 23', 'Nov 25', 'Próx.'];

  useEffect(() => {
    window.CRM_API.clientes.getAll({ limit: 100 }).catch(() => null).then(r => {
      if (r?.data?.length) {
        const norm = r.data.map(normalizeC);
        setClientesL(norm);
        // Selecciona el primer cliente real con línea asignada (o el primero disponible)
        const conLinea = norm.find(c => c.linea > 0) || norm[0];
        if (conLinea) setSel(conLinea);
      }
    });
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Líneas de Crédito</h1>
          <div className="sub">Crecimiento gradual basado en comportamiento de pago, recompra y score interno</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* PENDIENTE BACKEND: GET /reportes/lineas */}
          <button className="btn btn-ghost" onClick={() => alert('Reporte de líneas de crédito — disponible con backend.')}>
            <Icon name="chart" size={15}/> Reporte
          </button>
          {/* PENDIENTE BACKEND: POST /clientes/aumentos-masivos */}
          <button className="btn btn-accent" onClick={() => alert('Aumentos masivos — requiere evaluación con backend conectado.\n412 clientes elegibles detectados.')}>
            <Icon name="trend" size={15}/> Sugerir aumentos masivos
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="trend" label="Líneas otorgadas" value="3,184" sub={<><span className="delta-up">▲ 8%</span> vs mes</>} color="var(--azul-100)" stroke="var(--azul)"/>
        <Kpi icon="cash"  label="Saldo dispuesto" value="$48.2M" color="var(--turquesa-100)" stroke="var(--turquesa-600)" sub="58% de capacidad"/>
        <Kpi icon="sparkle"label="Elegibles aumento" value="412" color="var(--verde-100)" stroke="#0f7d56" sub={'Promedio +' + money(8500)}/>
        <Kpi icon="warn"  label="En revisión" value="36" color="var(--naranja-100)" stroke="#b56600" sub="Score &lt; 600"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <h3>Crecimiento de línea · {sample.nombre}</h3>
            <select className="select" style={{ width: 220, padding: '6px 30px 6px 10px', fontSize: 12 }}
              value={sample.id}
              onChange={e => setSel(clientesL.find(c => c.id === e.target.value) || sel)}>
              {clientesL.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="card-pad">
            <div style={{ position: 'relative', padding: '20px 0 40px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                {histLine.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontFamily: 'Elza', fontWeight: 800, fontSize: 13, color: i === histLine.length - 1 ? 'var(--turquesa-600)' : 'var(--azul)' }}>{money(v)}</div>
                    <div style={{ width: '70%', background: 'linear-gradient(180deg, ' + (i === histLine.length - 1 ? 'var(--turquesa)' : 'var(--azul)') + ', ' + (i === histLine.length - 1 ? 'var(--turquesa-600)' : 'var(--azul-700)') + ')', borderRadius: '6px 6px 0 0', height: Math.max(20, (v / Math.max(...histLine)) * 200) + 'px' }}></div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{labels[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 14, background: 'var(--turquesa-50)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--turquesa)', color: '#fff', display: 'grid', placeItems: 'center' }}><Icon name="trend" size={22}/></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--turquesa-600)', fontSize: 14 }}>Crecimiento proyectado · +{pct(((histLine[histLine.length-1] / histLine[0]) - 1))}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-700)' }}>De {money(histLine[0])} (Ene 2021) a {money(histLine[histLine.length-1])} (proyección Dic 2025).</div>
              </div>
              <button className="btn btn-accent btn-sm"
                disabled={aprobandoAumento}
                onClick={async () => {
                  setAprobandoAumento(true);
                  try {
                    const nuevoMonto = Math.round((sample.linea || 0) * 1.4);
                    await window.CRM_API.clientes.aumentarLinea(sample._apiId || sample.id, {
                      montoNuevo: nuevoMonto, motivo: 'Aprobación manual desde módulo Líneas',
                    });
                    setAprobadoAumento(true);
                    setTimeout(() => setAprobadoAumento(false), 2500);
                  } catch (e) {
                    alert('Error: ' + (e.message || 'No se pudo aprobar el aumento'));
                  } finally { setAprobandoAumento(false); }
                }}>
                {aprobandoAumento ? 'Procesando…' : aprobadoAumento ? '✓ Aprobado' : 'Aprobar aumento'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Comportamiento de pago</h3></div>
          <div className="card-pad">
            {/* FIX: seed fijo — antes Math.random() regeneraba en cada render */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {[0.82,0.71,0.95,0.88,0.13,0.74,0.90,0.62,0.45,0.87,0.23,0.91,0.76,0.58,0.84,0.96,0.19,0.77,0.92,0.66,0.55,0.85,0.98,0.72,0.43,0.89,0.60,0.81,0.97,0.14,0.73,0.93,0.68,0.50,0.86,0.99,0.22,0.79,0.64,0.83,0.94,0.35,0.75,0.91,0.57,0.82,0.47,0.88,0.69,0.95,0.26,0.80,0.92,0.63,0.84,0.96,0.18,0.78,0.61,0.87,0.52,0.93,0.70,0.83,0.97,0.39,0.76,0.90,0.65,0.85,0.98,0.28,0.81,0.44,0.91,0.67,0.54,0.88,0.72,0.94,0.20,0.77,0.62,0.86].map((r, i) => {
                const bg = r < 0.78 ? 'var(--verde)' : r < 0.94 ? 'var(--amarillo)' : 'var(--rojo)';
                return <div key={i} style={{ paddingTop: '100%', background: bg, borderRadius: 3, opacity: 0.85 }}></div>;
              })}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: 'var(--ink-500)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, background: 'var(--verde)', borderRadius: 2 }}></span> Puntual</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, background: 'var(--amarillo)', borderRadius: 2 }}></span> Atraso &lt;7d</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, background: 'var(--rojo)', borderRadius: 2 }}></span> Mora</span>
            </div>

            <div style={{ marginTop: 20, fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 8 }}>Criterios de elegibilidad</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['3+ pagos consecutivos puntuales', true],
                ['Score interno ≥ 700',             true],
                ['Antigüedad cliente ≥ 12 meses',   true],
                ['Sin mora >30d en últimos 6 meses',true],
                ['Línea actual ≥ 60% utilizada',    false],
              ].map(([t, ok], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 50, background: ok ? 'var(--verde-100)' : 'var(--ink-100)', color: ok ? '#0f7d56' : 'var(--ink-400)', display: 'grid', placeItems: 'center' }}>
                    <Icon name={ok ? 'check' : 'x'} size={11}/>
                  </span>
                  <span style={{ color: ok ? 'var(--ink-700)' : 'var(--ink-500)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { Clientes, ClienteDetail, Lineas });
