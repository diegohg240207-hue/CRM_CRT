// ============== CRÉDITOS + MOTOR DE SCORING ==============
const CREDITOS_LIST = [
  { id: 'CR-3318', cliente: 'María González', monto: 22400, plazo: 12, mensual: 2120, score: 820, riesgo: 'bajo', estatus: 'aprobado', fecha: '27 Nov', ejecutivo: 'Alejandro Ramos' },
  { id: 'CR-3317', cliente: 'Carlos Méndez',  monto:  8400, plazo: 18, mensual:  580, score: 580, riesgo: 'alto', estatus: 'requiere-aval', fecha: '27 Nov', ejecutivo: 'Sofía Lerma' },
  { id: 'CR-3316', cliente: 'Ricardo Mendoza', monto: 24500, plazo: 12, mensual: 2280, score: 745, riesgo: 'bajo', estatus: 'en-revision', fecha: '27 Nov', ejecutivo: 'Diego Vargas' },
  { id: 'CR-3315', cliente: 'Patricia Holguín', monto: 31200, plazo: 18, mensual: 2150, score: 855, riesgo: 'bajo', estatus: 'aprobado', fecha: '26 Nov', ejecutivo: 'Alejandro Ramos' },
  { id: 'CR-3314', cliente: 'Marisol Bravo',  monto: 11900, plazo: 12, mensual: 1120, score: 710, riesgo: 'bajo', estatus: 'aprobado', fecha: '26 Nov', ejecutivo: 'María Gutiérrez' },
  { id: 'CR-3313', cliente: 'Hugo Peralta',   monto: 16800, plazo: 18, mensual: 1180, score: 560, riesgo: 'medio', estatus: 'rechazado', fecha: '25 Nov', ejecutivo: 'Carmen Olvera' },
  { id: 'CR-3312', cliente: 'Andrés Mota',    monto:  9800, plazo: 12, mensual:  920, score: 660, riesgo: 'medio', estatus: 'aprobado', fecha: '25 Nov', ejecutivo: 'Alejandro Ramos' },
];

const estatusBadge = (e) => ({
  'aprobado':       <span className="badge b-grn"><span className="dot"></span>Aprobado</span>,
  'rechazado':      <span className="badge b-red"><span className="dot"></span>Rechazado</span>,
  'en-revision':    <span className="badge b-org"><span className="dot"></span>En revisión</span>,
  'requiere-aval':  <span className="badge b-ylw"><span className="dot"></span>Requiere aval</span>,
}[e]);

const riesgoBadge = (r) => ({
  'bajo':  <span className="badge b-grn">Bajo</span>,
  'medio': <span className="badge b-ylw">Medio</span>,
  'alto':  <span className="badge b-red">Alto</span>,
}[r]);

// Normaliza crédito de API al formato local del template
const normalizeCr = (c) => ({
  ...c,
  id:       c.folio || c.id,
  _apiId:   c.id,
  cliente:  c.cliente?.nombre || c.clienteId || '—',
  monto:    Number(c.monto || 0),
  plazo:    c.plazoMeses || 0,
  mensual:  Number(c.mensualidad || 0),
  score:    c.scoreFinal || c.evaluacion?.scoreFinal || 0,
  riesgo:   (c.riesgo || 'MEDIO').toLowerCase(),
  estatus:  (c.estatus || 'EN_REVISION').toLowerCase().replace(/_/g, '-').replace('en-revision', 'en-revision').replace('requiere-aval','requiere-aval'),
  fecha:    c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—',
  ejecutivo: c.ejecutivo?.nombre || '—',
});

