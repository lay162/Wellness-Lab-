import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import DevModeBanner from './components/dev/DevModeBanner'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { RouteLoader } from './components/ui/Skeleton'

import PublicLayout from './components/public/PublicLayout'
import PortalLayout, { PortalAuthLayout } from './components/portal/PortalLayout'
import AdminLayout from './components/admin/AdminLayout'

// Public pages — eager loaded for instant header navigation
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import WellnessPage from './pages/public/WellnessPage'
import HowItWorksPage from './pages/public/HowItWorksPage'
import SuccessStoriesPage from './pages/public/SuccessStoriesPage'
import ReviewsPage from './pages/public/ReviewsPage'
import BlogPage from './pages/public/BlogPage'
import BlogPostPage from './pages/public/BlogPostPage'
import AftercarePage from './pages/public/AftercarePage'
import FAQsPage from './pages/public/FAQsPage'
import ContactPage from './pages/public/ContactPage'
import DownloadAppPage from './pages/public/DownloadAppPage'
import LegalPage from './pages/public/LegalPage'

// Portal & admin — lazy loaded (not linked from public header)
const LoginPage = lazy(() => import('./pages/portal/LoginPage'))
const RegisterPage = lazy(() => import('./pages/portal/RegisterPage'))
const PendingPage = lazy(() => import('./pages/portal/PendingPage'))
const AccessDeniedPage = lazy(() => import('./pages/portal/PendingPage').then(m => ({ default: m.AccessDeniedPage })))
const DashboardPage = lazy(() => import('./pages/portal/DashboardPage'))
const CataloguePage = lazy(() => import('./pages/portal/CataloguePage'))
const ProductPage = lazy(() => import('./pages/portal/ProductPage'))
const CartPage = lazy(() => import('./pages/portal/CartPage'))
const OrdersPage = lazy(() => import('./pages/portal/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/portal/OrderDetailPage'))
const ProfilePage = lazy(() => import('./pages/portal/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/portal/SettingsPage'))
const ChangePasswordPage = lazy(() => import('./pages/portal/ChangePasswordPage'))
const PrivateReviewsPage = lazy(() => import('./pages/portal/PrivateContentPages').then(m => ({ default: m.PrivateReviewsPage })))
const PrivateSuccessStoriesPage = lazy(() => import('./pages/portal/PrivateContentPages').then(m => ({ default: m.PrivateSuccessStoriesPage })))
const PrivateAftercarePage = lazy(() => import('./pages/portal/PrivateContentPages').then(m => ({ default: m.PrivateAftercarePage })))
const PrivateAdvicePage = lazy(() => import('./pages/portal/PrivateContentPages').then(m => ({ default: m.PrivateAdvicePage })))

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminEarnings = lazy(() => import('./pages/admin/AdminEarnings'))
const AdminWebsite = lazy(() => import('./pages/admin/AdminWebsite'))
const AdminBlog = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminBlog })))
const AdminReviews = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminReviews })))
const AdminSuccessStories = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminSuccessStories })))
const AdminAftercare = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminAftercare })))
const AdminSettings = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminSettings })))
const AdminLegal = lazy(() => import('./pages/admin/AdminContent').then(m => ({ default: m.AdminLegal })))
const AdminPageContent = lazy(() => import('./pages/admin/AdminSitePages').then(m => ({ default: m.AdminPageContent })))
const AdminFAQs = lazy(() => import('./pages/admin/AdminSitePages').then(m => ({ default: m.AdminFAQs })))
const AdminWellnessAdvice = lazy(() => import('./pages/admin/AdminSitePages').then(m => ({ default: m.AdminWellnessAdvice })))

