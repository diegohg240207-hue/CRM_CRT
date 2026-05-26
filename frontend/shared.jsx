// ============== SHARED ICONS, HELPERS, MOCK DATA ==============
// Lucide-style minimal SVG icons (original strokes, common geometry)
const Icon = ({ name, size = 18, stroke = 'currentColor', strokeWidth = 1.8, fill = 'none' }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'dashboard': return <svg {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
    case 'users': return <svg {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.5 3.6-5.5 6.5-5.5s5.8 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M21.5 19c-.4-2.2-1.9-3.8-4-4.1"/></svg>;
    case 'cards': return <svg {...p}><rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h3"/></svg>;
    case 'gauge': return <svg {...p}><path d="M12 14V8"/><circle cx="12" cy="14" r="8"/><path d="M5 14a7 7 0 0 1 14 0"/></svg>;
    case 'user': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/></svg>;
    case 'cart': return <svg {...p}><path d="M3 4h2l2 12h12l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>;
    case 'cash': return <svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M5.5 9.5h.01M18.5 14.5h.01"/></svg>;
    case 'phone': return <svg {...p}><path d="M5 4h3l2 5-2 1c1 2 3 4 5 5l1-2 5 2v3a2 2 0 0 1-2 2C9 20 4 15 4 6a2 2 0 0 1 1-2z"/></svg>;
    case 'chart': return <svg {...p}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>;
    case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case 'bell': return <svg {...p}><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'filter': return <svg {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>;
    case 'down': return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
    case 'up': return <svg {...p}><path d="m6 15 6-6 6 6"/></svg>;
    case 'right': return <svg {...p}><path d="m9 6 6 6-6 6"/></svg>;
    case 'left': return <svg {...p}><path d="m15 6-6 6 6 6"/></svg>;
    case 'arr-up': return <svg {...p}><path d="m5 12 7-7 7 7M12 5v14"/></svg>;
    case 'arr-dn': return <svg {...p}><path d="m5 12 7 7 7-7M12 19V5"/></svg>;
    case 'check': return <svg {...p}><path d="m5 12 5 5L20 7"/></svg>;
    case 'x': return <svg {...p}><path d="M6 6 18 18M6 18 18 6"/></svg>;
    case 'warn': return <svg {...p}><path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.01"/></svg>;
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'cal': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'home': return <svg {...p}><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-4v-7h-8v7H4a1 1 0 0 1-1-1z"/></svg>;
    case 'tag': return <svg {...p}><path d="M3 12 12 3h8v8l-9 9z"/><circle cx="15.5" cy="8.5" r="1.2"/></svg>;
    case 'mail': return <svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case 'doc': return <svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8 13h8M8 17h5"/></svg>;
    case 'shield': return <svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>;
    case 'trend': return <svg {...p}><path d="m3 17 6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>;
    case 'package': return <svg {...p}><path d="M21 8 12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'logout': return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'cmd': return <svg {...p}><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.8 2.8M14.7 14.7l2.8 2.8M6.5 17.5l2.8-2.8M14.7 9.3l2.8-2.8"/></svg>;
    case 'menu': return <svg {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case 'eye': return <svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'edit': return <svg {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case 'dots': return <svg {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>;
    case 'attach': return <svg {...p}><path d="M21 11.5 12.5 20a5 5 0 1 1-7-7L14 4.5a3.5 3.5 0 1 1 5 5L10.5 18a2 2 0 1 1-3-3L15 7.5"/></svg>;
    default: return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3"/></svg>;
  }
};

// ============ HELPERS ============
const money = (n) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 });
const pct = (n) => (n * 100).toFixed(0) + '%';
const initials = (name) => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
const avatarColor = (seed) => {
  const palette = ['#02356e', '#08b1bc', '#ff9600', '#ff6000', '#1aa873', '#1255a0', '#069aa3', '#b56600', '#e84e6f'];
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
};
const Avatar = ({ name, size = 32 }) => (
  <span className={`av av-${size}`} style={{ background: avatarColor(name), width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</span>
);

// ============== MOCK DATA ==============
const SUCURSALES = [
  { id: 'tam', name: 'Tamazula', region: 'Jalisco · Matriz' },
  { id: 'cdg', name: 'Ciudad Guzmán', region: 'Jalisco' },
  { id: 'tep', name: 'Tepatitlán', region: 'Jalisco' },
  { id: 'gdl', name: 'Guadalajara Norte', region: 'Jalisco' },
];

const EJECUTIVOS = ['Alejandro Ramos', 'Sofía Lerma', 'Diego Vargas', 'María Gutiérrez', 'Carmen Olvera', 'Luis Fernández'];

const PROSPECTOS = [
  { id: 'P-1042', nombre: 'Joaquín Ramírez', tel: '341 102 8821', sucursal: 'Tamazula', producto: 'Estufa Mabe 30"', monto: 12400, score: 78, prioridad: 'alta', etapa: 'no-contactado', ejecutivo: 'Alejandro Ramos', fuente: 'Visita en piso', dias: 0, etiquetas: ['Caliente', 'Recompra'] },
  { id: 'P-1041', nombre: 'Lucero Núñez', tel: '341 220 7714', sucursal: 'Tamazula', producto: 'Refrigerador LG 14p', monto: 18200, score: 64, prioridad: 'media', etapa: 'contactado', ejecutivo: 'Sofía Lerma', fuente: 'Llamada entrante', dias: 1, etiquetas: ['Whatsapp'] },
  { id: 'P-1040', nombre: 'Ricardo Mendoza', tel: '343 905 1129', sucursal: 'Ciudad Guzmán', producto: 'Sala 3 piezas Roma', monto: 24500, score: 82, prioridad: 'alta', etapa: 'contactado', ejecutivo: 'Diego Vargas', fuente: 'Referido', dias: 1, etiquetas: ['Referido VIP'] },
  { id: 'P-1039', nombre: 'Marisol Bravo', tel: '341 880 4422', sucursal: 'Tamazula', producto: 'Lavadora Whirlpool 19kg', monto: 11900, score: 71, prioridad: 'media', etapa: 'seguimiento', ejecutivo: 'María Gutiérrez', fuente: 'Facebook', dias: 3, etiquetas: ['Necesita aval'] },
  { id: 'P-1038', nombre: 'Hugo Peralta', tel: '341 670 0023', sucursal: 'Tepatitlán', producto: 'Comedor 6 sillas', monto: 16800, score: 56, prioridad: 'baja', etapa: 'seguimiento', ejecutivo: 'Carmen Olvera', fuente: 'Visita en piso', dias: 5, etiquetas: [] },
  { id: 'P-1037', nombre: 'Estela Rivas', tel: '341 209 5511', sucursal: 'Tamazula', producto: 'TV TCL 55" QLED', monto: 9800, score: 88, prioridad: 'alta', etapa: 'cierre', ejecutivo: 'Alejandro Ramos', fuente: 'Recompra', dias: 0, etiquetas: ['Cliente leal'] },
  { id: 'P-1036', nombre: 'Pablo Cárdenas', tel: '341 444 9090', sucursal: 'Guadalajara Norte', producto: 'Recámara matrimonial', monto: 21200, score: 73, prioridad: 'media', etapa: 'cierre', ejecutivo: 'Luis Fernández', fuente: 'Web', dias: 2, etiquetas: ['Crédito directo'] },
  { id: 'P-1035', nombre: 'Janeth Solís', tel: '341 121 3030', sucursal: 'Tamazula', producto: 'Estéreo Sony XB', monto: 4200, score: 41, prioridad: 'baja', etapa: 'declinado', ejecutivo: 'Sofía Lerma', fuente: 'Llamada entrante', dias: 7, etiquetas: ['No respondió'] },
];

const CLIENTES = [
  { id: 'C-0231', nombre: 'María González', tel: '341 220 7711', email: 'maria.g@correo.mx', sucursal: 'Tamazula', linea: 35000, usado: 12400, score: 820, riesgo: 'bajo', estatus: 'al-corriente', desde: 'Mar 2022', compras: 14, ult: '2 días', proxPago: '$1,240 · 02 Dic', vivienda: 'Propia', salario: 22000, antig: '5+ años' },
  { id: 'C-0188', nombre: 'Carlos Méndez', tel: '341 880 1290', email: 'cmendez@correo.mx', sucursal: 'Ciudad Guzmán', linea: 18000, usado: 16500, score: 580, riesgo: 'alto', estatus: 'vencido', desde: 'Sep 2023', compras: 4, ult: '3 días', proxPago: '$880 · Vencido 2d', vivienda: 'Rentada', salario: 13500, antig: '2 años' },
  { id: 'C-0214', nombre: 'Rosa Delgado', tel: '343 102 9988', email: 'rdelgado@correo.mx', sucursal: 'Ciudad Guzmán', linea: 24000, usado: 8200, score: 740, riesgo: 'bajo', estatus: 'al-corriente', desde: 'Jun 2022', compras: 9, ult: '12 días', proxPago: '$1,650 · 08 Dic', vivienda: 'Propia', salario: 18500, antig: '4 años' },
  { id: 'C-0190', nombre: 'Andrés Mota', tel: '341 444 9011', email: 'andres.m@correo.mx', sucursal: 'Tamazula', linea: 12000, usado: 9800, score: 660, riesgo: 'medio', estatus: 'al-corriente', desde: 'Ene 2024', compras: 3, ult: '4 días', proxPago: '$780 · 05 Dic', vivienda: 'Rentada', salario: 14000, antig: '3 años' },
  { id: 'C-0151', nombre: 'Patricia Holguín', tel: '341 222 4040', email: 'patyh@correo.mx', sucursal: 'Tamazula', linea: 50000, usado: 11000, score: 855, riesgo: 'bajo', estatus: 'al-corriente', desde: 'Feb 2021', compras: 22, ult: 'Ayer', proxPago: '$2,100 · 10 Dic', vivienda: 'Propia', salario: 28000, antig: '5+ años' },
  { id: 'C-0205', nombre: 'Jorge Salas', tel: '341 660 1198', email: 'jorgesa@correo.mx', sucursal: 'Tepatitlán', linea: 20000, usado: 19500, score: 610, riesgo: 'medio', estatus: 'mora-temprana', desde: 'Nov 2023', compras: 5, ult: '8 días', proxPago: '$1,420 · Vencido 5d', vivienda: 'Familiar', salario: 15500, antig: '3 años' },
];

const COBRANZA = [
  { id: 'C-0188', cliente: 'Carlos Méndez', monto: 880, dias: 2, prox: '02 Dic', riesgo: 'medio', ejecutivo: 'Sofía Lerma', accion: 'Llamada hecha' },
  { id: 'C-0205', cliente: 'Jorge Salas', monto: 1420, dias: 5, prox: '06 Dic', riesgo: 'medio', ejecutivo: 'Carmen Olvera', accion: 'Whatsapp enviado' },
  { id: 'C-0099', cliente: 'Beatriz Cervantes', monto: 2100, dias: 12, prox: '13 Dic', riesgo: 'alto', ejecutivo: 'Diego Vargas', accion: 'Visita programada' },
  { id: 'C-0312', cliente: 'Hugo Cisneros', monto: 760, dias: 1, prox: '01 Dic', riesgo: 'bajo', ejecutivo: 'Alejandro Ramos', accion: 'Recordatorio SMS' },
  { id: 'C-0277', cliente: 'Verónica Pacheco', monto: 1980, dias: 22, prox: 'En acuerdo', riesgo: 'alto', ejecutivo: 'Luis Fernández', accion: 'Convenio firmado' },
];

const NAV_ITEMS = [
  { group: 'Operación', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'prospectos', label: 'Prospectos', icon: 'users', badge: '18' },
    { id: 'creditos',   label: 'Créditos',   icon: 'cards' },
    { id: 'scoring',    label: 'Motor de Scoring', icon: 'gauge' },
  ]},
  { group: 'Cartera', items: [
    { id: 'clientes',   label: 'Clientes',   icon: 'user' },
    { id: 'lineas',     label: 'Líneas de Crédito', icon: 'trend' },
    { id: 'cobranza',   label: 'Cobranza',   icon: 'cash', badge: '7' },
  ]},
  { group: 'Dirección', items: [
    { id: 'reportes',   label: 'Dashboard Ejecutivo', icon: 'chart' },
  ]},
  { group: 'Sistema', items: [
    { id: 'config',     label: 'Configuración', icon: 'settings' },
  ]},
];

// ============== RBAC — CONTROL DE ACCESO POR ROL ==============
// Fuente de verdad: roles del schema Prisma (RolUsuario enum)
// ADMINISTRADOR > SUPERVISOR > EJECUTIVO_CRM | CREDITO | COBRANZA

const PAGE_ROLES = {
  dashboard:  ['ADMINISTRADOR', 'SUPERVISOR', 'EJECUTIVO_CRM', 'CREDITO', 'COBRANZA'],
  prospectos: ['ADMINISTRADOR', 'SUPERVISOR', 'EJECUTIVO_CRM', 'CREDITO'],
  creditos:   ['ADMINISTRADOR', 'SUPERVISOR', 'EJECUTIVO_CRM', 'CREDITO'],
  scoring:    ['ADMINISTRADOR', 'SUPERVISOR', 'CREDITO'],
  clientes:   ['ADMINISTRADOR', 'SUPERVISOR', 'EJECUTIVO_CRM', 'CREDITO', 'COBRANZA'],
  lineas:     ['ADMINISTRADOR', 'SUPERVISOR', 'CREDITO'],
  cobranza:   ['ADMINISTRADOR', 'SUPERVISOR', 'COBRANZA'],
  reportes:   ['ADMINISTRADOR', 'SUPERVISOR'],
  config:     ['ADMINISTRADOR'],
};

/** true si el rol tiene acceso a la página */
const canAccess = (role, page) => {
  if (!role || !page) return false;
  const allowed = PAGE_ROLES[page];
  return Array.isArray(allowed) && allowed.includes(role);
};

/** Primera página accesible para un rol dado (fallback seguro) */
const firstPageFor = (role) =>
  Object.keys(PAGE_ROLES).find((p) => canAccess(role, p)) || 'dashboard';

/** NAV_ITEMS filtrado — solo grupos/ítems que el rol puede ver */
const getNavForRole = (role) =>
  NAV_ITEMS
    .map((g) => ({ ...g, items: g.items.filter((it) => canAccess(role, it.id)) }))
    .filter((g) => g.items.length > 0);

Object.assign(window, {
  Icon, Avatar, money, pct, initials, avatarColor,
  SUCURSALES, EJECUTIVOS, PROSPECTOS, CLIENTES, COBRANZA, NAV_ITEMS,
  PAGE_ROLES, canAccess, firstPageFor, getNavForRole,
});