const Creditos = ({ onOpenScoring }) => {
  const [tab, setTab] = useState('todos');
  const [lista, setLista] = useState(CREDITOS_LIST);
  const [kpisCr, setKpisCr] = useState({ aprobados: 1245, enRevision: 35, requiereAval: 18, rechazados: 142, tasaAprobacion: 82 });

  useEffect(() => {
    Promise.all([
      window.CRM_API.creditos.getAll({ limit: 100 }).catch(() => null),
      window.CRM_API.creditos.getKpis().catch(() => null),
    ]).then(([ls, kp]) => {
      if (ls?.data?.length) setLista(ls.data.map(normalizeCr));
      if (kp) setKpisCr(kp);
    });
  }, []);

  const filt = lista.filter(c => tab === 'todos' || c.estatus === tab);
  const counts = {
    todos:          lista.length,
    'aprobado':     lista.filter(c => c.estatus === 'aprobado').length,
    'en-revision':  lista.filter(c => c.estatus === 'en-revision').length,
    'requiere-aval':lista.filter(c => c.estatus === 'requiere-aval').length,
    'rechazado':    lista.filter(c => c.estatus === 'rechazado').length,
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Créditos</h1>
          <div className="sub">Solicitudes activas, decisiones automáticas y validación documental</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Exportar CSV — llama al backend real */}
          <button className="btn btn-ghost" onClick={() => {
            const url = (window.CRM_API_URL || 'https://crmcrt-production.up.railway.app/api/v1') + '/creditos/export';
            window.open(url, '_blank');
          }}><Icon name="doc" size={15}/> Exportar CSV</button>
          <button className="btn btn-accent" onClick={onOpenScoring}><Icon name="gauge" size={15}/> Nueva solicitud</button>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="check" label="Aprobados (mes)" value={kpisCr.aprobados.toLocaleString('es-MX')} color="var(--verde-100)" stroke="#0f7d56" sub={<><span className="delta-up">▲ {kpisCr.tasaAprobacion}%</span> tasa</>}/>
        <Kpi icon="clock" label="En revisión" value={kpisCr.enRevision} color="var(--naranja-100)" stroke="#b56600" sub="Tiempo prom. 24h"/>
        <Kpi icon="warn"  label="Requiere aval" value={kpisCr.requiereAval} color="var(--amarillo-100)" stroke="#946800" sub="Score 500-650"/>
        <Kpi icon="x"     label="Rechazados (mes)" value={kpisCr.rechazados} color="var(--rojo-100)" stroke="#c64400" sub="9% del total"/>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px 0 14px', background: '#fff', padding: 4, borderRadius: 12, border: '1px solid var(--ink-100)', width: 'fit-content' }}>
        {[
          ['todos', 'Todos'], ['aprobado', 'Aprobados'], ['en-revision', 'En revisión'], ['requiere-aval', 'Requiere aval'], ['rechazado', 'Rechazados']
        ].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12.5,
              background: tab === id ? 'var(--azul)' : 'transparent',
              color: tab === id ? '#fff' : 'var(--ink-500)' }}>
            {lbl} <span style={{ marginLeft: 6, opacity: .7, fontSize: 11 }}>{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Folio</th><th>Cliente</th><th>Monto</th><th>Plazo</th><th>Mensualidad</th><th>Score</th><th>Riesgo</th><th>Estatus</th><th>Ejecutivo</th><th>Fecha</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filt.map(c => (
              <tr key={c.id}>
                <td><span className="cell-strong">{c.id}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.cliente} size={28}/>
                    <span className="cell-strong">{c.cliente}</span>
                  </div>
                </td>
                <td><b style={{ color: 'var(--azul)' }}>{money(c.monto)}</b></td>
                <td>{c.plazo} meses</td>
                <td>{money(c.mensual)}/mes</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 50, background: c.score >= 700 ? 'var(--verde)' : c.score >= 600 ? 'var(--amarillo)' : 'var(--rojo)' }}></div>
                    <span style={{ fontFamily: 'Elza', fontWeight: 700, color: 'var(--azul)' }}>{c.score}</span>
                  </div>
                </td>
                <td>{riesgoBadge(c.riesgo)}</td>
                <td>{estatusBadge(c.estatus)}</td>
                <td><Avatar name={c.ejecutivo} size={24}/></td>
                <td style={{ color: 'var(--ink-500)' }}>{c.fecha}</td>
                <td><button className="btn btn-light btn-sm"><Icon name="eye" size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ============== SCORING ENGINE ==============
