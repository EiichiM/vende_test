import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear producto',
    description: 'Crea un nuevo producto',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Producto creado correctamente',
    type: Product,
  })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return await this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar productos',
    description: 'Devuelve todos los productos o los de una compañía específica',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'ID de la compañía para filtrar productos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos',
    type: [Product],
  })
  async findAll(
    @Query('companyId') companyId?: string,
  ): Promise<Product[]> {
    if (companyId) {
      return await this.productsService.findByCompany(companyId);
    }
    return await this.productsService.findAll();
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar productos',
    description: 'Busca productos por nombre',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Término de búsqueda',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Productos encontrados',
    type: [Product],
  })
  async searchByName(
    @Query('q') searchTerm: string,
    @Query('companyId') companyId?: string,
  ): Promise<Product[]> {
    return await this.productsService.search(searchTerm, companyId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Ver producto',
    description: 'Obtiene un producto por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado',
    type: Product,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar producto',
    description: 'Modifica un producto existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto a actualizar',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado',
    type: Product,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar producto',
    description: 'Borra un producto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a eliminar',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Producto eliminado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}