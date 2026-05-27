// ============== COBRANZA ==============
const Sema = ({ r }) => {
  const cls = r === 'bajo' ? 's-low' : r === 'medio' ? 's-mid' : 's-high';
  return (<span className={'sem ' + cls}><span className="sd"></span><span className="sd"></span><span className="sd"></span></span>);
};

const Cobranza = () => {
  // ── Estado: fallback a COBRANZA mock mientras se carga el backend ─────────
  const [lista, setLista] = useState(COBRANZA);
  const [kpisData, setKpisData] = useState({ porCobrarSemana: 7140, moraTemprana: 22, mora30dias: 9, cobradoHoy: 4800 });
  const [timeline, setTimeline] = useState([
    ['Lun', '01 Dic', 4, 3200], ['Mar', '02 Dic', 8, 6800], ['Mié', '03 Dic', 5, 4100],
    ['Jue', '04 Dic', 7, 5600], ['Vie', '05 Dic', 11, 9400], ['Sáb', '06 Dic', 3, 2100], ['Dom', '07 Dic', 1, 800],
  ]);

  useEffect(() => {
    // Mapea respuesta API al formato que usa el template
    const mapItem = c => ({
      id: c.id,
      cliente: c.cliente?.nombre || '—',
      tel: c.cliente?.telefono || '',
      monto: Number(c.montoAdeudado || 0),
      dias: c.diasVencido || 0,
      prox: c.fechaProxPago ? new Date(c.fechaProxPago).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—',
      riesgo: (c.riesgo || 'BAJO').toLowerCase(),
      ejecutivo: c.ejecutivo?.nombre || '—',
      accion: c.ultimaAccion || (c.acciones?.[0] ? c.acciones[0].tipo : '—'),
    });
    Promise.all([
      window.CRM_API.cobranza.getAll({ limit: 50 }).catch(() => null),
      window.CRM_API.cobranza.getKpis().catch(() => null),
      window.CRM_API.cobranza.getTimeline().catch(() => null),
    ]).then(([ls, kp, tl]) => {
      if (ls?.data?.length) setLista(ls.data.map(mapItem));
      if (kp) setKpisData(kp);
      if (tl?.length) {
        const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
        setTimeline(tl.map(t => {
          const d = new Date(t.fecha + 'T12:00:00');
          return [days[d.getDay()], t.fecha.slice(8) + ' ' + d.toLocaleString('es-MX',{month:'short'}), t.pagos, Number(t.monto)];
        }));
      }
    });
  }, []);

  const tlMax = Math.max(...timeline.map(t => t[2]), 1);

  return (
  <>
    <div className="page-head">
      <div>
        <h1>Cobranza</h1>
        <div className="sub">{lista.length} cuentas en seguimiento · {money(kpisData.porCobrarSemana)} por cobrar esta semana · mora {kpisData.mora30dias || 0} cuentas &gt;30d</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span title="Próxima versión · requiere endpoint POST /cobranza/campana" style={{ display: 'inline-flex' }}>
          <button className="btn btn-ghost" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}><Icon name="phone" size={15}/> Campaña masiva</button>
        </span>
        <span title="Próxima versión · requiere endpoint POST /cobranza/:id/acuerdo" style={{ display: 'inline-flex' }}>
          <button className="btn btn-accent" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}><Icon name="doc" size={15}/> Generar acuerdo</button>
        </span>
      </div>
    </div>

    <div className="kpi-grid">
      <Kpi icon="cash" label="Por cobrar (sem)" value={money(kpisData.porCobrarSemana)} color="var(--azul-100)" stroke="var(--azul)" sub={`${lista.length} cuentas`}/>
      <Kpi icon="clock" label="Mora temprana" value={kpisData.moraTemprana} color="var(--amarillo-100)" stroke="#946800" sub="1-30 días"/>
      <Kpi icon="warn" label="Mora &gt;30d" value={kpisData.mora30dias} color="var(--rojo-100)" stroke="#c64400" sub="Requiere visita"/>
      <Kpi icon="check" label="Cobrado hoy" value={money(kpisData.cobradoHoy)} color="var(--verde-100)" stroke="#0f7d56" sub="pagos del día"/>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginTop: 16 }}>
      <div className="card">
        <div className="card-head"><h3>Cartera de cobranza</h3><button className="btn btn-light btn-sm"><Icon name="filter" size={13}/></button></div>
        <table className="tbl">
          <thead><tr><th>Cliente</th><th>Monto</th><th>Vencido</th><th>Próx. fecha</th><th>Riesgo</th><th>Ejecutivo</th><th>Última acción</th><th></th></tr></thead>
          <tbody>
            {lista.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.cliente} size={28}/>
                    <div>
                      <div className="cell-strong">{c.cliente}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{c.id}</div>
                    </div>
                  </div>
                </td>
                <td><b style={{ color: 'var(--azul)' }}>{money(c.monto)}</b></td>
                <td>
                  <span className={'badge ' + (c.dias > 15 ? 'b-red' : c.dias > 5 ? 'b-org' : 'b-ylw')}>
                    {c.dias} {c.dias === 1 ? 'día' : 'días'}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{c.prox}</td>
                <td><Sema r={c.riesgo}/></td>
                <td><Avatar name={c.ejecutivo} size={24}/></td>
                <td style={{ fontSize: 12, color: 'var(--ink-500)' }}>{c.accion}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-light btn-sm" title={`Llamar a ${c.cliente}: ${c.tel || '—'}`}
                      onClick={() => c.tel && (window.location.href = `tel:${c.tel.replace(/\D/g,'')}`)}>
                      <Icon name="phone" size={13}/>
                    </button>
                    {/* PENDIENTE BACKEND: envío de Whatsapp */}
                    <button className="btn btn-light btn-sm" title={`Whatsapp a ${c.cliente}`}
                      onClick={() => window.open(`https://wa.me/?text=Hola+${encodeURIComponent(c.cliente)},+te+contactamos+de+Casa+Ruiz+respecto+a+tu+pago.`, '_blank')}><Icon name="mail" size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-head"><h3>Timeline de pagos · próx. 7 días</h3></div>
        <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {timeline.map(([d, f, n, m], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 70px', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{d}</div>
                <div style={{ fontFamily: 'Elza', fontWeight: 700, fontSize: 14, color: 'var(--azul)' }}>{String(f).split(' ')[0]}</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{n} pagos</span>
                  <span style={{ color: 'var(--ink-500)' }}>{money(m)}</span>
                </div>
                <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 3 }}>
                  <div style={{ width: ((n / tlMax) * 100) + '%', height: '100%', background: n === Math.max(...timeline.map(t => t[2])) ? 'var(--turquesa)' : 'var(--azul-600)', borderRadius: 3 }}></div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)', textAlign: 'right' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
  );
};

