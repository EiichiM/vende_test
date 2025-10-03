// Script para crear datos de prueba
// Ejecutar en el navegador (consola) en http://localhost:5174

async function createTestProducts() {
  const baseUrl = 'http://localhost:3000'
  
  const products = [
    {
      name: 'Laptop Dell XPS 15',
      description: 'Laptop de alto rendimiento con procesador Intel i7',
      price: 1299.99,
      currency: 'USD',
      companyId: 'comp-550e8400-e29b-41d4-a716-446655440000',
      category: 'ELECTRONICS',
      stockQuantity: 10
    },
    {
      name: 'iPhone 15 Pro',
      description: 'El último iPhone con cámara profesional',
      price: 999.99,
      currency: 'USD',
      companyId: 'comp-660e8400-e29b-41d4-a716-446655440001',
      category: 'ELECTRONICS',
      stockQuantity: 25
    },
    {
      name: 'Silla Ergonómica',
      description: 'Silla de oficina con soporte lumbar ajustable',
      price: 299.99,
      currency: 'USD',
      companyId: 'comp-770e8400-e29b-41d4-a716-446655440002',
      category: 'HOME_GARDEN',
      stockQuantity: 15
    }
  ]
  
  for (const product of products) {
    try {
      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      })
      
      if (response.ok) {
        const created = await response.json()
        console.log('✅ Producto creado:', created.name)
      } else {
        console.log('❌ Error creando producto:', product.name, await response.text())
      }
    } catch (error) {
      console.log('❌ Error de red:', error)
    }
  }
  
  // Verificar productos creados
  try {
    const response = await fetch(`${baseUrl}/products`)
    const data = await response.json()
    console.log('📦 Total productos:', data.total)
    console.log('📋 Productos:', data.products)
  } catch (error) {
    console.log('❌ Error obteniendo productos:', error)
  }
}

createTestProducts()