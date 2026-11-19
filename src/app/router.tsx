import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { AppRoot } from './AppRoot'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { SignInPage } from '@/features/auth/pages/SignInPage'
import { CartPage } from '@/features/cart/pages/CartPage'
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage'
import { GiftBuilderPage } from '@/features/gift-builder/pages/GiftBuilderPage'
import { HomePage } from '@/features/home/HomePage'
import { NotFoundPage } from '@/features/home/NotFoundPage'
import { OrdersPage } from '@/features/orders/pages/OrdersPage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { ProductsPage } from '@/features/products/pages/ProductsPage'

// Khu vực Admin (MUI) tải theo nhu cầu để không làm nặng storefront
const AdminLayout = lazy(() =>
  import('@/features/admin/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminProductsPage = lazy(() =>
  import('@/features/admin/products/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
)
const AdminOrdersPage = lazy(() =>
  import('@/features/admin/orders/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
)
const AdminDashboard = lazy(() =>
  import('@/features/admin/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const AdminAnalytics = lazy(() =>
  import('@/features/admin/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)
const AdminCategories = lazy(() =>
  import('@/features/admin/management/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
)
const AdminCustomers = lazy(() =>
  import('@/features/admin/management/CustomersPage').then((m) => ({ default: m.CustomersPage })),
)
const AdminReviews = lazy(() =>
  import('@/features/admin/management/ReviewsPage').then((m) => ({ default: m.ReviewsPage })),
)
const AdminGiftBoxRequests = lazy(() =>
  import('@/features/admin/gift-box-requests/GiftBoxRequestsPage').then((m) => ({ default: m.GiftBoxRequestsPage })),
)

function AdminFallback() {
  return <div className="grid min-h-dvh place-items-center text-muted-foreground">Đang tải…</div>
}

export const appRoutes: RouteObject[] = [
  {
    element: <AppRoot />,
    children: [
      {
        element: <StoreLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: 'builder', element: <GiftBuilderPage /> },
          { path: 'signin', element: <SignInPage /> },
          { path: 'register', element: <RegisterPage /> },
          {
            // Giỏ hàng, thanh toán và đơn hàng thuộc về từng tài khoản nên cần đăng nhập.
            element: <RequireAuth reason="Vui lòng đăng nhập để tiếp tục." />,
            children: [
              { path: 'cart', element: <CartPage /> },
              { path: 'checkout', element: <CheckoutPage /> },
              { path: 'orders', element: <OrdersPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: 'admin',
        element: (
          <RequireAuth role="ROLE_ADMIN" reason="Vui lòng đăng nhập bằng tài khoản quản trị.">
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <Suspense fallback={null}><AdminDashboard /></Suspense> },
          { path: 'analytics', element: <Suspense fallback={null}><AdminAnalytics /></Suspense> },
          { path: 'categories', element: <Suspense fallback={null}><AdminCategories /></Suspense> },
          { path: 'customers', element: <Suspense fallback={null}><AdminCustomers /></Suspense> },
          { path: 'reviews', element: <Suspense fallback={null}><AdminReviews /></Suspense> },
          { path: 'gift-box-requests', element: <Suspense fallback={null}><AdminGiftBoxRequests /></Suspense> },
          { path: 'products', element: <Suspense fallback={null}><AdminProductsPage /></Suspense> },
          { path: 'orders', element: <Suspense fallback={null}><AdminOrdersPage /></Suspense> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(appRoutes)