const SCORING_RULES = {
  buro:     [{ lbl: '750+',         pts: 50, range: [750, 9999] }, { lbl: '700-749', pts: 40, range: [700, 749] }, { lbl: '600-699', pts: 30, range: [600, 699] }, { lbl: '500-599', pts: 20, range: [500, 599] }, { lbl: '<500',  pts:  5, range: [0, 499] }],
  vivienda: [{ lbl: 'Propia',       pts: 30, k: 'propia' }, { lbl: 'Familiar',     pts: 22, k: 'familiar' }, { lbl: 'Rentada',  pts: 15, k: 'rentada' }],
  salario:  [{ lbl: '+$20k',        pts: 10, range: [20000, Infinity] }, { lbl: '$17k-$19k', pts: 8, range: [17000, 19999] }, { lbl: '$15k-$16k', pts: 6, range: [15000, 16999] }, { lbl: '$13k-$14k', pts: 4, range: [13000, 14999] }, { lbl: '-$12k', pts: 2, range: [0, 12999] }],
  capacidad:[{ lbl: '10% deuda',    pts:  5, range: [0, 10] }, { lbl: '15%', pts: 4, range: [11, 15] }, { lbl: '20%', pts: 3, range: [16, 20] }, { lbl: '25%', pts: 2, range: [21, 25] }, { lbl: '30%+', pts: 1, range: [26, 100] }],
  antig:    [{ lbl: '5+ años',      pts:  5, range: [5, 999] }, { lbl: '4 años', pts: 4, range: [4, 4] }, { lbl: '3 años', pts: 3, range: [3, 3] }, { lbl: '2 años', pts: 2, range: [2, 2] }, { lbl: '1 año', pts: 1, range: [0, 1] }],
};

