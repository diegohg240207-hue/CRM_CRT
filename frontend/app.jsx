// ============== APP ROOT ==============
const VALID_PAGES = new Set(['dashboard','prospectos','creditos','scoring','clientes','lineas','cobranza','reportes','config']);

const App = () => {
  const [user, setUser]           = useState(null);
  const [sucursal, setSucursal]   = useState(SUCURSALES[0]);
  const [page, setPage]           = useState('dashboard');
  const [cmdOpen, setCmdOpen]     = useState(false);
  const [sucOpen, setSucOpen]     = useState(false);
  const [prospectoSel, setProspectoSel] = useState(null);
  const [clienteSel, setClienteSel]     = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Keyboard shortcut Ctrl+K / Cmd+K ──────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Session restore + backend verification ─────────────────────────────
  // 1. Restore UI state from localStorage (instant UX)
  // 2. Verify httpOnly cookie is still valid with /auth/profile
  // 3. If cookie expired → show login
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem('cr_session');
      if (!saved) { setSessionChecked(true); return; }

      try {
        const s = JSON.parse(saved);
        if (!s.user) { setSessionChecked(true); return; }

        // Verify session with backend — cookie sent automatically
        const profile = await window.CRM_API.auth.verifySession();
        if (profile) {
          // Session valid — restore state
          const restoredUser = { ...s.user, ...profile, name: profile.nombre || s.user.name, role: profile.rol || s.user.role };
          setUser(restoredUser);
          if (s.sucursal) setSucursal(s.sucursal);
          // Restaurar página solo si el rol actual tiene acceso (puede haber cambiado)
          const restoredPage = s.page && VALID_PAGES.has(s.page) && canAccess(restoredUser.role, s.page)
            ? s.page
            : firstPageFor(restoredUser.role);
          setPage(restoredPage);
        } else {
          // Cookie expired or invalid — clear and show login
          localStorage.removeItem('cr_session');
        }
      } catch {
        localStorage.removeItem('cr_session');
      } finally {
        setSessionChecked(true);
      }
    };
    restore();
  }, []);

  // ── Persist UI session state (only user data, never tokens) ───────────
  useEffect(() => {
    if (user) {
      const s = JSON.parse(localStorage.getItem('cr_session') || '{}');
      localStorage.setItem('cr_session', JSON.stringify({ ...s, user, sucursal, page, ts: s.ts || Date.now() }));
    }
  }, [user, sucursal, page]);

  // ── Navegación con guard de rol ────────────────────────────────────────
  const handleNavigate = (pageId) => {
    if (!user) return;
    if (!canAccess(user.role, pageId)) {
      console.warn(`[RBAC] Acceso denegado: rol "${user.role}" no puede acceder a "${pageId}"`);
      return; // Silently block — el ítem ni debería aparecer en el nav
    }
    setPage(pageId);
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await window.CRM_API.auth.logout(); // Clears httpOnly cookies + DB session
    setUser(null);
    setPage('dashboard');
  };

  // ── Login callback ─────────────────────────────────────────────────────
  const handleLogin = (u, s) => {
    setUser(u);
    // Asegura que el dashboard inicial es accesible para el rol
    setPage(canAccess(u.role, 'dashboard') ? 'dashboard' : firstPageFor(u.role));
    setSucursal(s);
  };

  // ── Loading state while verifying session ─────────────────────────────
  if (!sessionChecked) {
    return (
      <div style={{
        height: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg, #f4f6fb)', color: 'var(--ink-500, #8a9ab5)', fontSize: 14,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--azul, #02356e)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }}></div>
          Verificando sesión…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin}/>;
  }

  // safePage: si el estado page es inaccesible para el rol (ej. sesión restaurada de otro rol),
  // redirige silenciosamente a la primera página permitida
  const safePage = canAccess(user.role, page) ? page : firstPageFor(user.role);

  return (
    <div className="app">
      <Sidebar
        active={safePage}
        onNav={handleNavigate}
        sucursal={sucursal}
        onPickSucursal={() => setSucOpen(true)}
        user={user}
        onLogout={handleLogout}
      />
      <Header page={safePage} onOpenCmd={() => setCmdOpen(true)}/>
      <main className="main">
        {safePage === 'dashboard'  && <Dashboard user={user}/>}
        {safePage === 'prospectos' && <Prospectos onOpenDetail={setProspectoSel}/>}
        {safePage === 'creditos'   && <Creditos onOpenScoring={() => handleNavigate('scoring')}/>}
        {safePage === 'scoring'    && <Scoring/>}
        {safePage === 'clientes'   && <Clientes onOpenClient={setClienteSel}/>}
        {safePage === 'lineas'     && <Lineas/>}
        {safePage === 'cobranza'   && <Cobranza/>}
        {safePage === 'reportes'   && <Reportes/>}
        {safePage === 'config'     && <Config/>}
      </main>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNav={handleNavigate}
        userRole={user.role}
      />
      <SucursalPicker open={sucOpen} current={sucursal} onPick={setSucursal} onClose={() => setSucOpen(false)}/>
      {/* FIX: pasar onNavigate para que ProspectoDetail pueda ir a scoring */}
      {prospectoSel && <ProspectoDetail p={prospectoSel} onClose={() => setProspectoSel(null)} onNavigate={(pg) => { setProspectoSel(null); handleNavigate(pg); }}/>}
      {clienteSel   && <ClienteDetail  c={clienteSel}   onClose={() => setClienteSel(null)}   onNavigate={(pg) => { setClienteSel(null);   handleNavigate(pg); }}/>}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
