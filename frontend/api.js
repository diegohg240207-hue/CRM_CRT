// CRM_CRT — API Client v2 (httpOnly Cookie Auth)
// Tokens gestionados via httpOnly cookies — nunca accesibles a JavaScript
// El navegador los envía automáticamente con credentials: 'include'

const API_BASE = window.CRM_API_URL || 'http://localhost:3000/api/v1';

// ==================== HTTP CLIENT ====================
async function apiRequest(method, endpoint, body = null, requireAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  // No Authorization header — el access_token httpOnly cookie se envía automáticamente

  const config = {
    method,
    headers,
    credentials: 'include', // ← Envía cookies httpOnly automáticamente en cada request
  };
  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (res.status === 401 && requireAuth) {
      const refreshed = await tryRefreshToken();
      if (refreshed) return apiRequest(method, endpoint, body, requireAuth);
      redirectToLogin();
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.status === 204 ? null : res.json();
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err.message);
    throw err;
  }
}

const api = {
  get:    (url)       => apiRequest('GET',    url),
  post:   (url, body) => apiRequest('POST',   url, body),
  put:    (url, body) => apiRequest('PUT',    url, body),
  patch:  (url, body) => apiRequest('PATCH',  url, body),
  delete: (url)       => apiRequest('DELETE', url),
};

// ==================== SESSION (solo datos de usuario, nunca tokens) ====================
function getSession() {
  try { return JSON.parse(localStorage.getItem('cr_session') || 'null'); } catch { return null; }
}

function saveSession(user, sucursal) {
  // Solo guardamos datos de UI — los tokens viven en httpOnly cookies
  localStorage.setItem('cr_session', JSON.stringify({ user, sucursal, ts: Date.now() }));
}

function clearSession() {
  localStorage.removeItem('cr_session');
}

async function tryRefreshToken() {
  try {
    // El refresh_token httpOnly cookie se envía automáticamente con credentials: 'include'
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

function redirectToLogin() {
  clearSession();
  window.location.reload();
}

// ==================== AUTH ====================
const CRM_Auth = {
  async login(email, password, sucursalId) {
    const data = await apiRequest('POST', '/auth/login', { email, password, sucursalId }, false);
    if (data?.user) {
      // Backend setea los tokens como httpOnly cookies — solo guardamos datos del usuario
      saveSession(
        { ...data.user, name: data.user.nombre, role: data.user.rol },
        sucursalId,
      );
    }
    return data;
  },

  async logout() {
    try {
      // Backend limpia las httpOnly cookies y elimina la sesión de DB
      await api.post('/auth/logout', {});
    } catch (e) {
      console.warn('Logout API error:', e.message);
    } finally {
      clearSession();
    }
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async verifySession() {
    // Verifica con el backend que el cookie de acceso sigue válido
    try {
      return await api.get('/auth/profile');
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    // Verifica si hay datos de sesión guardados (los tokens se verifican server-side)
    const s = getSession();
    if (!s) return false;
    // Sesión local expira en 8 días para forzar re-verificación
    const AGE_LIMIT = 8 * 24 * 60 * 60 * 1000;
    return s.ts && (Date.now() - s.ts) < AGE_LIMIT;
  },

  getSession,
};

// ==================== SUCURSALES ====================
const CRM_Sucursales = {
  getAll:  ()          => api.get('/sucursales'),
  getOne:  (id)        => api.get(`/sucursales/${id}`),
  create:  (data)      => api.post('/sucursales', data),
  update:  (id, data)  => api.put(`/sucursales/${id}`, data),
};

// ==================== PROSPECTOS ====================
const CRM_Prospectos = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/prospectos${qs ? '?' + qs : ''}`);
  },
  getKanban:       (sucursalId) => api.get(`/prospectos/kanban${sucursalId ? '?sucursalId=' + sucursalId : ''}`),
  getOne:          (id)         => api.get(`/prospectos/${id}`),
  create:          (data)       => api.post('/prospectos', data),
  update:          (id, data)   => api.put(`/prospectos/${id}`, data),
  moverEtapa:      (id, etapa)  => api.patch(`/prospectos/${id}/etapa`, { etapa }),
  addInteraccion:  (id, data)   => api.post(`/prospectos/${id}/interacciones`, data),
};

// ==================== CLIENTES ====================
const CRM_Clientes = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/clientes${qs ? '?' + qs : ''}`);
  },
  getOne:        (id)       => api.get(`/clientes/${id}`),
  create:        (data)     => api.post('/clientes', data),
  update:        (id, data) => api.put(`/clientes/${id}`, data),
  aumentarLinea: (id, data) => api.patch(`/clientes/${id}/linea`, data),
};

// ==================== CRÉDITOS ====================
const CRM_Creditos = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/creditos${qs ? '?' + qs : ''}`);
  },
  getKpis: ()           => api.get('/creditos/kpis'),
  getOne:  (id)         => api.get(`/creditos/${id}`),
  create:  (data)       => api.post('/creditos', data),
  update:  (id, data)   => api.put(`/creditos/${id}`, data),
};

// ==================== SCORING ====================
const CRM_Scoring = {
  evaluar:     (data)   => api.post('/scoring/evaluar', data),
  getReglas:   ()       => api.get('/scoring/reglas'),
  getHistorial:(page=1) => api.get(`/scoring/historial?page=${page}`),
};

// ==================== COBRANZA ====================
const CRM_Cobranza = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/cobranza${qs ? '?' + qs : ''}`);
  },
  getKpis:         ()         => api.get('/cobranza/kpis'),
  getTimeline:     ()         => api.get('/cobranza/timeline'),
  getOne:          (id)       => api.get(`/cobranza/${id}`),
  registrarAccion: (id, data) => api.post(`/cobranza/${id}/accion`, data),
};

// ==================== REPORTES ====================
const CRM_Reportes = {
  getDashboard:  () => api.get('/reportes/dashboard'),
  getOriginacion:() => api.get('/reportes/originacion'),
  getRiesgo:     () => api.get('/reportes/riesgo'),
  getEjecutivos: () => api.get('/reportes/ejecutivos'),
  getCompleto:   () => api.get('/reportes/ejecutivo'),
};

// ==================== USUARIOS ====================
const CRM_Usuarios = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/usuarios${qs ? '?' + qs : ''}`);
  },
  getOne:  (id)       => api.get(`/usuarios/${id}`),
  create:  (data)     => api.post('/usuarios', data),
  update:  (id, data) => api.put(`/usuarios/${id}`, data),
  toggle:  (id)       => api.patch(`/usuarios/${id}/toggle-active`),
};

// ==================== EXPORT GLOBAL ====================
window.CRM_API = {
  auth:       CRM_Auth,
  sucursales: CRM_Sucursales,
  prospectos: CRM_Prospectos,
  clientes:   CRM_Clientes,
  creditos:   CRM_Creditos,
  scoring:    CRM_Scoring,
  cobranza:   CRM_Cobranza,
  reportes:   CRM_Reportes,
  usuarios:   CRM_Usuarios,
};