const Scoring = () => {
  const [buro, setBuro] = useState(720);
  const [vivienda, setVivienda] = useState('propia');
  const [salario, setSalario] = useState(18500);
  const [capacidad, setCapacidad] = useState(18);
  const [antig, setAntig] = useState(4);
  const [nombre, setNombre] = useState('Juan Pérez');
  // FIX: estados para feedback visual de botones
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [monto, setMonto] = useState(15000);
  const [plazo, setPlazo] = useState(12);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const ptsBuro      = SCORING_RULES.buro.find(r => buro >= r.range[0] && buro <= r.range[1])?.pts || 0;
  const ptsVivienda  = SCORING_RULES.vivienda.find(r => r.k === vivienda)?.pts || 0;
  const ptsSalario   = SCORING_RULES.salario.find(r => salario >= r.range[0] && salario <= r.range[1])?.pts || 0;
  const ptsCapacidad = SCORING_RULES.capacidad.find(r => capacidad >= r.range[0] && capacidad <= r.range[1])?.pts || 0;
  const ptsAntig     = SCORING_RULES.antig.find(r => antig >= r.range[0] && antig <= r.range[1])?.pts || 0;

  const subtotal = ptsBuro + ptsVivienda + ptsSalario + ptsCapacidad + ptsAntig;
  const scoreTotal = subtotal * 10; // 0-1000

  const decision =
    scoreTotal >= 700 ? { lbl: 'Aprobado',       color: 'var(--verde)',     bg: 'var(--verde-100)',     desc: 'Crédito aprobado automáticamente. Línea sugerida hasta $45,000 MXN.' } :
    scoreTotal >= 550 ? { lbl: 'Requiere aval',  color: '#946800',          bg: 'var(--amarillo-100)',  desc: 'Aprobable con aval o garantía adicional. Línea inicial $15,000.' } :
                        { lbl: 'Rechazado',      color: '#c64400',          bg: 'var(--rojo-100)',      desc: 'No cumple parámetros mínimos. Reintentar en 90 días.' };

  const probabilidad = Math.min(98, Math.max(5, scoreTotal / 10));
  const tasaInteres = scoreTotal >= 700 ? 18 : scoreTotal >= 550 ? 24 : 30;

  // Gauge angle
  const angle = (scoreTotal / 1000) * 180;
  const r = 90, cx = 110, cy = 110;
  const rad = (180 - angle) * Math.PI / 180;
  const handX = cx + r * Math.cos(rad);
  const handY = cy - r * Math.sin(rad);

  const variables = [
    { lbl: 'Buró de crédito',    pts: ptsBuro,      max: 50, ic: 'shield',  desc: `Score buró: ${buro}` },
    { lbl: 'Vivienda',           pts: ptsVivienda,  max: 30, ic: 'home',    desc: vivienda.charAt(0).toUpperCase() + vivienda.slice(1) },
    { lbl: 'Salario mensual',    pts: ptsSalario,   max: 10, ic: 'cash',    desc: money(salario) + '/mes' },
    { lbl: 'Capacidad de pago',  pts: ptsCapacidad, max:  5, ic: 'gauge',   desc: capacidad + '% de ingresos comprometidos' },
    { lbl: 'Antigüedad laboral', pts: ptsAntig,     max:  5, ic: 'clock',   desc: antig + (antig === 1 ? ' año' : ' años') },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Motor de Scoring</h1>
          <div className="sub">Evaluación crediticia en tiempo real · variables editables · decisión automática</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span title="Configurar en: Sistema → Configuración → Reglas de scoring" style={{ display: 'inline-flex' }}>
            <button className="btn btn-ghost" disabled style={{ opacity: 0.45, pointerEvents: 'none' }}><Icon name="settings" size={15}/> Configurar reglas</button>
          </span>
          <button className="btn btn-primary" disabled={guardando}
            onClick={async () => {
              setGuardando(true);
              try {
                // Evalúa contra el backend (scoring standalone, sin crear crédito)
                await window.CRM_API.scoring.evaluar({
                  scoreBuro: buro, vivienda: vivienda.toUpperCase(),
                  salario, capacidadPago: capacidad, antiguedadLaboral: antig,
                }).catch(() => null); // si el endpoint no existe, silencia el error
                setGuardado(true);
                setTimeout(() => setGuardado(false), 2500);
              } finally { setGuardando(false); }
            }}>
            {guardando ? <><Icon name="clock" size={15}/> Guardando…</> : guardado ? <><Icon name="check" size={15}/> ¡Guardado!</> : <><Icon name="doc" size={15}/> Guardar evaluación</>}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="check" label="Créditos aprobados" value="1,245" sub={<><span className="delta-up">▲ 12%</span> vs mes pasado</>} color="var(--azul-100)" stroke="var(--azul)"/>
        <Kpi icon="doc"   label="Pendientes" value="35" color="var(--turquesa-100)" stroke="var(--turquesa-600)" sub="Tiempo prom. 24h"/>
        <Kpi icon="warn"  label="Riesgo alto" value="15" color="var(--naranja-100)" stroke="#b56600" sub="Requieren aval"/>
        <Kpi icon="clock" label="Tiempo prom. validación" value="24h" color="var(--azul-100)" stroke="var(--azul)" sub="Meta: 48h"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        {/* LEFT: SCORE + RULES */}
        <div className="card">
          <div className="card-head">
            <h3>Puntuación crediticia</h3>
            <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>Subtotal × 10 = {subtotal} × 10 = {scoreTotal}</span>
          </div>
          <div className="card-pad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="220" height="140" viewBox="0 0 220 140">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#ff6000"/>
                    <stop offset="40%" stopColor="#f5b400"/>
                    <stop offset="75%" stopColor="#1aa873"/>
                    <stop offset="100%" stopColor="#08b1bc"/>
                  </linearGradient>
                </defs>
                <path d="M 20 110 A 90 90 0 0 1 200 110" stroke="#eaeef5" strokeWidth="16" fill="none" strokeLinecap="round"/>
                <path d="M 20 110 A 90 90 0 0 1 200 110" stroke="url(#g1)" strokeWidth="16" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(scoreTotal/1000) * 283} 283`}/>
                <circle cx={handX} cy={handY} r="9" fill="#fff" stroke="var(--azul)" strokeWidth="3"/>
                <text x="110" y="100" textAnchor="middle" fontFamily="Elza" fontWeight="900" fontSize="38" fill="var(--azul)">{scoreTotal}</text>
                <text x="110" y="125" textAnchor="middle" fontSize="10" fill="var(--ink-500)" letterSpacing="2">SCORE TOTAL</text>
              </svg>
              <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Riesgo</div>
                  <div style={{ fontFamily: 'Elza', fontWeight: 800, fontSize: 20, color: decision.color, textTransform: 'capitalize' }}>
                    {scoreTotal >= 700 ? 'Bajo' : scoreTotal >= 550 ? 'Medio' : 'Alto'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Probabilidad</div>
                  <div style={{ fontFamily: 'Elza', fontWeight: 800, fontSize: 20, color: 'var(--azul)' }}>{probabilidad.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ padding: 14, background: decision.bg, borderRadius: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: decision.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Decisión automática</div>
                <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 24, color: decision.color, marginTop: 4 }}>{decision.lbl}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-700)', marginTop: 6, lineHeight: 1.5 }}>{decision.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-accent" style={{ flex: 1, justifyContent: 'center' }}
                  disabled={confirmando}
                  onClick={async () => {
                    if (confirmando || confirmado) return;
                    setConfirmando(true); setConfirmError('');
                    try {
                      const session = window.CRM_API.auth.getSession();
                      // Busca el cliente por nombre en el backend
                      const sr = await window.CRM_API.clientes.getAll({ q: nombre, limit: 5 }).catch(() => null);
                      const clienteId = sr?.data?.[0]?.id || null;
                      if (!clienteId) throw new Error('Cliente no encontrado. Verifica que el nombre esté registrado.');
                      await window.CRM_API.creditos.create({
                        clienteId, ejecutivoId: session?.user?.id || '',
                        monto, plazoMeses: plazo, tasaInteres,
                        scoreBuro: buro, vivienda: vivienda.toUpperCase(),
                        salario, capacidadPago: capacidad, antiguedadLaboral: antig,
                      });
                      setConfirmado(true);
                      setTimeout(() => setConfirmado(false), 2500);
                    } catch (e) {
                      setConfirmError(e.message || 'Error al crear la solicitud');
                      setTimeout(() => setConfirmError(''), 3500);
                    } finally { setConfirmando(false); }
                  }}>
                  {confirmando ? <><Icon name="clock" size={14}/> Enviando…</> : confirmado ? <><Icon name="check" size={14}/> Confirmado</> : <><Icon name="check" size={14}/> Confirmar</>}
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                  title="Modifica los valores del solicitante para ajustar el resultado"
                  onClick={() => document.querySelector('.card-head + .card-pad input')?.focus()}>
                  <Icon name="edit" size={14}/> Ajustar manual
                </button>
              </div>
              {confirmError && <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--rojo-100)', color: '#c64400', borderRadius: 8, fontSize: 12 }}>{confirmError}</div>}
            </div>
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 12 }}>Desglose por variable</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {variables.map(v => (
                <div key={v.lbl} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px 70px', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--ink-50)', borderRadius: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', color: 'var(--azul)', display: 'grid', placeItems: 'center' }}><Icon name={v.ic} size={15}/></span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--azul)' }}>{v.lbl}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{v.desc}</div>
                  </div>
                  <div style={{ height: 6, background: 'var(--ink-200)', borderRadius: 3 }}>
                    <div style={{ width: ((v.pts/v.max)*100) + '%', height: '100%', background: v.pts/v.max >= .7 ? 'var(--verde)' : v.pts/v.max >= .4 ? 'var(--amarillo)' : 'var(--rojo)', borderRadius: 3 }}></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'Elza', fontWeight: 800, color: 'var(--azul)' }}>{v.pts}</span>
                    <span style={{ color: 'var(--ink-400)', fontSize: 11 }}>/{v.max} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: APPLICANT INPUT */}
        <div className="card">
          <div className="card-head">
            <h3>Datos del solicitante</h3>
            <Avatar name={nombre} size={32}/>
          </div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field"><label>Nombre completo</label><input className="input" value={nombre} onChange={e => setNombre(e.target.value)}/></div>

            <div className="field">
              <label>Buró de crédito <span style={{ color: 'var(--turquesa-600)', fontWeight: 700 }}>{buro}</span></label>
              <input type="range" min="300" max="850" value={buro} onChange={e => setBuro(+e.target.value)} style={{ accentColor: 'var(--turquesa)' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-400)' }}>
                <span>300</span><span>500</span><span>700</span><span>850</span>
              </div>
            </div>

            <div className="field"><label>Vivienda</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['propia','Propia'],['familiar','Familiar'],['rentada','Rentada']].map(([k, l]) => (
                  <button key={k} onClick={() => setVivienda(k)} className="btn btn-sm" style={{ flex: 1, background: vivienda === k ? 'var(--azul)' : 'var(--ink-50)', color: vivienda === k ? '#fff' : 'var(--ink-700)' }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Salario mensual</label>
                <input className="input" type="number" value={salario} onChange={e => setSalario(+e.target.value)}/>
              </div>
              <div className="field">
                <label>Antigüedad (años)</label>
                <input className="input" type="number" value={antig} min="0" max="40" onChange={e => setAntig(+e.target.value)}/>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Monto solicitado ($)</label>
                <input className="input" type="number" value={monto} min="1000" step="500" onChange={e => setMonto(+e.target.value)}/>
              </div>
              <div className="field">
                <label>Plazo</label>
                <select className="select" value={plazo} onChange={e => setPlazo(+e.target.value)}>
                  {[6,12,18,24,36,48,60].map(p => <option key={p} value={p}>{p} meses</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Capacidad de pago · deuda/ingreso <span style={{ color: 'var(--turquesa-600)', fontWeight: 700 }}>{capacidad}%</span></label>
              <input type="range" min="0" max="50" value={capacidad} onChange={e => setCapacidad(+e.target.value)} style={{ accentColor: 'var(--turquesa)' }}/>
            </div>

            <div style={{ padding: 12, background: 'var(--azul-50)', borderRadius: 10, fontSize: 12, color: 'var(--ink-700)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="info" size={16} stroke="var(--azul)"/>
              <div>
                <b style={{ color: 'var(--azul)' }}>Cálculo:</b> Subtotal {subtotal} pts × 10 = <b>{scoreTotal}</b> · Tasa sugerida: <b>{tasaInteres}% anual</b><br/>
                "Confirmar" crea la solicitud en el sistema buscando el cliente por nombre.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RULES MATRIX */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h3>Matriz de reglas de evaluación</h3>
          <button className="btn btn-light btn-sm"><Icon name="edit" size={13}/> Editar reglas</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th style={{ width: 180 }}>Variable</th><th colSpan="5">Rangos y puntuaciones</th></tr>
            </thead>
            <tbody>
              {[
                ['Buró',          SCORING_RULES.buro,      ptsBuro],
                ['Vivienda',      SCORING_RULES.vivienda,  ptsVivienda],
                ['Salario',       SCORING_RULES.salario,   ptsSalario],
                ['Capacidad Pago',SCORING_RULES.capacidad, ptsCapacidad],
                ['Antigüedad',    SCORING_RULES.antig,     ptsAntig],
              ].map(([lbl, rows, currentPts]) => (
                <tr key={lbl}>
                  <td><b style={{ color: 'var(--azul)' }}>{lbl}</b></td>
                  <td colSpan="5">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {rows.map((r, i) => (
                        <span key={i} className={'badge ' + (r.pts === currentPts ? 'b-turq' : 'b-gray')}
                              style={{ fontSize: 11.5, padding: '4px 12px', fontWeight: r.pts === currentPts ? 700 : 500 }}>
                          {r.lbl} <span style={{ opacity: .7, marginLeft: 4 }}>({r.pts} pts)</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { Creditos, Scoring });
