import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { Product } from './modules/products/entities/product.entity';
import { Company } from './modules/companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.NODE_ENV === 'test' ? ':memory:' : 'database.sqlite',
      entities: [Product, Company],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    ProductsModule,
    CompaniesModule,
  ],
})
export class AppModule {}