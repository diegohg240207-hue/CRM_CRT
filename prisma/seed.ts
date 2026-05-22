import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRM_CRT database...');

  // Sucursales
  const sucursales = await Promise.all([
    prisma.sucursal.upsert({
      where: { id: 'suc-monterrey' },
      update: {},
      create: { id: 'suc-monterrey', nombre: 'Monterrey Centro', region: 'Noreste', direccion: 'Av. Constitución 123', telefono: '81-1234-5678' },
    }),
    prisma.sucursal.upsert({
      where: { id: 'suc-gdl' },
      update: {},
      create: { id: 'suc-gdl', nombre: 'Guadalajara', region: 'Occidente', direccion: 'Av. Vallarta 456', telefono: '33-9876-5432' },
    }),
    prisma.sucursal.upsert({
      where: { id: 'suc-cdmx' },
      update: {},
      create: { id: 'suc-cdmx', nombre: 'CDMX Norte', region: 'Centro', direccion: 'Insurgentes Norte 789', telefono: '55-5678-1234' },
    }),
    prisma.sucursal.upsert({
      where: { id: 'suc-leon' },
      update: {},
      create: { id: 'suc-leon', nombre: 'León', region: 'Bajío', direccion: 'Blvd. López Mateos 321', telefono: '47-7890-1234' },
    }),
  ]);

  console.log(`Sucursales: ${sucursales.length}`);

  // Usuarios
  const hash = await bcrypt.hash('Admin123!', 10);
  const hashCRM = await bcrypt.hash('CRM123!', 10);
  const hashCred = await bcrypt.hash('Cred123!', 10);

  const usuarios = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'admin@casaruiz.mx' },
      update: {},
      create: { nombre: 'Administrador Sistema', email: 'admin@casaruiz.mx', passwordHash: hash, rol: 'ADMINISTRADOR', sucursalId: 'suc-monterrey' },
    }),
    prisma.usuario.upsert({
      where: { email: 'supervisor@casaruiz.mx' },
      update: {},
      create: { nombre: 'Ana García Supervisor', email: 'supervisor@casaruiz.mx', passwordHash: hash, rol: 'SUPERVISOR', sucursalId: 'suc-monterrey' },
    }),
    prisma.usuario.upsert({
      where: { email: 'crm1@casaruiz.mx' },
      update: {},
      create: { nombre: 'Carlos Mendoza', email: 'crm1@casaruiz.mx', passwordHash: hashCRM, rol: 'EJECUTIVO_CRM', sucursalId: 'suc-monterrey' },
    }),
    prisma.usuario.upsert({
      where: { email: 'crm2@casaruiz.mx' },
      update: {},
      create: { nombre: 'María López', email: 'crm2@casaruiz.mx', passwordHash: hashCRM, rol: 'EJECUTIVO_CRM', sucursalId: 'suc-gdl' },
    }),
    prisma.usuario.upsert({
      where: { email: 'credito1@casaruiz.mx' },
      update: {},
      create: { nombre: 'Roberto Sánchez', email: 'credito1@casaruiz.mx', passwordHash: hashCred, rol: 'CREDITO', sucursalId: 'suc-monterrey' },
    }),
    prisma.usuario.upsert({
      where: { email: 'cobranza1@casaruiz.mx' },
      update: {},
      create: { nombre: 'Laura Torres', email: 'cobranza1@casaruiz.mx', passwordHash: hashCred, rol: 'COBRANZA', sucursalId: 'suc-monterrey' },
    }),
  ]);

  console.log(`Usuarios: ${usuarios.length}`);

  const ejecutivoCRM = usuarios[2];
  const ejecutivoCred = usuarios[4];
  const ejecutivoCobranza = usuarios[5];

  // Clientes demo
  const clientesData = [
    { folio: 'C-0231', nombre: 'Alejandra Martínez', tel: '81-1234-5678', email: 'ale.mtz@email.com', suc: 'suc-monterrey', vivienda: 'PROPIA', salario: 22000, antig: 5, buro: 780, linea: 45000 },
    { folio: 'C-0188', nombre: 'José Ramírez', tel: '33-8765-4321', email: 'jose.ram@email.com', suc: 'suc-gdl', vivienda: 'FAMILIAR', salario: 16500, antig: 3, buro: 650, linea: 25000 },
    { folio: 'C-0412', nombre: 'Patricia Flores', tel: '55-5432-1098', email: 'pat.flores@email.com', suc: 'suc-cdmx', vivienda: 'RENTADA', salario: 14000, antig: 2, buro: 590, linea: 15000 },
    { folio: 'C-0307', nombre: 'Miguel Ángel Herrera', tel: '47-7654-3210', email: 'miguel.h@email.com', suc: 'suc-leon', vivienda: 'PROPIA', salario: 28000, antig: 7, buro: 810, linea: 45000 },
  ];

  for (const c of clientesData) {
    await prisma.cliente.upsert({
      where: { folio: c.folio },
      update: {},
      create: {
        folio: c.folio,
        nombre: c.nombre,
        telefono: c.tel,
        email: c.email,
        sucursalId: c.suc,
        vivienda: c.vivienda as any,
        salarioMensual: c.salario,
        antiguedadLaboral: c.antig,
        scoreBuro: c.buro,
        scoreInterno: c.buro >= 750 ? 85 : c.buro >= 700 ? 70 : c.buro >= 600 ? 55 : 40,
        riesgo: c.buro >= 700 ? 'BAJO' : c.buro >= 550 ? 'MEDIO' : 'ALTO' as any,
        estatus: 'AL_CORRIENTE' as any,
        totalCompras: Math.floor(Math.random() * 8) + 1,
        lineaCredito: {
          create: {
            lineaAprobada: c.linea,
            lineaUsada: c.linea * 0.4,
            lineaDisponible: c.linea * 0.6,
          },
        },
      },
    });
  }

  console.log(`Clientes demo creados: ${clientesData.length}`);

  // Prospectos demo
  const prospectosData = [
    { folio: 'P-1042', nombre: 'Fernando Castillo', tel: '81-9999-1111', suc: 'suc-monterrey', producto: 'Crédito Personal', monto: 15000, etapa: 'SEGUIMIENTO', prioridad: 'ALTA' },
    { folio: 'P-1043', nombre: 'Diana Vega', tel: '33-8888-2222', suc: 'suc-gdl', producto: 'Línea Revolvente', monto: 8000, etapa: 'CONTACTADO', prioridad: 'MEDIA' },
    { folio: 'P-1044', nombre: 'Ernesto Ruiz', tel: '55-7777-3333', suc: 'suc-cdmx', producto: 'Crédito Personal', monto: 25000, etapa: 'NO_CONTACTADO', prioridad: 'ALTA' },
    { folio: 'P-1045', nombre: 'Sofía Morales', tel: '47-6666-4444', suc: 'suc-leon', producto: 'Micro Crédito', monto: 5000, etapa: 'CIERRE', prioridad: 'BAJA' },
  ];

  for (const p of prospectosData) {
    await prisma.prospecto.upsert({
      where: { folio: p.folio },
      update: {},
      create: {
        folio: p.folio,
        nombre: p.nombre,
        telefono: p.tel,
        sucursalId: p.suc,
        producto: p.producto,
        montoEstimado: p.monto,
        etapa: p.etapa as any,
        prioridad: p.prioridad as any,
        ejecutivoId: ejecutivoCRM.id,
        fuente: 'Referido',
        score: Math.floor(Math.random() * 30) + 60,
      },
    });
  }

  console.log(`Prospectos demo creados: ${prospectosData.length}`);
  console.log('\nCRM_CRT seed completado.');
  console.log('\nCuentas demo:');
  console.log('  admin@casaruiz.mx / Admin123!  → ADMINISTRADOR');
  console.log('  crm1@casaruiz.mx / CRM123!     → EJECUTIVO_CRM');
  console.log('  credito1@casaruiz.mx / Cred123! → CREDITO');
  console.log('  cobranza1@casaruiz.mx / Cred123! → COBRANZA');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
