import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductCategory, ProductStatus, TaxType, UnitType } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct: Product = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Product',
    description: 'Test Description',
    unitPrice: 99.99,
    currency: 'USD',
    taxType: TaxType.IVA_GENERAL,
    taxRate: 21,
    unitType: UnitType.UNIT,
    code: 'TEST-001',
    barcode: null,
    trackStock: false,
    companyId: 'company-123',
    status: ProductStatus.ACTIVE,
    category: ProductCategory.PRODUCT,
    stockQuantity: 10,
    minimumStock: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByCompany: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        unitPrice: 149.99,
        currency: 'USD',
        taxType: TaxType.IVA_GENERAL,
        taxRate: 21,
        unitType: UnitType.UNIT,
        code: 'NEW-001',
        companyId: 'company-456',
        category: ProductCategory.PRODUCT,
      };

      mockProductsService.create.mockResolvedValue({ ...mockProduct, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toEqual(expect.objectContaining({ name: 'New Product' }));
      expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(result).toEqual(products);
      expect(mockProductsService.findAll).toHaveBeenCalled();
    });

    it('should return products by company', async () => {
      const products = [mockProduct];
      mockProductsService.findByCompany.mockResolvedValue(products);

      const result = await controller.findAll('company-123');

      expect(result).toEqual(products);
      expect(mockProductsService.findByCompany).toHaveBeenCalledWith('company-123');
    });
  });

  describe('searchByName', () => {
    it('should search products by name', async () => {
      const products = [mockProduct];
      mockProductsService.search.mockResolvedValue(products);

      const result = await controller.searchByName('test');

      expect(result).toEqual(products);
      expect(mockProductsService.search).toHaveBeenCalledWith('test', undefined);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('550e8400-e29b-41d4-a716-446655440000', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove('550e8400-e29b-41d4-a716-446655440000');

      expect(mockProductsService.remove).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});