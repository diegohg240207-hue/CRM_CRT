// ============== LOGIN ==============
const Login = ({ onLogin }) => {
  const [suc, setSuc] = useState(SUCURSALES[0]);
  const [showSuc, setShowSuc] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email.trim() || !pwd.trim()) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await window.CRM_API.auth.login(email.trim(), pwd, suc?.id || null);
      if (result?.user) {
        onLogin(
          { ...result.user, name: result.user.nombre, role: result.user.rol },
          suc,
        );
      } else {
        setError('Credenciales incorrectas. Intenta de nuevo.');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('inválid') || msg.includes('401') || msg.includes('Credenciales')) {
        setError('Correo o contraseña incorrectos.');
      } else if (msg.includes('429') || msg.includes('Too Many')) {
        setError('Demasiados intentos. Espera 5 minutos antes de volver a intentarlo.');
      } else {
        setError('No se pudo conectar al servidor. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  // quickLogin solo disponible en desarrollo (NODE_ENV !== 'production')
  const quickLogin = null;

  return (
    <div className="login-shell">
      <div className="login-art">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 12, display: 'grid', placeItems: 'center' }}>
            <img src="assets/icono.png" style={{ width: 32, height: 32, objectFit: 'contain' }}/>
          </div>
          <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 18, letterSpacing: '.04em' }}>
            CASA RUIZ
            <div style={{ fontSize: 10, color: 'var(--turquesa)', letterSpacing: '.18em', marginTop: 2 }}>DE TAMAZULA · 1956</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', maxWidth: 460 }}>
          <h1 style={{ color: '#fff', fontSize: 38, lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em' }}>
            La plataforma comercial<br/>
            <span style={{ color: 'var(--turquesa)' }}>de Casa Ruiz</span>.
          </h1>
          <p style={{ color: '#a9bcd5', fontSize: 15, lineHeight: 1.55, marginBottom: 30 }}>
            Prospectos, créditos y cobranza en un solo lugar. Diseñado para tu equipo en sucursal, oficina y campo.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['1,245', 'Créditos activos'],
              ['82%', 'Aprobación promedio'],
              ['$48.2M', 'Cartera dispuesta'],
              ['4', 'Sucursales conectadas'],
            ].map(([n, l], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 22, color: '#fff' }}>{n}</div>
                <div style={{ color: '#9fb4cf', fontSize: 12, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: '#9fb4cf', fontSize: 12 }}>
          © 2026 Casa Ruiz de Tamazula · Versión interna 2.4
        </div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h2 style={{ fontSize: 26, color: 'var(--azul)', marginBottom: 6 }}>Iniciar sesión</h2>
          <p style={{ color: 'var(--ink-500)', marginBottom: 28, fontSize: 14 }}>Bienvenido de vuelta. Ingresa tus credenciales.</p>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Correo corporativo</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="tu@casaruiz.mx"
              autoComplete="email"
              required
            />
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Contraseña</label>
            <input
              className="input"
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="field" style={{ marginBottom: 18 }}>
            <label>Sucursal</label>
            <button
              type="button"
              className="input"
              style={{ display: 'flex', alignItems: 'center', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setShowSuc(true)}
            >
              <span style={{ width: 8, height: 8, borderRadius: 50, background: 'var(--turquesa)', marginRight: 8 }}></span>
              <span style={{ flex: 1, fontSize: 13 }}>{suc.name}</span>
              <Icon name="down" size={14}/>
            </button>
          </div>

          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 14px', borderRadius: 8,
              background: 'var(--rojo-100, #fff0ee)', border: '1px solid var(--rojo, #e53e3e)',
              color: 'var(--rojo, #c53030)', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <Icon name="warn" size={14}/> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
            disabled={loading}
          >
            {loading
              ? <><span style={{ opacity: 0.7 }}>Verificando…</span></>
              : <>Entrar al sistema <Icon name="right" size={15}/></>
            }
          </button>
        </form>

        <SucursalPicker open={showSuc} current={suc} onPick={setSuc} onClose={() => setShowSuc(false)}/>
      </div>
    </div>
  );
};

