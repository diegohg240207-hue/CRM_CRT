// ============== CRM PROSPECTOS ==============
const ETAPAS = [
  { id: 'no-contactado', label: 'No contactado', color: 'var(--ink-400)' },
  { id: 'contactado',    label: 'Contactado',    color: 'var(--azul-600)' },
  { id: 'seguimiento',   label: 'Seguimiento',   color: 'var(--turquesa)' },
  { id: 'cierre',        label: 'Cierre exitoso', color: 'var(--verde)' },
  { id: 'declinado',     label: 'Declinado',     color: 'var(--rojo)' },
];

const prioridadBadge = (p) => ({
  alta:  <span className="badge b-red">🔥 Alta</span>,
  media: <span className="badge b-org">Media</span>,
  baja:  <span className="badge b-gray">Baja</span>,
}[p]);

// Normaliza prospecto de la API al formato local (etapa/prioridad en lowercase con guiones)
const normalizeP = (p) => ({
  ...p,
  id:        p.folio   || p.id,
  _apiId:    p.id,                  // ID real de UUID para llamadas API
  etapa:     (p.etapa   || 'NO_CONTACTADO').toLowerCase().replace(/_/g, '-'),
  prioridad: (p.prioridad || 'MEDIA').toLowerCase(),
  monto:     Number(p.montoEstimado || p.monto || 0),
  score:     p.score || 0,
  ejecutivo: p.ejecutivo?.nombre || p.ejecutivo || '—',
  etiquetas: p.etiquetas || [],
  dias:      p.diasEnEtapa || 0,
});

