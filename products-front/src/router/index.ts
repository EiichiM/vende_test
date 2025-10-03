import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      redirect: '/products'
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: 'products',
          name: 'ProductList',
          component: () => import('@/views/ProductListView.vue'),
          meta: {
            title: 'Lista de Productos'
          }
        },
        {
          path: 'products/new',
          name: 'ProductCreate',
          component: () => import('@/views/ProductFormView.vue'),
          meta: {
            title: 'Crear Producto'
          }
        },
        {
          path: 'products/:id/edit',
          name: 'ProductEdit',
          component: () => import('@/views/ProductFormView.vue'),
          meta: {
            title: 'Editar Producto'
          }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/products'
    }
  ]
})

// Middleware para títulos de página
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Vende Products`
  }
  next()
})

export default router