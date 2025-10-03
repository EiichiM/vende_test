import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas las compañías',
    description: 'Obtiene una lista de todas las compañías disponibles en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de compañías obtenida exitosamente',
    type: [Company],
  })
  async findAll(): Promise<Company[]> {
    return await this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener una compañía por ID',
    description: 'Obtiene los detalles de una compañía específica por su ID único.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la compañía',
    example: 'comp-550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Compañía encontrada exitosamente',
    type: Company,
  })
  @ApiResponse({
    status: 404,
    description: 'Compañía no encontrada',
  })
  async findOne(@Param('id') id: string): Promise<Company> {
    const company = await this.companiesService.findOne(id);
    if (!company) {
      throw new Error('Compañía no encontrada');
    }
    return company;
  }
}