const Prospectos = ({ onOpenDetail }) => {
  const [view, setView] = useState('kanban'); // kanban | tabla | timeline
  const [filter, setFilter] = useState('todos');
  const [data, setData] = useState(PROSPECTOS);
  const [showNew, setShowNew] = useState(false);
  const [cargando, setCargando] = useState(false);

  // ── Carga inicial desde backend ─────────────────────────────────────────
  useEffect(() => {
    setCargando(true);
    window.CRM_API.prospectos.getKanban()
      .then(kanban => {
        if (!kanban) return;
        // La API devuelve { NO_CONTACTADO: [...], CONTACTADO: [...], ... }
        const todos = Object.values(kanban).flat().map(normalizeP);
        if (todos.length) setData(todos);
      })
      .catch(() => {}) // usa mock data si falla
      .finally(() => setCargando(false));
  }, []);

  const filtered = data.filter(p => filter === 'todos' || p.prioridad === filter);
  const byEtapa = (id) => filtered.filter(p => p.etapa === id);

  const moveCard = (id, newEtapa) => {
    setData(d => d.map(p => p.id === id ? { ...p, etapa: newEtapa } : p));
    // Sincroniza con backend usando el UUID real
    const item = data.find(p => p.id === id);
    if (item?._apiId) {
      const etapaAPI = newEtapa.toUpperCase().replace(/-/g, '_');
      window.CRM_API.prospectos.moverEtapa(item._apiId, etapaAPI).catch(() => {});
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>CRM · Prospectos</h1>
          <div className="sub">{data.length} prospectos · 56% en seguimiento activo · próximo cierre estimado: <b>Estela Rivas</b></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Los filtros ya están integrados debajo (prioridad). Este botón es para filtros avanzados */}
          <button className="btn btn-ghost" title="Filtros avanzados — usa los filtros de prioridad debajo"
            onClick={() => alert('Filtros avanzados por sucursal, ejecutivo y fecha — disponibles con backend.')}>
            <Icon name="filter" size={15}/> Filtros
          </button>
          {/* PENDIENTE BACKEND: importación CSV → POST /prospectos/import */}
          <button className="btn btn-ghost" title="Importar prospectos desde CSV"
            onClick={() => alert('Importación de CSV disponible con backend conectado.\nEndpoint: POST /prospectos/import')}>
            <Icon name="doc" size={15}/> Importar CSV
          </button>
          <button className="btn btn-accent" onClick={() => setShowNew(true)}><Icon name="plus" size={15}/> Nuevo prospecto</button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: '#fff', padding: 4, borderRadius: 10, border: '1px solid var(--ink-100)' }}>
          {[['kanban', 'Kanban'], ['tabla', 'Tabla'], ['timeline', 'Timeline']].map(([id, lbl]) => (
            <button key={id} onClick={() => setView(id)}
              style={{
                padding: '7px 14px', borderRadius: 7, fontWeight: 600, fontSize: 12.5,
                background: view === id ? 'var(--azul)' : 'transparent',
                color: view === id ? '#fff' : 'var(--ink-500)'
              }}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
          {[['todos', 'Todos'], ['alta', '🔥 Alta'], ['media', 'Media'], ['baja', 'Baja']].map(([id, lbl]) => (
            <button key={id} onClick={() => setFilter(id)} className="btn btn-sm"
              style={{ background: filter === id ? 'var(--azul-100)' : 'var(--ink-50)', color: filter === id ? 'var(--azul)' : 'var(--ink-700)' }}>{lbl}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--ink-500)', fontSize: 12 }}>Pipeline:</span>
          <span className="badge b-blue">{money(data.reduce((s,p) => s+p.monto, 0))}</span>
        </div>
      </div>

      {view === 'kanban' && (
        <div className="kanban-scroll">
        <div className="kanban">
          {ETAPAS.map(et => {
            const cards = byEtapa(et.id);
            const sum = cards.reduce((s,c) => s+c.monto, 0);
            return (
              <div key={et.id} className="kcol"
                   onDragOver={e => e.preventDefault()}
                   onDrop={e => { const id = e.dataTransfer.getData('text/plain'); if (id) moveCard(id, et.id); }}>
                <div className="kcol-head">
                  <div className="kt">
                    <span style={{ width: 8, height: 8, borderRadius: 50, background: et.color }}></span>
                    {et.label}
                    <span className="pill">{cards.length}</span>
                  </div>
                  {/* FIX: botón + en columna Kanban abre modal de nuevo prospecto en esa etapa */}
                <button className="btn btn-sm btn-light" style={{ width: 26, padding: 0, justifyContent: 'center' }}
                  onClick={() => setShowNew(true)} title={`Nuevo prospecto en ${et.label}`}>
                  <Icon name="plus" size={13}/>
                </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', padding: '0 4px 6px' }}>{money(sum)} en pipeline</div>
                {cards.map(p => (
                  <div key={p.id} className="kcard" draggable
                       onDragStart={e => e.dataTransfer.setData('text/plain', p.id)}
                       onClick={() => onOpenDetail(p)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span className="ktitle">{p.nombre}</span>
                      {prioridadBadge(p.prioridad)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{p.producto}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {p.etiquetas.map(t => <span key={t} className="badge b-gray" style={{ fontSize: 10 }}>{t}</span>)}
                    </div>
                    <div className="kbar"><div style={{ width: p.score + '%', background: p.score >= 70 ? 'var(--verde)' : p.score >= 50 ? 'var(--amarillo)' : 'var(--rojo)' }}></div></div>
                    <div className="kmeta">
                      <span className="kamount">{money(p.monto)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--ink-400)' }}>Score {p.score}</span>
                        <Avatar name={p.ejecutivo} size={24}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        </div>
      )}

      {view === 'tabla' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>Prospecto</th><th>Sucursal</th><th>Producto</th><th>Monto</th><th>Score</th><th>Etapa</th><th>Prioridad</th><th>Ejecutivo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => onOpenDetail(p)} style={{ cursor: 'pointer' }}>
                  <td><span className="cell-strong">{p.id}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={p.nombre} size={28}/>
                      <div>
                        <div className="cell-strong">{p.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{p.tel}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.sucursal}</td>
                  <td>{p.producto}</td>
                  <td><b style={{ color: 'var(--azul)' }}>{money(p.monto)}</b></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 56, height: 5, background: 'var(--ink-100)', borderRadius: 3 }}>
                        <div style={{ width: p.score+'%', height: '100%', background: p.score >= 70 ? 'var(--verde)' : p.score >= 50 ? 'var(--amarillo)' : 'var(--rojo)', borderRadius: 3 }}></div>
                      </div>
                      <span style={{ fontFamily: 'Elza', fontWeight: 700 }}>{p.score}</span>
                    </div>
                  </td>
                  <td><span className="badge b-blue"><span className="dot" style={{ background: ETAPAS.find(e => e.id === p.etapa).color }}></span>{ETAPAS.find(e => e.id === p.etapa).label}</span></td>
                  <td>{prioridadBadge(p.prioridad)}</td>
                  <td><Avatar name={p.ejecutivo} size={24}/></td>
                  <td><button className="btn btn-light btn-sm" style={{ width: 28, padding: 0, justifyContent: 'center' }}><Icon name="dots" size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'timeline' && (
        <div className="card card-pad">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '120px 32px 1fr', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--ink-100)' : '' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{p.dias === 0 ? 'Hoy' : `Hace ${p.dias} ${p.dias === 1 ? 'día' : 'días'}`}</div>
                <div style={{ width: 12, height: 12, borderRadius: 50, background: ETAPAS.find(e=>e.id===p.etapa).color, justifySelf: 'center', boxShadow: '0 0 0 4px ' + ETAPAS.find(e=>e.id===p.etapa).color + '22' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => onOpenDetail(p)}>
                  <Avatar name={p.nombre}/>
                  <div style={{ flex: 1 }}>
                    <div className="cell-strong">{p.nombre} · {p.producto}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{p.fuente} → {ETAPAS.find(e=>e.id===p.etapa).label} · {p.ejecutivo}</div>
                  </div>
                  <span className="badge b-blue">{money(p.monto)}</span>
                  {prioridadBadge(p.prioridad)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNew && <NuevoProspectoModal onClose={() => setShowNew(false)} onCreate={(p) => { setData(d => [{ ...p, id: 'P-' + (1042 + d.length) }, ...d]); setShowNew(false); }}/>}
    </>
  );
};

const NuevoProspectoModal = ({ onClose, onCreate }) => {
  const [f, setF] = useState({ nombre: '', tel: '', producto: '', monto: 10000, sucursal: 'Tamazula', ejecutivo: 'Alejandro Ramos', fuente: 'Visita en piso', prioridad: 'media' });
  const [saving, setSaving] = useState(false);
  const [apiSucs, setApiSucs] = useState([]); // sucursales reales con UUIDs

  useEffect(() => {
    window.CRM_API.sucursales.getAll().catch(() => null).then(ss => { if (ss?.length) setApiSucs(ss); });
  }, []);

  const handleCreate = async () => {
    if (!f.nombre.trim() || !f.tel.trim()) return;
    setSaving(true);
    const sucursal = apiSucs.find(s => s.nombre === f.sucursal) || apiSucs[0];
    const session = window.CRM_API.auth.getSession();
    const body = {
      nombre: f.nombre.trim(),
      telefono: f.tel.trim(),
      producto: f.producto || 'Sin especificar',
      montoEstimado: f.monto,
      sucursalId: sucursal?.id || apiSucs[0]?.id,
      ejecutivoId: session?.user?.id,
      fuente: f.fuente,
      prioridad: f.prioridad.toUpperCase(),
    };
    try {
      if (body.sucursalId && body.ejecutivoId) {
        const created = await window.CRM_API.prospectos.create(body);
        if (created) { onCreate(normalizeP(created)); setSaving(false); return; }
      }
    } catch (e) {
      console.warn('[Prospecto] API save failed, using local:', e.message);
    }
    // Fallback local si API falla
    onCreate({ ...f, id: 'P-' + Date.now(), score: 68, etapa: 'no-contactado', dias: 0, etiquetas: [] });
    setSaving(false);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18 }}>Nuevo prospecto</h3>
            <div style={{ color: 'var(--ink-500)', fontSize: 12, marginTop: 2 }}>Captura rápida · 30 segundos</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field"><label>Nombre completo</label><input className="input" value={f.nombre} onChange={e => setF({...f, nombre: e.target.value})} placeholder="Ej. Mario Hernández"/></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Teléfono</label><input className="input" value={f.tel} onChange={e => setF({...f, tel: e.target.value})} placeholder="341 000 0000"/></div>
            <div className="field"><label>Sucursal</label>
              <select className="select" value={f.sucursal} onChange={e => setF({...f, sucursal: e.target.value})}>
                {SUCURSALES.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Producto de interés</label><input className="input" value={f.producto} onChange={e => setF({...f, producto: e.target.value})} placeholder="Ej. Refrigerador LG 14 pies"/></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Monto estimado</label><input className="input" type="number" value={f.monto} onChange={e => setF({...f, monto: +e.target.value})}/></div>
            <div className="field"><label>Fuente</label>
              <select className="select" value={f.fuente} onChange={e => setF({...f, fuente: e.target.value})}>
                <option>Visita en piso</option><option>Llamada entrante</option><option>Facebook</option><option>Whatsapp</option><option>Referido</option><option>Web</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Ejecutivo asignado</label>
            <select className="select" value={f.ejecutivo} onChange={e => setF({...f, ejecutivo: e.target.value})}>
              {EJECUTIVOS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="field"><label>Prioridad</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['alta', 'media', 'baja'].map(p => (
                <button key={p} onClick={() => setF({...f, prioridad: p})}
                  className="btn btn-sm" style={{ flex: 1, background: f.prioridad === p ? 'var(--azul)' : 'var(--ink-50)', color: f.prioridad === p ? '#fff' : 'var(--ink-700)' }}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--turquesa-50)', borderRadius: 10, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--turquesa-600)' }}><Icon name="sparkle" size={16}/></span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--turquesa-600)', fontSize: 13 }}>Score comercial estimado: 68 pts</div>
              <div style={{ fontSize: 12, color: 'var(--ink-700)', marginTop: 4 }}>Calculado en base a fuente, monto y comportamiento histórico de la sucursal.</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear prospecto'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== PROSPECTO DETAIL DRAWER ==============
const ProspectoDetail = ({ p, onClose, onNavigate }) => {
  if (!p) return null;
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([
    { i: 'plus',  t: 'Prospecto creado por ' + p.ejecutivo, w: 'Hoy 10:14 AM' },
    { i: 'tag',   t: 'Etiqueta "Caliente" aplicada', w: 'Hoy 10:15 AM' },
    { i: 'phone', t: 'Llamada agendada para hoy 4 PM', w: 'Hoy 10:18 AM' },
  ]);
  const [pasos, setPasos] = useState([false, false, false]);

  const enviarNota = () => {
    if (!nota.trim()) return;
    const texto = nota.trim();
    const now = new Date();
    const h = now.getHours().toString().padStart(2,'0');
    const m = now.getMinutes().toString().padStart(2,'0');
    setNotas(n => [...n, { i: 'doc', t: texto, w: `Hoy ${h}:${m}` }]);
    setNota('');
    // Sincroniza con backend — usa _apiId si está disponible (prospecto cargado desde API)
    const pid = p._apiId || p.id;
    window.CRM_API.prospectos.addInteraccion(pid, { tipo: 'NOTA', descripcion: texto })
      .catch(() => {}); // silencioso — la nota ya se guardó en local state
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={p.nombre} size={44}/>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17 }}>{p.nombre}</h3>
            <div style={{ color: 'var(--ink-500)', fontSize: 12 }}>{p.id} · {p.sucursal} · {p.fuente}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x"/></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ padding: 12, background: 'var(--azul-50)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>SCORE COMERCIAL</div>
              <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 28, color: 'var(--azul)' }}>{p.score}</div>
              <div className="progress" style={{ marginTop: 6 }}><div style={{ width: p.score + '%', background: p.score >= 70 ? 'var(--verde)' : 'var(--amarillo)' }}></div></div>
            </div>
            <div style={{ padding: 12, background: 'var(--turquesa-50)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>MONTO POTENCIAL</div>
              <div style={{ fontFamily: 'Elza', fontWeight: 900, fontSize: 28, color: 'var(--turquesa-600)' }}>{money(p.monto)}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 6 }}>{p.producto}</div>
            </div>
          </div>

          {/* FIX: botones con acciones reales */}
          <div style={{ padding: '0 24px 18px', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => window.location.href = `tel:${p.tel.replace(/\s/g,'')}`}>
              <Icon name="phone" size={14}/> Llamar
            </button>
            <button className="btn btn-accent" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => window.open(`https://wa.me/52${p.tel.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${p.nombre}, le contactamos de Casa Ruiz respecto a ${p.producto}.`)}`, '_blank')}>
              <Icon name="mail" size={14}/> Whatsapp
            </button>
            {/* FIX: navega al scoring y cierra el drawer */}
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => onNavigate && onNavigate('scoring')}>
              <Icon name="gauge" size={14}/> Solicitar crédito
            </button>
          </div>

          {/* FIX: checkboxes con estado real */}
          <div style={{ padding: '0 24px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 8 }}>Próximos pasos sugeridos</div>
            {[
              ['Confirmar interés y horario de visita', '⏱ Hoy'],
              ['Iniciar precalificación crediticia', '📋 +2 días'],
              ['Enviar cotización formal', '✉ +4 días'],
            ].map(([t, w], i) => (
              <div key={i} onClick={() => setPasos(ps => ps.map((v,j) => j===i ? !v : v))}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: pasos[i] ? 'var(--verde-100)' : 'var(--ink-50)', borderRadius: 8, marginBottom: 6, cursor: 'pointer', transition: 'background .15s' }}>
                <input type="checkbox" checked={pasos[i]} onChange={() => {}} style={{ accentColor: 'var(--turquesa)', pointerEvents: 'none' }}/>
                <span style={{ flex: 1, fontSize: 13, textDecoration: pasos[i] ? 'line-through' : 'none', color: pasos[i] ? 'var(--ink-400)' : 'inherit' }}>{t}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{w}</span>
              </div>
            ))}
          </div>

          {/* FIX: historial con notas dinámicas */}
          <div style={{ padding: '0 24px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 10 }}>Historial</div>
            {notas.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--ink-100)' }}>
                <span style={{ width: 28, height: 28, borderRadius: 50, background: 'var(--azul-50)', color: 'var(--azul)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={e.i} size={13}/></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{e.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)' }}>{e.w}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIX: nota con estado y envío local (pendiente conectar a API) */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--ink-100)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Añadir comentario o nota…"
              value={nota}
              onChange={e => setNota(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviarNota()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={enviarNota} disabled={!nota.trim()}>
              <Icon name="right" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Prospectos, ProspectoDetail, ETAPAS });
