import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ProductCategory {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  DIGITAL_SERVICE = 'DIGITAL_SERVICE',
  CONSULTATION = 'CONSULTATION',
  RENTAL = 'RENTAL',
  OTHER = 'OTHER',
}

export enum TaxType {
  IVA_GENERAL = 'IVA_GENERAL',
  IVA_REDUCED = 'IVA_REDUCED',
  IVA_SUPER_REDUCED = 'IVA_SUPER_REDUCED',
  IVA_EXEMPT = 'IVA_EXEMPT',
  SPECIAL_TAX = 'SPECIAL_TAX',
}

export enum UnitType {
  UNIT = 'UNIT',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
  METER = 'METER',
  KILOGRAM = 'KILOGRAM',
  LITER = 'LITER',
  PACKAGE = 'PACKAGE',
}

@Entity('products')
export class Product {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del producto',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Laptop Dell XPS 15',
    description: 'Nombre del producto',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    example: 'Laptop de alto rendimiento con procesador Intel i7',
    description: 'Descripción del producto',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    example: 1299.99,
    description: 'Precio unitario sin impuestos',
  })
  @Column({ type: 'real' })
  unitPrice: number;

  @ApiProperty({
    example: 'USD',
    description: 'Moneda del precio',
  })
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({
    example: TaxType.IVA_GENERAL,
    description: 'Tipo de impuesto aplicable',
    enum: TaxType,
  })
  @Column({
    type: 'text',
    default: TaxType.IVA_GENERAL,
  })
  taxType: TaxType;

  @ApiProperty({
    example: 21,
    description: 'Porcentaje de impuesto',
  })
  @Column({ type: 'real', default: 21 })
  taxRate: number;

  @ApiProperty({
    example: UnitType.UNIT,
    description: 'Tipo de unidad de medida',
    enum: UnitType,
  })
  @Column({
    type: 'text',
    default: UnitType.UNIT,
  })
  unitType: UnitType;

  @ApiProperty({
    example: 'PROD-001',
    description: 'Código interno del producto',
  })
  @Column({ length: 50 })
  code: string;

  @ApiProperty({
    example: '1234567890123',
    description: 'Código de barras',
    required: false,
  })
  @Column({ length: 13, nullable: true })
  barcode: string | null;

  @ApiProperty({
    example: true,
    description: 'Si se hace seguimiento de stock',
  })
  @Column({ default: false })
  trackStock: boolean;

  @ApiProperty({
    example: 'comp-550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la compañía propietaria',
  })
  @Column()
  companyId: string;

  @ApiProperty({
    example: ProductStatus.ACTIVE,
    description: 'Estado del producto',
    enum: ProductStatus,
  })
  @Column({
    type: 'text',
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @ApiProperty({
    example: ProductCategory.PRODUCT,
    description: 'Categoría del producto',
    enum: ProductCategory,
  })
  @Column({
    type: 'text',
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  @ApiProperty({
    example: 100,
    description: 'Cantidad en stock',
  })
  @Column({ default: 0 })
  stockQuantity: number;

  @ApiProperty({
    example: 5,
    description: 'Stock mínimo',
  })
  @Column({ default: 0 })
  minimumStock: number;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-10-01T12:30:00Z',
    description: 'Fecha de actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}