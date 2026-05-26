// ============== APP SHELL: Sidebar, Header, Routing ==============
const { useState, useEffect, useMemo, useRef } = React;

// Etiquetas legibles para mostrar el rol en la UI
const ROLE_LABELS = {
  ADMINISTRADOR:  'Administrador',
  SUPERVISOR:     'Supervisor',
  EJECUTIVO_CRM:  'Ejecutivo CRM',
  CREDITO:        'Crédito',
  COBRANZA:       'Cobranza',
};

const Sidebar = ({ active, onNav, sucursal, onPickSucursal, user, onLogout }) => {
  // Solo muestra ítems que el rol del usuario puede acceder
  const navItems = getNavForRole(user.role);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><img src="assets/icono.png" alt="Casa Ruiz" /></div>
        <div className="brand-text">
          CASA RUIZ<small>CRM · FINANZAS</small>
        </div>
      </div>

      <div className="branch-pick" onClick={onPickSucursal} title="Cambiar sucursal">
        <span className="b-dot"></span>
        <div style={{ flex: 1 }}>
          <div className="b-name">{sucursal.name}</div>
          <div className="b-sub">{sucursal.region}</div>
        </div>
        <Icon name="down" size={14} stroke="#9fb4cf" />
      </div>

      <div className="nav">
        {navItems.map((g) => (
          <div key={g.group}>
            <div className="nav-group" style={{ fontFamily: 'ElzaText' }}>{g.group}</div>
            {g.items.map((it) => (
              <div
                key={it.id}
                className={'nav-item ' + (active === it.id ? 'active' : '')}
                onClick={() => onNav(it.id)}
              >
                <span className="ni-icon"><Icon name={it.icon} size={17} /></span>
                <span>{it.label}</span>
                {it.badge ? <span className="ni-badge">{it.badge}</span> : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="me">
        <Avatar name={user.name} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="me-name" title={user.name}>{user.name}</div>
          <div className="me-role">{ROLE_LABELS[user.role] || user.role} · {sucursal.name}</div>
        </div>
        <button
          className="icon-btn"
          style={{ color: '#9fb4cf' }}
          title="Cerrar sesión"
          onClick={onLogout}
        >
          <Icon name="logout" size={16} />
        </button>
      </div>
    </aside>
  );
};


const breadcrumbsFor = (page) => {
  const map = {
    dashboard: ['Operación', 'Dashboard'],
    prospectos: ['Operación', 'CRM Prospectos'],
    creditos: ['Operación', 'Créditos'],
    scoring: ['Operación', 'Motor de Scoring'],
    clientes: ['Cartera', 'Clientes'],
    lineas: ['Cartera', 'Líneas de Crédito'],
    cobranza: ['Cartera', 'Cobranza'],
    reportes: ['Dirección', 'Dashboard Ejecutivo'],
    config: ['Sistema', 'Configuración']
  };
  return map[page] || ['Inicio'];
};

const Header = ({ page, onOpenCmd }) => {
  const cr = breadcrumbsFor(page);
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <header className="header">
      <div className="crumbs">
        <Icon name="home" size={15} />
        {cr.map((c, i) =>
        <React.Fragment key={i}>
            <span className="sep">/</span>
            <span className={i === cr.length - 1 ? 'cur' : ''}>{c}</span>
          </React.Fragment>
        )}
      </div>
      <div className="search">
        <span className="sicon"><Icon name="search" size={16} /></span>
        <input placeholder="Buscar clientes, créditos, productos..." onClick={onOpenCmd} readOnly />
        <kbd>⌘K</kbd>
      </div>
      <div className="actions">
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" title="Notificaciones" onClick={() => setNotifOpen((o) => !o)}>
            <Icon name="bell" /><span className="dot"></span>
          </button>
          {notifOpen &&
          <>
              <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}></div>
              <div style={{ position: 'absolute', top: 44, right: 0, width: 340, background: '#fff', border: '1px solid var(--ink-100)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between' }}>
                  <b style={{ color: 'var(--azul)', fontSize: 14 }}>Notificaciones</b>
                  {/* FIX: <a> sin href → button con cursor pointer */}
                  <button style={{ fontSize: 11, color: 'var(--turquesa-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setNotifOpen(false)} title="PENDIENTE BACKEND: PATCH /notificaciones/leidas">
                    Marcar leídas
                  </button>
                </div>
                {[
              { c: 'var(--rojo)', i: 'warn', t: 'Carlos Méndez · pago vencido 2 días', s: 'Hace 1h' },
              { c: 'var(--naranja)', i: 'cards', t: 'Solicitud P-1041 espera documentación', s: 'Hace 2h' },
              { c: 'var(--turquesa-600)', i: 'sparkle', t: 'Patricia Holguín elegible para subir línea', s: 'Hace 3h' }].
              map((n, i) =>
              <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--ink-100)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ink-50)', color: n.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={n.i} size={14} /></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5 }}>{n.t}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 2 }}>{n.s}</div>
                    </div>
                  </div>
              )}
                <div style={{ padding: 10, textAlign: 'center' }}>
                  {/* FIX: <a> sin href → button */}
                  <button style={{ fontSize: 12, color: 'var(--azul)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setNotifOpen(false)} title="PENDIENTE BACKEND: módulo de notificaciones">
                    Ver todas →
                  </button>
                </div>
              </div>
            </>
          }
        </div>
        {/* PENDIENTE BACKEND: módulo de citas/agenda */}
        <button className="icon-btn" title="Calendario — próximamente" onClick={() => alert('Módulo de calendario disponible en próxima versión.')}><Icon name="cal" /></button>
        <div className="vline"></div>
        <button className="btn btn-primary" onClick={onOpenCmd}><Icon name="plus" size={15} /> Nueva acción</button>
      </div>
    </header>);

};

// ============== COMMAND PALETTE ==============
const CommandPalette = ({ open, onClose, onNav, userRole }) => {
  const [q, setQ] = useState('');
  const refIn = useRef();
  useEffect(() => {if (open) setTimeout(() => refIn.current && refIn.current.focus(), 50);}, [open]);

  const ALL_CMDS = [
    { lbl: 'Ir a Dashboard',        icon: 'dashboard', go: 'dashboard'  },
    { lbl: 'Ver prospectos',         icon: 'users',     go: 'prospectos' },
    { lbl: 'Solicitar crédito',      icon: 'cards',     go: 'creditos'   },
    { lbl: 'Evaluar scoring',        icon: 'gauge',     go: 'scoring'    },
    { lbl: 'Ver clientes',           icon: 'user',      go: 'clientes'   },
    { lbl: 'Líneas de crédito',      icon: 'trend',     go: 'lineas'     },
    { lbl: 'Cobranza hoy',           icon: 'cash',      go: 'cobranza'   },
    { lbl: 'Dashboard ejecutivo',    icon: 'chart',     go: 'reportes'   },
    { lbl: 'Configuración',          icon: 'settings',  go: 'config'     },
  ];

  // Filtrar por rol Y por texto de búsqueda
  const cmds = ALL_CMDS
    .filter((c) => canAccess(userRole, c.go))
    .filter((c) => c.lbl.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && open && cmds[0]) {onNav(cmds[0].go);onClose();}
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, q, onClose, onNav]);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'fixed', top: '15vh', left: '50%', transform: 'translateX(-50%)',
        width: 560, maxWidth: '92vw', background: '#fff', borderRadius: 16,
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 70
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--ink-100)' }}>
          <Icon name="search" stroke="var(--ink-400)" />
          <input ref={refIn} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar acción o cliente…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent' }} />
          <kbd style={{ fontSize: 10, background: 'var(--ink-50)', padding: '2px 6px', borderRadius: 4 }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}>
          {cmds.map((c, i) =>
          <div key={i} className="nav-item"
          style={{ color: 'var(--ink-700)', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
          onClick={() => {onNav(c.go);onClose();}}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--azul-50)'}
          onMouseLeave={(e) => e.currentTarget.style.background = ''}>
              <Icon name={c.icon} size={16} stroke="var(--azul)" />
              <span>{c.lbl}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--ink-400)', fontSize: 11 }}>Enter</span>
            </div>
          )}
        </div>
      </div>
    </div>);

};

// ============== SUCURSAL PICKER ==============
const SucursalPicker = ({ open, current, onPick, onClose }) => {
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'fixed', top: 80, left: 20, width: 280,
        background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-lg)',
        padding: 8, zIndex: 70
      }}>
        <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Cambiar sucursal</div>
        {SUCURSALES.map((s) =>
        <div key={s.id} onClick={() => {onPick(s);onClose();}}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: s.id === current.id ? 'var(--azul-50)' : '' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--azul-50)'}
        onMouseLeave={(e) => e.currentTarget.style.background = s.id === current.id ? 'var(--azul-50)' : ''}>
            <span style={{ width: 8, height: 8, borderRadius: 50, background: 'var(--turquesa)' }}></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--azul)' }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{s.region}</div>
            </div>
            {s.id === current.id && <Icon name="check" size={14} stroke="var(--turquesa)" />}
          </div>
        )}
      </div>
    </div>);

};

Object.assign(window, { Sidebar, Header, CommandPalette, SucursalPicker });