import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('companies')
export class Company {
  @ApiProperty({
    example: 'comp-550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único de la compañía',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Tech Solutions Inc.',
    description: 'Nombre de la compañía',
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    example: 'Empresa especializada en soluciones tecnológicas',
    description: 'Descripción de la compañía',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Fecha de creación',
  })
  @CreateDateColumn()
  createdAt: Date;
}