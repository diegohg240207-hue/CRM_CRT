-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('ADMINISTRADOR', 'SUPERVISOR', 'EJECUTIVO_CRM', 'CREDITO', 'COBRANZA');

-- CreateEnum
CREATE TYPE "prioridad" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "etapa_prospecto" AS ENUM ('NO_CONTACTADO', 'CONTACTADO', 'SEGUIMIENTO', 'CIERRE', 'DECLINADO');

-- CreateEnum
CREATE TYPE "tipo_vivienda" AS ENUM ('PROPIA', 'FAMILIAR', 'RENTADA');

-- CreateEnum
CREATE TYPE "nivel_riesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO');

-- CreateEnum
CREATE TYPE "estatus_cliente" AS ENUM ('AL_CORRIENTE', 'MORA_TEMPRANA', 'VENCIDO');

-- CreateEnum
CREATE TYPE "estatus_credito" AS ENUM ('EN_REVISION', 'APROBADO', 'RECHAZADO', 'REQUIERE_AVAL', 'ACTIVO', 'LIQUIDADO');

-- CreateEnum
CREATE TYPE "decision_credito" AS ENUM ('APROBADO', 'REQUIERE_AVAL', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "estatus_cobranza" AS ENUM ('PENDIENTE', 'EN_GESTION', 'PAGADO', 'ACUERDO', 'JURIDICO');

-- CreateEnum
CREATE TYPE "tipo_accion" AS ENUM ('LLAMADA', 'WHATSAPP', 'EMAIL', 'VISITA', 'ACUERDO_PAGO', 'PROMESA_PAGO');

-- CreateEnum
CREATE TYPE "tipo_pago" AS ENUM ('MENSUALIDAD', 'ABONO', 'LIQUIDACION');

-- CreateTable
CREATE TABLE "sucursales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "rol_usuario" NOT NULL,
    "sucursal_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospectos" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "sucursal_id" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "monto_estimado" DECIMAL(12,2) NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "prioridad" "prioridad" NOT NULL DEFAULT 'MEDIA',
    "etapa" "etapa_prospecto" NOT NULL DEFAULT 'NO_CONTACTADO',
    "ejecutivo_id" TEXT NOT NULL,
    "fuente" TEXT,
    "etiquetas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notas" TEXT,
    "dias_en_etapa" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacciones_prospecto" (
    "id" TEXT NOT NULL,
    "prospecto_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resultado" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacciones_prospecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "sucursal_id" TEXT NOT NULL,
    "fecha_vinculacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vivienda" "tipo_vivienda" NOT NULL DEFAULT 'RENTADA',
    "salario_mensual" DECIMAL(12,2) NOT NULL,
    "antiguedad_laboral" INTEGER NOT NULL DEFAULT 0,
    "score_buro" INTEGER NOT NULL DEFAULT 0,
    "score_interno" INTEGER NOT NULL DEFAULT 0,
    "riesgo" "nivel_riesgo" NOT NULL DEFAULT 'MEDIO',
    "estatus" "estatus_cliente" NOT NULL DEFAULT 'AL_CORRIENTE',
    "total_compras" INTEGER NOT NULL DEFAULT 0,
    "ultima_compra" TIMESTAMP(3),
    "proximo_pago" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_credito" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "linea_aprobada" DECIMAL(12,2) NOT NULL,
    "linea_usada" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "linea_disponible" DECIMAL(12,2) NOT NULL,
    "ultimo_aumento" TIMESTAMP(3),
    "prox_revision" TIMESTAMP(3),
    "elegible_aumento" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lineas_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_lineas" (
    "id" TEXT NOT NULL,
    "linea_credito_id" TEXT NOT NULL,
    "monto_anterior" DECIMAL(12,2) NOT NULL,
    "monto_nuevo" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_lineas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditos" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "ejecutivo_id" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "plazo_meses" INTEGER NOT NULL,
    "mensualidad" DECIMAL(12,2) NOT NULL,
    "tasa_interes" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "score_final" INTEGER NOT NULL,
    "riesgo" "nivel_riesgo" NOT NULL,
    "estatus" "estatus_credito" NOT NULL DEFAULT 'EN_REVISION',
    "requiere_aval" BOOLEAN NOT NULL DEFAULT false,
    "motivo_rechazo" TEXT,
    "fecha_aprobacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_scoring" (
    "id" TEXT NOT NULL,
    "credito_id" TEXT NOT NULL,
    "score_buro" INTEGER NOT NULL,
    "pts_buro" INTEGER NOT NULL,
    "vivienda" "tipo_vivienda" NOT NULL,
    "pts_vivienda" INTEGER NOT NULL,
    "salario" DECIMAL(12,2) NOT NULL,
    "pts_salario" INTEGER NOT NULL,
    "capacidad_pago" DECIMAL(5,2) NOT NULL,
    "pts_capacidad" INTEGER NOT NULL,
    "antiguedad_laboral" INTEGER NOT NULL,
    "pts_antiguedad" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "score_final" INTEGER NOT NULL,
    "decision" "decision_credito" NOT NULL,
    "linea_aprobada" DECIMAL(12,2),
    "probabilidad" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_scoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobranza" (
    "id" TEXT NOT NULL,
    "credito_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "ejecutivo_id" TEXT NOT NULL,
    "monto_adeudado" DECIMAL(12,2) NOT NULL,
    "dias_vencido" INTEGER NOT NULL DEFAULT 0,
    "fecha_prox_pago" TIMESTAMP(3),
    "riesgo" "nivel_riesgo" NOT NULL DEFAULT 'BAJO',
    "ultima_accion" TEXT,
    "fecha_ult_accion" TIMESTAMP(3),
    "estatus" "estatus_cobranza" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cobranza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acciones_cobranza" (
    "id" TEXT NOT NULL,
    "cobranza_id" TEXT NOT NULL,
    "tipo" "tipo_accion" NOT NULL,
    "descripcion" TEXT,
    "resultado" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acciones_cobranza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "credito_id" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "tipo" "tipo_pago" NOT NULL DEFAULT 'MENSUALIDAD',
    "referencia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT,
    "datos" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");
CREATE UNIQUE INDEX "prospectos_folio_key" ON "prospectos"("folio");
CREATE UNIQUE INDEX "clientes_folio_key" ON "clientes"("folio");
CREATE UNIQUE INDEX "lineas_credito_cliente_id_key" ON "lineas_credito"("cliente_id");
CREATE UNIQUE INDEX "creditos_folio_key" ON "creditos"("folio");
CREATE UNIQUE INDEX "evaluaciones_scoring_credito_id_key" ON "evaluaciones_scoring"("credito_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prospectos" ADD CONSTRAINT "prospectos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prospectos" ADD CONSTRAINT "prospectos_ejecutivo_id_fkey" FOREIGN KEY ("ejecutivo_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "interacciones_prospecto" ADD CONSTRAINT "interacciones_prospecto_prospecto_id_fkey" FOREIGN KEY ("prospecto_id") REFERENCES "prospectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lineas_credito" ADD CONSTRAINT "lineas_credito_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "historial_lineas" ADD CONSTRAINT "historial_lineas_linea_credito_id_fkey" FOREIGN KEY ("linea_credito_id") REFERENCES "lineas_credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_ejecutivo_id_fkey" FOREIGN KEY ("ejecutivo_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evaluaciones_scoring" ADD CONSTRAINT "evaluaciones_scoring_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "creditos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cobranza" ADD CONSTRAINT "cobranza_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "creditos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cobranza" ADD CONSTRAINT "cobranza_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cobranza" ADD CONSTRAINT "cobranza_ejecutivo_id_fkey" FOREIGN KEY ("ejecutivo_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "acciones_cobranza" ADD CONSTRAINT "acciones_cobranza_cobranza_id_fkey" FOREIGN KEY ("cobranza_id") REFERENCES "cobranza"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "creditos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: Sucursales
INSERT INTO "sucursales" ("id","nombre","region","direccion","telefono","activa","created_at","updated_at") VALUES
  ('suc-monterrey','Monterrey Centro','Noreste','Av. Constitución 123','81-1234-5678',true,NOW(),NOW()),
  ('suc-gdl','Guadalajara','Occidente','Av. Vallarta 456','33-9876-5432',true,NOW(),NOW()),
  ('suc-cdmx','CDMX Norte','Centro','Insurgentes Norte 789','55-5678-1234',true,NOW(),NOW()),
  ('suc-leon','León','Bajío','Blvd. López Mateos 321','47-7890-1234',true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed: Usuarios (passwords: Admin123!, CRM123!, Cred123!)
INSERT INTO "usuarios" ("id","nombre","email","password_hash","rol","sucursal_id","activo","created_at","updated_at") VALUES
  ('u-admin-cr','Administrador Sistema','admin@casaruiz.mx','$2b$10$A3KqoU2hogzFPr4ZoEZ0.O3ju7T0yvaGDLzi4vjc3wtWnkA.zpxrW','ADMINISTRADOR','suc-monterrey',true,NOW(),NOW()),
  ('u-super-cr','Ana García Supervisor','supervisor@casaruiz.mx','$2b$10$A3KqoU2hogzFPr4ZoEZ0.O3ju7T0yvaGDLzi4vjc3wtWnkA.zpxrW','SUPERVISOR','suc-monterrey',true,NOW(),NOW()),
  ('u-crm1-cr','Carlos Mendoza','crm1@casaruiz.mx','$2b$10$CHG9UILOoLdwtpe2NCKEuO.wdnuJq/yUTiX7qhD8qnhiOJBwLIzIe','EJECUTIVO_CRM','suc-monterrey',true,NOW(),NOW()),
  ('u-crm2-cr','María López','crm2@casaruiz.mx','$2b$10$CHG9UILOoLdwtpe2NCKEuO.wdnuJq/yUTiX7qhD8qnhiOJBwLIzIe','EJECUTIVO_CRM','suc-gdl',true,NOW(),NOW()),
  ('u-cred1-cr','Roberto Sánchez','credito1@casaruiz.mx','$2b$10$Xh6ITTVCkHLqwK7Xam5BH.l43pQLMSFWuLR5M1PWXm6XygeKZ8/XW','CREDITO','suc-monterrey',true,NOW(),NOW()),
  ('u-cobr1-cr','Laura Torres','cobranza1@casaruiz.mx','$2b$10$Xh6ITTVCkHLqwK7Xam5BH.l43pQLMSFWuLR5M1PWXm6XygeKZ8/XW','COBRANZA','suc-monterrey',true,NOW(),NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed: Clientes demo
INSERT INTO "clientes" ("id","folio","nombre","telefono","email","sucursal_id","vivienda","salario_mensual","antiguedad_laboral","score_buro","score_interno","riesgo","estatus","total_compras","activo","created_at","updated_at") VALUES
  ('c-0231','C-0231','Alejandra Martínez','81-1234-5678','ale.mtz@email.com','suc-monterrey','PROPIA',22000,5,780,85,'BAJO','AL_CORRIENTE',3,true,NOW(),NOW()),
  ('c-0188','C-0188','José Ramírez','33-8765-4321','jose.ram@email.com','suc-gdl','FAMILIAR',16500,3,650,70,'MEDIO','AL_CORRIENTE',2,true,NOW(),NOW()),
  ('c-0412','C-0412','Patricia Flores','55-5432-1098','pat.flores@email.com','suc-cdmx','RENTADA',14000,2,590,55,'MEDIO','AL_CORRIENTE',1,true,NOW(),NOW()),
  ('c-0307','C-0307','Miguel Ángel Herrera','47-7654-3210','miguel.h@email.com','suc-leon','PROPIA',28000,7,810,85,'BAJO','AL_CORRIENTE',4,true,NOW(),NOW())
ON CONFLICT (folio) DO NOTHING;

-- Seed: Líneas de crédito
INSERT INTO "lineas_credito" ("id","cliente_id","linea_aprobada","linea_usada","linea_disponible","elegible_aumento","created_at","updated_at") VALUES
  ('lc-0231','c-0231',45000,18000,27000,false,NOW(),NOW()),
  ('lc-0188','c-0188',25000,10000,15000,false,NOW(),NOW()),
  ('lc-0412','c-0412',15000,6000,9000,false,NOW(),NOW()),
  ('lc-0307','c-0307',45000,18000,27000,true,NOW(),NOW())
ON CONFLICT (cliente_id) DO NOTHING;

-- Seed: Prospectos demo
INSERT INTO "prospectos" ("id","folio","nombre","telefono","sucursal_id","producto","monto_estimado","etapa","prioridad","ejecutivo_id","fuente","score","created_at","updated_at") VALUES
  ('p-1042','P-1042','Fernando Castillo','81-9999-1111','suc-monterrey','Crédito Personal',15000,'SEGUIMIENTO','ALTA','u-crm1-cr','Referido',75,NOW(),NOW()),
  ('p-1043','P-1043','Diana Vega','33-8888-2222','suc-gdl','Línea Revolvente',8000,'CONTACTADO','MEDIA','u-crm1-cr','Referido',68,NOW(),NOW()),
  ('p-1044','P-1044','Ernesto Ruiz','55-7777-3333','suc-cdmx','Crédito Personal',25000,'NO_CONTACTADO','ALTA','u-crm1-cr','Referido',80,NOW(),NOW()),
  ('p-1045','P-1045','Sofía Morales','47-6666-4444','suc-leon','Micro Crédito',5000,'CIERRE','BAJA','u-crm1-cr','Referido',62,NOW(),NOW())
ON CONFLICT (folio) DO NOTHING;