// ============== REPORTES EJECUTIVOS ==============
const Reportes = () => {
  const [kpisR, setKpisR] = useState({ creditos_aprobados: 1245, tasa_aprobacion: 82, cartera_dispuesta: 48200000, mora_30_dias: 3.4 });
  const [origData, setOrigData] = useState({
    months: ['Jun','Jul','Ago','Sep','Oct','Nov'],
    ventas:   [3200000, 3450000, 3680000, 3900000, 4080000, 4200000],
    cobranza: [3050000, 3300000, 3520000, 3760000, 3950000, 4060000],
  });
  const [riesgoR, setRiesgoR] = useState([
    { riesgo: 'Excelente', pct: 64, color: 'var(--azul)' },
    { riesgo: 'Bueno',     pct: 22, color: 'var(--turquesa)' },
    { riesgo: 'Regular',   pct:  9, color: 'var(--naranja)' },
    { riesgo: 'Malo',      pct:  5, color: 'var(--rojo)' },
  ]);

  useEffect(() => {
    Promise.all([
      window.CRM_API.reportes.getDashboard().catch(() => null),
      window.CRM_API.reportes.getOriginacion().catch(() => null),
      window.CRM_API.reportes.getRiesgo().catch(() => null),
    ]).then(([d, o, r]) => {
      if (d) setKpisR(prev => ({ ...prev, ...d }));
      if (o?.length) {
        const last6 = o.slice(-6);
        setOrigData({
          months: last6.map(m => m.mes),
          ventas:   last6.map(m => m.monto || 0),
          cobranza: last6.map(m => (m.monto || 0) * 0.96), // estimado
        });
      }
      if (r?.length) {
        const colorMap = ['var(--azul)', 'var(--turquesa)', 'var(--naranja)'];
        const lbl = ['Bajo', 'Medio', 'Alto'];
        setRiesgoR(r.map((x, i) => ({ riesgo: lbl[i] || x.riesgo, pct: x.porcentaje || 0, color: colorMap[i] || 'var(--ink-400)' })));
      }
    });
  }, []);

  const months = origData.months;
  const ventas   = origData.ventas;
  const cobranza = origData.cobranza;
  const mora = [4.1, 3.9, 3.7, 3.6, 3.5, Number((kpisR.mora_30_dias ?? 3.4).toFixed(1))];
  const max = Math.max(...ventas, 1);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard Ejecutivo</h1>
          <div className="sub">Indicadores clave de negocio · riesgo, rentabilidad y desempeño</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* PENDIENTE BACKEND: filtro de período dinámico desde /reportes */}
          <button className="btn btn-ghost" title="Filtro de período — disponible con backend">
            <Icon name="cal" size={15}/> Últimos 6 meses
          </button>
          {/* PENDIENTE BACKEND: generación PDF server-side */}
          <button className="btn btn-primary"
            onClick={() => { window.print(); }}>
            <Icon name="doc" size={15}/> Exportar PDF
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="trend" label="Crecimiento YoY" value="+24%" color="var(--turquesa-100)" stroke="var(--turquesa-600)" sub="Vs. 2024"/>
        <Kpi icon="cash" label="Rentabilidad" value={kpisR.tasa_aprobacion + '%'} color="var(--verde-100)" stroke="#0f7d56" sub="Tasa de aprobación"/>
        <Kpi icon="user" label="Cartera dispuesta" value={money(kpisR.cartera_dispuesta || 48200000)} color="var(--azul-100)" stroke="var(--azul)" sub="Líneas activas"/>
        <Kpi icon="shield" label="Mora &gt;30 días" value={(kpisR.mora_30_dias ?? 3.4).toFixed(1) + '%'} color="var(--naranja-100)" stroke="#b56600" sub={<><span className="delta-dn">▼ 0.7 pts</span></>}/>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h3>Originación vs Cobranza · últimos 6 meses</h3>
          <div className="right">
            <span className="badge b-blue">Originación</span>
            <span className="badge b-turq">Cobranza</span>
          </div>
        </div>
        <div className="card-pad">
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 240 }}>
            {months.map((m, i) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, width: '100%', justifyContent: 'center', height: 200 }}>
                  <div style={{ width: 22, height: (ventas[i]/max)*180 + 'px', background: 'linear-gradient(180deg, var(--azul), var(--azul-700))', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ width: 22, height: (cobranza[i]/max)*180 + 'px', background: 'linear-gradient(180deg, var(--turquesa), var(--turquesa-600))', borderRadius: '4px 4px 0 0' }}></div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-head"><h3>Evolución de mora</h3></div>
          <div className="card-pad">
            <LineChart data={mora.map(v => -v)} height={140} color="var(--verde)" fill="rgba(26,168,115,.1)"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-500)', padding: '0 28px' }}>
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'var(--verde-100)', borderRadius: 10, fontSize: 12 }}>
              <b style={{ color: '#0f7d56' }}>▼ 0.7 pts</b> en 6 meses · tendencia saludable
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Rentabilidad por sucursal</h3></div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Tamazula', 36.2], ['Ciudad Guzmán', 32.1], ['Tepatitlán', 28.4], ['GDL Norte', 30.8]].map(([n, p]) => (
              <div key={n}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                  <span style={{ fontFamily: 'Elza', fontWeight: 700, color: 'var(--azul)' }}>{p}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 4 }}>
                  <div style={{ width: (p/40)*100 + '%', height: '100%', background: 'linear-gradient(90deg, var(--turquesa), var(--azul))', borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Distribución de riesgo</h3></div>
          <div className="card-pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut size={120} segments={riesgoR.map(r => ({ value: r.pct || 1, color: r.color }))}/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {riesgoR.map(({ riesgo: l, pct: n, color: c }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 50, background: c }}></span>
                  <span style={{ flex: 1 }}>{l}</span>
                  <b>{n}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============== CONFIGURACIÓN ==============
const Config = () => {
  const [tab, setTab] = useState('usuarios');
  const tabs = [
    { id: 'usuarios', lbl: 'Usuarios', ic: 'users' },
    { id: 'roles',    lbl: 'Roles y permisos', ic: 'shield' },
    { id: 'reglas',   lbl: 'Reglas de scoring', ic: 'gauge' },
    { id: 'sucursales', lbl: 'Sucursales', ic: 'pin' },
    { id: 'branding', lbl: 'Branding', ic: 'sparkle' },
    { id: 'sistema',  lbl: 'Sistema', ic: 'settings' },
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Configuración</h1>
          <div className="sub">Administración del sistema · solo administradores y supervisores</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18 }}>
        <div className="card" style={{ padding: 6, height: 'fit-content' }}>
          {tabs.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: tab === t.id ? 'var(--azul-50)' : '', color: tab === t.id ? 'var(--azul)' : 'var(--ink-700)', fontWeight: tab === t.id ? 700 : 500, fontSize: 13 }}>
              <Icon name={t.ic} size={16}/>
              <span>{t.lbl}</span>
            </div>
          ))}
        </div>

        <div className="card">
          {tab === 'usuarios' && <ConfigUsuarios/>}
          {tab === 'roles' && <ConfigRoles/>}
          {tab === 'reglas' && <ConfigReglas/>}
          {tab === 'sucursales' && <ConfigSucursales/>}
          {tab === 'branding' && <ConfigBranding/>}
          {tab === 'sistema' && <ConfigSistema/>}
        </div>
      </div>
    </>
  );
};

