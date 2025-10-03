-- Inicialización de la base de datos para Vende - Sistema de Facturación
-- Este archivo se ejecuta automáticamente al crear el contenedor de PostgreSQL
-- Estructura optimizada para gestión fiscal y facturación española

-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear tabla de compañías
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales de compañías
INSERT INTO companies (id, name, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Tech Solutions Inc.', 'Empresa especializada en soluciones tecnológicas', '2023-01-15T10:00:00Z'),
('660e8400-e29b-41d4-a716-446655440001', 'Digital Innovations Corp.', 'Corporación líder en innovación digital', '2023-02-20T10:00:00Z'),
('770e8400-e29b-41d4-a716-446655440002', 'Future Systems Ltd.', 'Sistemas del futuro para empresas modernas', '2023-03-10T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Crear tabla de productos (Sistema de Facturación)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    currency VARCHAR(3) DEFAULT 'EUR',
    company_id VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'PRODUCT' CHECK (category IN ('PRODUCT', 'SERVICE', 'DIGITAL_SERVICE', 'CONSULTATION', 'RENTAL', 'OTHER')),
    unit_type VARCHAR(20) DEFAULT 'UNIT' CHECK (unit_type IN ('UNIT', 'HOUR', 'DAY', 'MONTH', 'METER', 'KILOGRAM', 'LITER', 'PACKAGE')),
    tax_type VARCHAR(30) DEFAULT 'IVA_GENERAL' CHECK (tax_type IN ('IVA_GENERAL', 'IVA_REDUCED', 'IVA_SUPER_REDUCED', 'IVA_EXEMPT', 'SPECIAL_TAX')),
    tax_rate DECIMAL(5,2) DEFAULT 21.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    code VARCHAR(50) NOT NULL,
    barcode VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED')),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    minimum_stock INTEGER DEFAULT 0 CHECK (minimum_stock >= 0),
    track_stock BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, company_id),
    UNIQUE(name, company_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_tax_type ON products(tax_type);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para productos (Sistema de Facturación)
INSERT INTO products (
    id, name, description, unit_price, currency, company_id, 
    category, unit_type, tax_type, tax_rate, code, barcode, 
    status, stock_quantity, minimum_stock, track_stock, created_at, updated_at
) VALUES
-- Productos físicos
('prod-550e8400-e29b-41d4-a716-446655440000', 'Laptop Dell XPS 15', 'Laptop de alto rendimiento con procesador Intel i7', 1299.99, 'EUR', '550e8400-e29b-41d4-a716-446655440000', 'PRODUCT', 'UNIT', 'IVA_GENERAL', 21.00, 'DELL-XPS15-001', '8412345678901', 'ACTIVE', 5, 2, true, NOW(), NOW()),
('prod-660e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro', 'Smartphone premium con chip A17 Pro', 999.99, 'EUR', '660e8400-e29b-41d4-a716-446655440001', 'PRODUCT', 'UNIT', 'IVA_GENERAL', 21.00, 'APPLE-IP15P-001', '8412345678902', 'ACTIVE', 10, 3, true, NOW(), NOW()),
('prod-770e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S24', 'Smartphone Android de última generación', 899.99, 'EUR', '770e8400-e29b-41d4-a716-446655440002', 'PRODUCT', 'UNIT', 'IVA_GENERAL', 21.00, 'SAMSUNG-GS24-001', '8412345678903', 'ACTIVE', 8, 2, true, NOW(), NOW()),
('prod-880e8400-e29b-41d4-a716-446655440003', 'MacBook Air M3', 'Laptop ultradelgada con chip M3 de Apple', 1199.99, 'EUR', '550e8400-e29b-41d4-a716-446655440000', 'PRODUCT', 'UNIT', 'IVA_GENERAL', 21.00, 'APPLE-MBA-M3-001', '8412345678904', 'ACTIVE', 3, 1, true, NOW(), NOW()),

-- Servicios
('serv-550e8400-e29b-41d4-a716-446655440004', 'Consultoría Tecnológica', 'Servicios de consultoría en transformación digital', 120.00, 'EUR', '550e8400-e29b-41d4-a716-446655440000', 'CONSULTATION', 'HOUR', 'IVA_GENERAL', 21.00, 'CONSULT-TECH-001', NULL, 'ACTIVE', 0, 0, false, NOW(), NOW()),
('serv-660e8400-e29b-41d4-a716-446655440005', 'Soporte Técnico Premium', 'Soporte técnico especializado 24/7', 80.00, 'EUR', '660e8400-e29b-41d4-a716-446655440001', 'SERVICE', 'HOUR', 'IVA_GENERAL', 21.00, 'SUPPORT-PREM-001', NULL, 'ACTIVE', 0, 0, false, NOW(), NOW()),
('serv-770e8400-e29b-41d4-a716-446655440006', 'Desarrollo de Software', 'Servicios de desarrollo de aplicaciones personalizadas', 150.00, 'EUR', '770e8400-e29b-41d4-a716-446655440002', 'DIGITAL_SERVICE', 'HOUR', 'IVA_GENERAL', 21.00, 'DEV-SOFT-001', NULL, 'ACTIVE', 0, 0, false, NOW(), NOW()),

-- Productos con IVA reducido
('prod-990e8400-e29b-41d4-a716-446655440007', 'Manual de Usuario Impreso', 'Documentación técnica impresa', 25.00, 'EUR', '550e8400-e29b-41d4-a716-446655440000', 'PRODUCT', 'UNIT', 'IVA_REDUCED', 10.00, 'MANUAL-001', '8412345678905', 'ACTIVE', 50, 10, true, NOW(), NOW()),
('prod-990e8400-e29b-41d4-a716-446655440008', 'Licencia Software Educativo', 'Licencia de software para uso educativo', 199.99, 'EUR', '660e8400-e29b-41d4-a716-446655440001', 'DIGITAL_SERVICE', 'UNIT', 'IVA_REDUCED', 10.00, 'LIC-EDU-001', NULL, 'ACTIVE', 100, 20, false, NOW(), NOW())

ON CONFLICT (code, company_id) DO NOTHING;