// ============== DASHBOARD ==============
const Kpi = ({ icon, label, value, sub, color = 'var(--azul-100)', stroke = 'var(--azul)' }) => (
  <div className="kpi">
    <div className="kpi-top">
      <div className="kpi-icon" style={{ background: color, color: stroke }}><Icon name={icon} size={20}/></div>
      <div className="kpi-label">{label}</div>
    </div>
    <div className="kpi-val">{value}</div>
    <div className="kpi-foot">{sub}</div>
  </div>
);

// Simple SVG line chart
const LineChart = ({ data, height = 180, color = 'var(--azul)', fill = '#02356e22' }) => {
  const w = 600, pad = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const stepX = (w - pad * 2) / (data.length - 1);
  const yFor = v => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const pts = data.map((d, i) => `${pad + i * stepX},${yFor(d)}`).join(' ');
  const area = `${pad},${height - pad} ${pts} ${w - pad},${height - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }}>
      {[0,1,2,3].map(i => <line key={i} x1={pad} x2={w-pad} y1={pad + i*((height-pad*2)/3)} y2={pad + i*((height-pad*2)/3)} stroke="#eaeef5" strokeWidth="1"/>)}
      <polygon points={area} fill={fill}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => <circle key={i} cx={pad + i*stepX} cy={yFor(d)} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>)}
    </svg>
  );
};

const Sparkbars = ({ data, height = 60, color = 'var(--turquesa)' }) => {
  const w = 240, pad = 4, gap = 4;
  const bw = (w - pad * 2 - gap * (data.length - 1)) / data.length;
  const max = Math.max(...data);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const h = (d / max) * (height - pad * 2);
        return <rect key={i} x={pad + i*(bw+gap)} y={height - pad - h} width={bw} height={h} rx="2" fill={color}/>;
      })}
    </svg>
  );
};

const Donut = ({ segments, size = 140 }) => {
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eaeef5" strokeWidth="14"/>
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth="14" strokeDasharray={dash}
            strokeDashoffset={-offset} transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="round"/>;
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 22, color: 'var(--azul)' }}>{total}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>Total</div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  // ── Estado con fallback a mock data mientras el backend responde ─────────
  const [kpis, setKpis] = useState({
    prospectos_activos: 248, creditos_aprobados: 1245,
    tasa_aprobacion: 82, cartera_dispuesta: 48200000, mora_30_dias: 3.4,
  });
  const [monthData, setMonthData] = useState([220, 280, 310, 305, 360, 340, 410, 470, 440, 510, 560, 620]);
  const [riesgoData, setRiesgoData] = useState([
    { riesgo: 'Bajo',  count: 612 },
    { riesgo: 'Medio', count: 248 },
    { riesgo: 'Alto',  count:  84 },
  ]);
  const [topEjs, setTopEjs] = useState([
    { ejecutivo: 'Alejandro Ramos', creditos: 18, monto: 235000 },
    { ejecutivo: 'Diego Vargas',    creditos: 14, monto: 198000 },
    { ejecutivo: 'Sofía Lerma',     creditos: 11, monto: 142000 },
    { ejecutivo: 'Carmen Olvera',   creditos:  9, monto: 121000 },
  ]);

  useEffect(() => {
    Promise.all([
      window.CRM_API.reportes.getDashboard().catch(() => null),
      window.CRM_API.reportes.getOriginacion().catch(() => null),
      window.CRM_API.reportes.getRiesgo().catch(() => null),
      window.CRM_API.reportes.getEjecutivos().catch(() => null),
    ]).then(([d, o, r, e]) => {
      if (d) setKpis(prev => ({ ...prev, ...d }));
      if (o?.length) setMonthData(o.map(m => m.creditos));
      if (r?.length) setRiesgoData(r);
      if (e?.length) setTopEjs(e);
    });
  }, []);

  const weekBars = [12, 16, 8, 22, 18, 26, 24];
  const funnel = [
    { lbl: 'Prospectos',  n: kpis.prospectos_activos,                                         w: 100, c: 'var(--azul)' },
    { lbl: 'Contactados', n: Math.round(kpis.prospectos_activos * .77),                        w: 78,  c: 'var(--azul-600)' },
    { lbl: 'Calificados', n: Math.round(kpis.prospectos_activos * .54),                        w: 56,  c: 'var(--turquesa)' },
    { lbl: 'Solicitud',   n: Math.round(kpis.prospectos_activos * .35),                        w: 36,  c: 'var(--turquesa-600)' },
    { lbl: 'Cierre',      n: kpis.creditos_aprobados || Math.round(kpis.prospectos_activos * .21), w: 22, c: 'var(--naranja)' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buen día, {user.name.split(' ')[0]} 👋</h1>
          <div className="sub">Tu equipo en {user.role.toLowerCase()} originó 52 créditos esta semana. Aquí el panorama de hoy.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" title="Filtro de fecha — disponible con backend">
            <Icon name="cal" size={15}/> 27 Nov – 03 Dic
          </button>
          <button className="btn btn-ghost" title="Filtrar por sucursal — disponible con backend">
            <Icon name="filter" size={15}/> Sucursal
          </button>
          <span title="Próxima versión · requiere integración con motor de análisis IA" style={{ display: 'inline-flex' }}>
            <button className="btn btn-accent" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}>
              <Icon name="sparkle" size={15}/> Resumen IA
            </button>
          </span>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="users" label="Prospectos activos"
          value={kpis.prospectos_activos.toLocaleString('es-MX')}
          color="var(--azul-100)" stroke="var(--azul)"
          sub={<><span className="delta-up">▲ 18%</span> vs sem. pasada</>}/>
        <Kpi icon="check" label="Créditos aprobados"
          value={kpis.creditos_aprobados.toLocaleString('es-MX')}
          color="var(--turquesa-100)" stroke="var(--turquesa-600)"
          sub={<><span className="delta-up">▲ {kpis.tasa_aprobacion}%</span> tasa aprobación</>}/>
        <Kpi icon="trend" label="Cartera dispuesta"
          value={money(kpis.cartera_dispuesta || 48200000)}
          color="var(--naranja-100)" stroke="#b56600"
          sub={<><span className="delta-up">▲ 8%</span> · 58% capacidad</>}/>
        <Kpi icon="warn" label="Mora &gt;30 días"
          value={(kpis.mora_30_dias ?? 3.4).toFixed(1) + '%'}
          color="var(--rojo-100)" stroke="#c64400"
          sub={<><span className="delta-dn">▼ 0.6 pts</span> · saludable</>}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <h3>Originación de crédito · últimos 12 meses</h3>
            <div className="right">
              <span className="badge b-blue"><span className="dot"></span> Aprobados</span>
              <span className="badge b-org"><span className="dot"></span> Rechazados</span>
              <button className="btn btn-light btn-sm">Mes <Icon name="down" size={12}/></button>
            </div>
          </div>
          <div className="card-pad">
            <LineChart data={monthData} height={220} color="var(--azul)" fill="rgba(2,53,110,.08)"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-500)', fontSize: 11, marginTop: 4, padding: '0 24px' }}>
              {['Dic','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Embudo comercial</h3>
            <button className="btn btn-light btn-sm">7 días</button>
          </div>
          <div className="card-pad">
            {funnel.map((f, i) => (
              <div key={i} className="funnel-row">
                <div className="flbl">{f.lbl}</div>
                <div className="fbar" style={{ background: 'var(--ink-100)' }}>
                  <div style={{ width: `${f.w}%`, background: f.c }}></div>
                </div>
                <div className="fnum">{f.n}</div>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--turquesa-50)', borderRadius: 10, fontSize: 12, color: 'var(--turquesa-600)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="sparkle" size={14}/>
              <span><b>Conversión global: 21%</b> · +3 pts vs semana pasada</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-head"><h3>Distribución de riesgo</h3></div>
          <div className="card-pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut size={130} segments={riesgoData.map((r, i) => ({ value: r.count, color: ['#1aa873','#f5b400','#ff6000'][i] }))}/>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {riesgoData.map((r, i) => [r.riesgo, r.count, ['#1aa873','#f5b400','#ff6000'][i]]).map(([l, n, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 50, background: c }}></span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{l}</span>
                  <span style={{ fontFamily: 'Elza', fontWeight: 700, color: 'var(--azul)' }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Top ejecutivos · semana</h3></div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topEjs.map(({ ejecutivo: n, creditos: ops, monto: mt }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 22, fontFamily: 'Elza', fontWeight: 700, color: i === 0 ? 'var(--naranja)' : 'var(--ink-400)' }}>#{i+1}</span>
                <Avatar name={n} size={28}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n}</div>
                  <div style={{ color: 'var(--ink-500)', fontSize: 11 }}>{ops} ops · {money(mt)}</div>
                </div>
                <div style={{ width: 80, height: 6, background: 'var(--ink-100)', borderRadius: 3 }}>
                  <div style={{ width: `${(ops / Math.max(...topEjs.map(e => e.creditos), 1)) * 100}%`, height: '100%', background: 'var(--turquesa)', borderRadius: 3 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Alertas operativas</h3><span className="badge b-red">7 nuevas</span></div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { c: 'var(--rojo)', i: 'warn', t: 'Carlos Méndez · pago vencido 2 días', s: 'Hace 1h' },
              { c: 'var(--naranja)', i: 'cards', t: 'Solicitud P-1041 espera documentación', s: 'Hace 2h' },
              { c: 'var(--turquesa-600)', i: 'sparkle', t: 'Patricia Holguín elegible para subir línea a $65k', s: 'Hace 3h' },
              { c: 'var(--azul)', i: 'cal', t: 'Cita Jorge Salas mañana 11:00 AM', s: 'Hoy 9:30' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, background: 'var(--ink-50)' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: '#fff', display: 'grid', placeItems: 'center', color: a.c, flexShrink: 0 }}>
                  <Icon name={a.i} size={15}/>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-700)' }}>{a.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 2 }}>{a.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <h3>Actividad reciente</h3>
            {/* PENDIENTE BACKEND: listar audit logs completos */}
            <button className="btn btn-light btn-sm" title="Ver historial completo — disponible con backend">Ver todo</button>
          </div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { a: 'Alejandro Ramos', v: 'aprobó crédito a', t: 'María González · $22,400', tm: '10:30 AM', c: 'var(--verde)', ic: 'check' },
              { a: 'Sofía Lerma',     v: 'registró prospecto', t: 'Lucero Núñez · Refri LG 14p', tm: '10:14 AM', c: 'var(--turquesa-600)', ic: 'plus' },
              { a: 'Diego Vargas',    v: 'evaluó scoring de', t: 'Ricardo Mendoza · 82 pts · Aprobado', tm: '09:51 AM', c: 'var(--azul)', ic: 'gauge' },
              { a: 'Carmen Olvera',   v: 'inició cobranza con', t: 'Jorge Salas · vencido 5 días', tm: '09:32 AM', c: 'var(--naranja)', ic: 'phone' },
              { a: 'María Gutiérrez', v: 'aprobó aumento de línea para',     t: 'Estela Rivas · $9,800 → $14,000', tm: '08:55 AM', c: 'var(--verde)', ic: 'trend' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar name={e.a} size={32}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>
                    <b style={{ color: 'var(--azul)' }}>{e.a}</b> <span style={{ color: 'var(--ink-500)' }}>{e.v}</span> <b>{e.t}</b>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 3 }}>{e.tm} · {SUCURSALES[0].name}</div>
                </div>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--ink-50)', color: e.c, display: 'grid', placeItems: 'center' }}>
                  <Icon name={e.ic} size={13}/>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Originación del mes</h3></div>
          <div className="card-pad">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 30, color: 'var(--azul)' }}>$12.4M</span>
              <span style={{ color: 'var(--ink-500)', fontSize: 13 }}>de $13.5M capacidad</span>
            </div>
            <div className="progress" style={{ height: 12 }}>
              <div style={{ width: '92%', background: 'linear-gradient(90deg, var(--turquesa), var(--azul))' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--ink-500)' }}>
              <span>92% completado</span>
              <span><b style={{ color: 'var(--verde)' }}>+$420k</b> vs mes pasado</span>
            </div>

            <div style={{ marginTop: 18, fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Por sucursal</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Tamazula',         95, 'var(--turquesa)'],
                ['Ciudad Guzmán',    88, 'var(--azul)'],
                ['Tepatitlán',       72, 'var(--naranja)'],
                ['GDL Norte',        81, 'var(--azul-600)'],
              ].map(([n, p, c]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 92, fontSize: 12, fontWeight: 600 }}>{n}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--ink-100)', borderRadius: 3 }}>
                    <div style={{ width: `${p}%`, height: '100%', background: c, borderRadius: 3 }}></div>
                  </div>
                  <span style={{ width: 38, textAlign: 'right', fontFamily: 'Elza', fontWeight: 700, fontSize: 12, color: 'var(--azul)' }}>{p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { Login, Dashboard, Kpi, LineChart, Donut, Sparkbars });
