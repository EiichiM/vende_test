import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { ProductCategory, ProductStatus, TaxType, UnitType } from '../entities/product.entity';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    example: 'Laptop Dell XPS 15 - Edición 2024',
    description: 'Nombre actualizado del producto',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'Laptop de alto rendimiento con procesador Intel i7 de 12va generación',
    description: 'Descripción actualizada del producto',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 1399.99,
    description: 'Precio unitario actualizado del producto (sin impuestos)',
  })
  unitPrice?: number;

  @ApiPropertyOptional({
    example: 'comp-660e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la nueva compañía propietaria',
  })
  companyId?: string;

  @ApiPropertyOptional({
    example: ProductCategory.PRODUCT,
    description: 'Nueva categoría del producto/servicio',
    enum: ProductCategory,
  })
  @IsEnum(ProductCategory, { message: 'Categoría inválida' })
  @IsOptional()
  category?: ProductCategory;

  @ApiPropertyOptional({
    example: 'PROD-001-UPD',
    description: 'Código actualizado del producto',
  })
  code?: string;

  @ApiPropertyOptional({
    example: TaxType.IVA_REDUCED,
    description: 'Tipo de impuesto actualizado',
    enum: TaxType,
  })
  @IsEnum(TaxType, { message: 'Tipo de impuesto inválido' })
  @IsOptional()
  taxType?: TaxType;

  @ApiPropertyOptional({
    example: 10,
    description: 'Porcentaje de impuesto actualizado',
  })
  taxRate?: number;

  @ApiPropertyOptional({
    example: UnitType.HOUR,
    description: 'Tipo de unidad de medida actualizado',
    enum: UnitType,
  })
  @IsEnum(UnitType, { message: 'Tipo de unidad inválido' })
  @IsOptional()
  unitType?: UnitType;

  @ApiPropertyOptional({
    example: '1234567890124',
    description: 'Código de barras actualizado',
  })
  barcode?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Actualizar seguimiento de stock',
  })
  trackStock?: boolean;

  @ApiPropertyOptional({
    example: ProductStatus.ACTIVE,
    description: 'Estado actualizado del producto',
    enum: ProductStatus,
  })
  @IsEnum(ProductStatus, { message: 'Estado del producto inválido' })
  @IsOptional()
  status?: ProductStatus;
}