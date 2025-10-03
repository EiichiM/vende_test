import { Injectable } from '@nestjs/common';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  private companies: Company[] = [
    {
      id: 'comp-550e8400-e29b-41d4-a716-446655440000',
      name: 'Tech Solutions Inc.',
      description: 'Empresa especializada en soluciones tecnológicas',
      createdAt: new Date('2023-01-15'),
    },
    {
      id: 'comp-660e8400-e29b-41d4-a716-446655440001',
      name: 'Digital Innovations Corp.',
      description: 'Corporación líder en innovación digital',
      createdAt: new Date('2023-02-20'),
    },
    {
      id: 'comp-770e8400-e29b-41d4-a716-446655440002',
      name: 'Future Systems Ltd.',
      description: 'Sistemas del futuro para empresas modernas',
      createdAt: new Date('2023-03-10'),
    },
  ];

  /**
   * Obtener todas las compañías
   */
  async findAll(): Promise<Company[]> {
    return this.companies;
  }

  /**
   * Obtener una compañía por ID
   */
  async findOne(id: string): Promise<Company | undefined> {
    return this.companies.find(company => company.id === id);
  }

  /**
   * Verificar si existe una compañía
   */
  async exists(id: string): Promise<boolean> {
    return this.companies.some(company => company.id === id);
  }
}