function Lazy({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>
}

function LegacyProductRedirect() {
  const { id } = useParams()
  return <Navigate to={`/private-portal/shop/product/${id}`} replace />
}

const toastOptions = {
  duration: 4000,
  style: {
    borderRadius: '12px',
    background: '#1A1A2E',
    color: '#fff',
    fontSize: '14px',
    padding: '12px 16px',
  },
  success: { iconTheme: { primary: '#40916C', secondary: '#fff' } },
  error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={toastOptions} />
            <DevModeBanner />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="wellness" element={<WellnessPage />} />
                <Route path="how-it-works" element={<HowItWorksPage />} />
                <Route path="success-stories" element={<SuccessStoriesPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogPostPage />} />
                <Route path="aftercare" element={<AftercarePage />} />
                <Route path="faqs" element={<FAQsPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="get-app" element={<DownloadAppPage />} />
                <Route path="shop" element={<Lazy><CataloguePage /></Lazy>} />
                <Route path="shop/product/:id" element={<Lazy><ProductPage /></Lazy>} />
                <Route path="shop/cart" element={<Lazy><CartPage /></Lazy>} />
                <Route path="privacy-policy" element={<LegalPage slug="privacy-policy" />} />
                <Route path="terms-and-conditions" element={<LegalPage slug="terms-and-conditions" />} />
                <Route path="cookies" element={<LegalPage slug="cookies" />} />
                <Route path="legal-disclaimer" element={<LegalPage slug="legal-disclaimer" />} />
                <Route path="compliance" element={<LegalPage slug="compliance" />} />
              </Route>

              <Route path="private-portal/invite/:token" element={<Navigate to="/businesscard" replace />} />
              <Route path="card" element={<Navigate to="/businesscard" replace />} />
              <Route path="card/*" element={<Navigate to="/businesscard" replace />} />
              <Route path="BusinessCard" element={<Navigate to="/businesscard" replace />} />
              <Route path="BusinessCard/" element={<Navigate to="/businesscard" replace />} />
              <Route path="BusinessCard/*" element={<Navigate to="/businesscard" replace />} />
              <Route path="private-portal/change-password" element={<Lazy><ProtectedRoute requireAuth allowPasswordChange><ChangePasswordPage /></ProtectedRoute></Lazy>} />

              <Route path="private-portal" element={<PortalAuthLayout />}>
                <Route path="login" element={<Lazy><GuestRoute><LoginPage /></GuestRoute></Lazy>} />
                <Route path="register" element={<Lazy><GuestRoute><RegisterPage /></GuestRoute></Lazy>} />
                <Route path="pending" element={<Lazy><ProtectedRoute requireAuth><PendingPage /></ProtectedRoute></Lazy>} />
                <Route path="access-denied" element={<Lazy><ProtectedRoute requireAuth><AccessDeniedPage /></ProtectedRoute></Lazy>} />
              </Route>

              <Route path="private-portal" element={<ProtectedRoute requireApproved><PortalLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Lazy><DashboardPage /></Lazy>} />
                <Route path="shop" element={<Lazy><CataloguePage portal /></Lazy>} />
                <Route path="shop/product/:id" element={<Lazy><ProductPage portal /></Lazy>} />
                <Route path="shop/cart" element={<Lazy><CartPage portal /></Lazy>} />
                <Route path="catalogue" element={<Navigate to="/private-portal/shop" replace />} />
                <Route path="product/:id" element={<LegacyProductRedirect />} />
                <Route path="cart" element={<Navigate to="/private-portal/shop/cart" replace />} />
                <Route path="orders" element={<Lazy><OrdersPage /></Lazy>} />
                <Route path="order/:id" element={<Lazy><OrderDetailPage /></Lazy>} />
                <Route path="profile" element={<Lazy><ProfilePage /></Lazy>} />
                <Route path="settings" element={<Lazy><SettingsPage /></Lazy>} />
                <Route path="private-reviews" element={<Lazy><PrivateReviewsPage /></Lazy>} />
                <Route path="private-success-stories" element={<Lazy><PrivateSuccessStoriesPage /></Lazy>} />
                <Route path="private-aftercare" element={<Lazy><PrivateAftercarePage /></Lazy>} />
                <Route path="private-advice" element={<Lazy><PrivateAdvicePage /></Lazy>} />
              </Route>

              <Route path="private-admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Lazy><AdminDashboard /></Lazy>} />
                <Route path="customers" element={<Lazy><AdminCustomers /></Lazy>} />
                <Route path="team" element={<Lazy><AdminStaff /></Lazy>} />
                <Route path="products" element={<Lazy><AdminProducts /></Lazy>} />
                <Route path="orders" element={<Lazy><AdminOrders /></Lazy>} />
                <Route path="earnings" element={<Lazy><AdminEarnings /></Lazy>} />
                <Route path="website" element={<Lazy><AdminWebsite /></Lazy>} />
                <Route path="website/blog" element={<Lazy><AdminBlog /></Lazy>} />
                <Route path="website/reviews" element={<Lazy><AdminReviews /></Lazy>} />
                <Route path="website/success-stories" element={<Lazy><AdminSuccessStories /></Lazy>} />
                <Route path="website/aftercare" element={<Lazy><AdminAftercare /></Lazy>} />
                <Route path="website/pages" element={<Lazy><AdminPageContent /></Lazy>} />
                <Route path="website/faqs" element={<Lazy><AdminFAQs /></Lazy>} />
                <Route path="website/wellness-advice" element={<Lazy><AdminWellnessAdvice /></Lazy>} />
                <Route path="website/legal" element={<Lazy><AdminLegal /></Lazy>} />
                <Route path="blog" element={<Navigate to="/private-admin/website/blog" replace />} />
                <Route path="reviews" element={<Navigate to="/private-admin/website/reviews" replace />} />
                <Route path="success-stories" element={<Navigate to="/private-admin/website/success-stories" replace />} />
                <Route path="aftercare" element={<Navigate to="/private-admin/website/aftercare" replace />} />
                <Route path="legal" element={<Navigate to="/private-admin/website/legal" replace />} />
                <Route path="settings" element={<Lazy><AdminSettings /></Lazy>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