const ROL_LABELS = { ADMINISTRADOR: 'Administrador', SUPERVISOR: 'Supervisor', EJECUTIVO_CRM: 'Ejecutivo CRM', CREDITO: 'Crédito', COBRANZA: 'Cobranza' };
const NuevoUsuarioModal = ({ onClose, onCreate }) => {
  const [f, setF] = useState({ nombre: '', email: '', password: '', rol: 'EJECUTIVO_CRM', sucursalId: '' });
  const [sucursales, setSucursales] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.CRM_API.sucursales.getAll().catch(() => null).then(ss => {
      if (ss?.length) { setSucursales(ss); setF(prev => ({ ...prev, sucursalId: ss[0].id })); }
    });
  }, []);

  const handleCreate = async () => {
    if (!f.nombre.trim() || !f.email.trim() || !f.password.trim()) {
      setError('Nombre, email y contraseña son requeridos.'); return;
    }
    setSaving(true); setError('');
    try {
      const created = await window.CRM_API.usuarios.create({
        nombre: f.nombre.trim(), email: f.email.trim(), password: f.password,
        rol: f.rol, sucursalId: f.sucursalId || undefined,
      });
      onCreate && onCreate(created); onClose();
    } catch (e) { setError(e.message || 'Error al crear el usuario.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18 }}>Invitar usuario</h3>
            <div style={{ color: 'var(--ink-500)', fontSize: 12, marginTop: 2 }}>Alta en sistema · acceso inmediato</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ padding: 10, background: '#fff0ee', color: '#c64400', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <div className="field"><label>Nombre completo *</label><input className="input" value={f.nombre} onChange={e => setF({...f, nombre: e.target.value})} placeholder="Ej. Ana García Ruiz"/></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Email *</label><input className="input" type="email" value={f.email} onChange={e => setF({...f, email: e.target.value})} placeholder="ana@casaruiz.mx"/></div>
            <div className="field"><label>Contraseña inicial *</label><input className="input" type="password" value={f.password} onChange={e => setF({...f, password: e.target.value})} placeholder="Mínimo 8 caracteres"/></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Rol</label>
              <select className="select" value={f.rol} onChange={e => setF({...f, rol: e.target.value})}>
                {Object.entries(ROL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field"><label>Sucursal</label>
              <select className="select" value={f.sucursalId} onChange={e => setF({...f, sucursalId: e.target.value})}>
                {sucursales.length === 0 && <option value="">Cargando...</option>}
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfigUsuarios = () => {
  const [usuarios, setUsuarios] = useState([
    { id: '1', nombre: 'Alejandro Ramos', email: 'alejandro.ramos@casaruiz.mx', rol: 'ADMINISTRADOR', sucursal: { nombre: 'Tamazula' }, activo: true, lastLogin: null },
    { id: '2', nombre: 'Sofía Lerma',     email: 'sofia.lerma@casaruiz.mx',     rol: 'EJECUTIVO_CRM', sucursal: { nombre: 'Tamazula' }, activo: true, lastLogin: null },
    { id: '3', nombre: 'Diego Vargas',    email: 'diego.vargas@casaruiz.mx',    rol: 'CREDITO',       sucursal: { nombre: 'Ciudad Guzmán' }, activo: true, lastLogin: null },
    { id: '4', nombre: 'Carmen Olvera',   email: 'carmen.olvera@casaruiz.mx',   rol: 'COBRANZA',      sucursal: { nombre: 'Tepatitlán' }, activo: true, lastLogin: null },
    { id: '5', nombre: 'Luis Fernández',  email: 'luis.fernandez@casaruiz.mx',  rol: 'SUPERVISOR',    sucursal: { nombre: 'GDL Norte' }, activo: false, lastLogin: null },
  ]);
  const [showInvitar, setShowInvitar] = useState(false);

  useEffect(() => {
    window.CRM_API.usuarios.getAll({ limit: 50 }).catch(() => null).then(r => {
      if (r?.data?.length) setUsuarios(r.data);
    });
  }, []);

  const fmtLogin = (dt) => {
    if (!dt) return '—';
    const diff = Date.now() - new Date(dt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    return `Hace ${Math.floor(hrs / 24)} días`;
  };

  return (
  <>
    <div className="card-head"><h3>Usuarios ({usuarios.length})</h3>
      <button className="btn btn-accent btn-sm" onClick={() => setShowInvitar(true)}><Icon name="plus" size={13}/> Invitar usuario</button>
    </div>
    <table className="tbl">
      <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Sucursal</th><th>Estado</th><th>Último acceso</th></tr></thead>
      <tbody>
        {usuarios.map(u => (
          <tr key={u.id}>
            <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.nombre} size={28}/><span className="cell-strong">{u.nombre}</span></div></td>
            <td style={{ color: 'var(--ink-500)' }}>{u.email}</td>
            <td><span className="badge b-blue">{ROL_LABELS[u.rol] || u.rol}</span></td>
            <td>{u.sucursal?.nombre || '—'}</td>
            <td><span className={'badge ' + (u.activo ? 'b-grn' : 'b-gray')}><span className="dot"></span>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td style={{ color: 'var(--ink-500)' }}>{fmtLogin(u.lastLogin)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {showInvitar && (
      <NuevoUsuarioModal
        onClose={() => setShowInvitar(false)}
        onCreate={(u) => { setUsuarios(prev => [u, ...prev]); setShowInvitar(false); }}
      />
    )}
  </>
  );
};

const ConfigRoles = () => {
  const perms = ['Ver dashboard', 'Crear prospecto', 'Aprobar crédito', 'Editar scoring', 'Acceso a cobranza', 'Reportes ejecutivos', 'Configuración'];
  const roles = [
    ['Administrador',  [1,1,1,1,1,1,1]],
    ['Supervisor',     [1,1,1,0,1,1,0]],
    ['Ejecutivo CRM',  [1,1,0,0,0,0,0]],
    ['Crédito',        [1,0,1,1,0,0,0]],
    ['Cobranza',       [1,0,0,0,1,0,0]],
  ];
  return (
    <>
      <div className="card-head"><h3>Roles y permisos</h3>
        <span title="Próxima versión · gestión de roles avanzada" style={{ display: 'inline-flex' }}>
          <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}><Icon name="plus" size={13}/> Nuevo rol</button>
        </span>
      </div>
      <div style={{ padding: 16, overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 600 }}>
          <thead>
            <tr><th>Permiso</th>{roles.map(([r]) => <th key={r} style={{ textAlign: 'center' }}>{r}</th>)}</tr>
          </thead>
          <tbody>
            {perms.map((p, i) => (
              <tr key={p}>
                <td><b>{p}</b></td>
                {roles.map(([r, vals]) => (
                  <td key={r} style={{ textAlign: 'center' }}>
                    {vals[i]
                      ? <span style={{ width: 22, height: 22, borderRadius: 50, background: 'var(--verde-100)', color: '#0f7d56', display: 'inline-grid', placeItems: 'center' }}><Icon name="check" size={13}/></span>
                      : <span style={{ width: 22, height: 22, borderRadius: 50, background: 'var(--ink-100)', color: 'var(--ink-400)', display: 'inline-grid', placeItems: 'center' }}><Icon name="x" size={11}/></span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const ConfigReglas = () => (
  <>
    <div className="card-head"><h3>Reglas de scoring</h3><span className="badge b-turq">Editable por admin</span></div>
    <div className="card-pad">
      <p style={{ color: 'var(--ink-500)', fontSize: 13, marginBottom: 16 }}>Ajusta puntajes por variable. El cambio aplica a evaluaciones futuras; las pasadas conservan su histórico.</p>
      {[
        ['Buró de crédito', [['750+', 50], ['700-749', 40], ['600-699', 30], ['500-599', 20], ['<500', 5]]],
        ['Vivienda',        [['Propia', 30], ['Familiar', 22], ['Rentada', 15]]],
        ['Salario',         [['+$20k', 10], ['$17k-$19k', 8], ['$15k-$16k', 6], ['$13k-$14k', 4], ['-$12k', 2]]],
      ].map(([cat, rows]) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: 'var(--azul)', marginBottom: 8 }}>{cat}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {rows.map(([lbl, pts]) => (
              <div key={lbl} style={{ padding: 10, background: 'var(--ink-50)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{lbl}</div>
                <div style={{ fontFamily: 'Elza', fontWeight: 800, fontSize: 18, color: 'var(--azul)' }}>{pts}<span style={{ fontSize: 10, color: 'var(--ink-400)', marginLeft: 2 }}>pts</span></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
);

const ConfigSucursales = () => (
  <>
    <div className="card-head"><h3>Sucursales</h3>
      <span title="Próxima versión · POST /sucursales" style={{ display: 'inline-flex' }}>
        <button className="btn btn-accent btn-sm" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}><Icon name="plus" size={13}/> Nueva sucursal</button>
      </span>
    </div>
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {SUCURSALES.map(s => (
        <div key={s.id} style={{ padding: 16, border: '1px solid var(--ink-100)', borderRadius: 12, display: 'flex', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--azul-100)', color: 'var(--azul)', display: 'grid', placeItems: 'center' }}><Icon name="pin" size={20}/></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--azul)' }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{s.region}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--ink-500)' }}>
              <span><b style={{ color: 'var(--azul)' }}>14</b> usuarios</span>
              <span><b style={{ color: 'var(--azul)' }}>842</b> clientes</span>
              <span><b style={{ color: 'var(--azul)' }}>{money(12000000)}</b> cartera</span>
            </div>
          </div>
          <span title={`Próxima versión · PUT /sucursales/:id`} style={{ display: 'inline-flex' }}>
            <button className="btn btn-light btn-sm" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}><Icon name="edit" size={12}/></button>
          </span>
        </div>
      ))}
    </div>
  </>
);

const ConfigBranding = () => (
  <>
    <div className="card-head"><h3>Branding</h3></div>
    <div className="card-pad">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: 18, background: 'var(--azul)', borderRadius: 12, display: 'grid', placeItems: 'center', minHeight: 120 }}>
          <img src="assets/logo-blanco.png" style={{ height: 56, objectFit: 'contain' }}/>
        </div>
        <div style={{ padding: 18, background: '#fff', border: '1px solid var(--ink-100)', borderRadius: 12, display: 'grid', placeItems: 'center', minHeight: 120 }}>
          <img src="assets/logo-azul.png" style={{ height: 56, objectFit: 'contain' }}/>
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Paleta corporativa</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
        {[['#02356e','Azul Casa Ruiz'],['#08b1bc','Turquesa'],['#ff9600','Naranja'],['#ff6000','Rojo acción']].map(([c,n]) => (
          <div key={c} style={{ border: '1px solid var(--ink-100)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: c, height: 70 }}></div>
            <div style={{ padding: 10, fontSize: 12 }}>
              <div style={{ fontWeight: 600 }}>{n}</div>
              <div style={{ color: 'var(--ink-500)', fontSize: 11 }}>{c}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Tipografía</div>
      <div style={{ marginTop: 10, padding: 18, border: '1px solid var(--ink-100)', borderRadius: 12 }}>
        <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 32, color: 'var(--azul)' }}>Elza Black · Display</div>
        <div style={{ fontFamily: 'ElzaText', fontWeight: 500, fontSize: 16, color: 'var(--ink-700)', marginTop: 6 }}>Elza Text Medium · cuerpo y UI · 14-16pt</div>
      </div>
    </div>
  </>
);

// FIX: toggles con estado real (antes eran visuales estáticos)
const Toggle = ({ on, onChange, disabled = false }) => (
  <div
    onClick={() => !disabled && onChange(!on)}
    role="switch"
    aria-checked={on}
    style={{
      width: 40, height: 22,
      background: on ? 'var(--turquesa)' : 'var(--ink-200)',
      borderRadius: 999, padding: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background .2s',
      opacity: disabled ? 0.5 : 1,
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 18, height: 18, background: '#fff', borderRadius: 50,
      transform: on ? 'translateX(18px)' : 'translateX(0)',
      transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
    }}></div>
  </div>
);

const SISTEMA_SETTINGS_INIT = [
  { key: 'notif',    name: 'Notificaciones push',            desc: 'Notifica cambios de estatus en créditos y cobranza',    on: true  },
  { key: 'auto',     name: 'Decisión automática de crédito', desc: 'Aprueba/rechaza por scoring sin intervención manual',   on: true  },
  { key: 'dark',     name: 'Modo oscuro',                    desc: 'Activa tema oscuro para todo el equipo',                on: false },
  { key: 'sync',     name: 'Sincronización con punto de venta', desc: 'Conexión en tiempo real con sistema de cajas',       on: true  },
  { key: 'mora',     name: 'Alertas de mora >30 días',       desc: 'Envía SMS/Whatsapp automático',                        on: true  },
  { key: 'twofa',   name: 'Doble autenticación',             desc: 'Obliga 2FA para roles Admin y Supervisor',             on: false },
];

const ConfigSistema = () => {
  const [settings, setSettings] = useState(SISTEMA_SETTINGS_INIT);
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSettings(s => s.map(x => x.key === key ? { ...x, on: !x.on } : x));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: conectar a API /config/sistema cuando backend esté listo
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="card-head">
        <h3>Sistema</h3>
        <button className="btn btn-accent btn-sm" onClick={handleSave}>
          {saved ? <><Icon name="check" size={13}/> Guardado</> : <><Icon name="settings" size={13}/> Guardar cambios</>}
        </button>
      </div>
      <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {settings.map(({ key, name, desc, on }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--ink-50)', borderRadius: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{desc}</div>
            </div>
            <Toggle on={on} onChange={() => toggle(key)}/>
          </div>
        ))}
      </div>
    </>
  );
};

Object.assign(window, { Cobranza, Reportes, Config });
