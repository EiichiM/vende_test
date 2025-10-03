import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsPositive,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductCategory, TaxType, UnitType } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop Dell XPS 15',
    description: 'Nombre del producto',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Laptop de alto rendimiento con procesador Intel i7',
    description: 'Descripción detallada del producto',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Precio unitario del producto/servicio (sin impuestos)',
    minimum: 0.01,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser un valor positivo' })
  @Min(0.01, { message: 'El precio mínimo es 0.01' })
  @Transform(({ value }) => parseFloat(value))
  unitPrice: number;

  @ApiProperty({
    example: 'comp-550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la compañía propietaria del producto',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de la compañía es obligatorio' })
  companyId: string;

  @ApiProperty({
    example: 'USD',
    description: 'Moneda del precio',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3, { message: 'La moneda debe tener máximo 3 caracteres' })
  currency?: string = 'USD';

  @ApiProperty({
    example: ProductCategory.PRODUCT,
    description: 'Categoría del producto/servicio',
    enum: ProductCategory,
  })
  @IsEnum(ProductCategory, { message: 'Categoría inválida' })
  category: ProductCategory;

  @ApiProperty({
    example: 'PROD-001',
    description: 'Código interno del producto/servicio',
  })
  @IsString()
  @IsNotEmpty({ message: 'El código del producto es obligatorio' })
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  code: string;

  @ApiProperty({
    example: TaxType.IVA_GENERAL,
    description: 'Tipo de impuesto aplicable',
    enum: TaxType,
    default: TaxType.IVA_GENERAL,
  })
  @IsEnum(TaxType, { message: 'Tipo de impuesto inválido' })
  @IsOptional()
  taxType?: TaxType = TaxType.IVA_GENERAL;

  @ApiProperty({
    example: 21,
    description: 'Porcentaje de impuesto (ej: 21 para IVA general)',
    minimum: 0,
    maximum: 100,
    default: 21,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La tasa de impuesto debe ser un número válido' },
  )
  @Min(0, { message: 'La tasa de impuesto no puede ser negativa' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  taxRate?: number = 21;

  @ApiProperty({
    example: UnitType.UNIT,
    description: 'Tipo de unidad de medida',
    enum: UnitType,
    default: UnitType.UNIT,
  })
  @IsEnum(UnitType, { message: 'Tipo de unidad inválido' })
  @IsOptional()
  unitType?: UnitType = UnitType.UNIT;

  @ApiProperty({
    example: '1234567890123',
    description: 'Código de barras (opcional para productos físicos)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(13, { message: 'El código de barras no puede exceder 13 caracteres' })
  barcode?: string;

  @ApiProperty({
    example: true,
    description: 'Si se debe hacer seguimiento de stock',
    default: false,
  })
  @IsOptional()
  trackStock?: boolean = false;
}