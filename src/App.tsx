import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/AuthContext';

// Pages - User
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Payment } from './pages/Payment';
import { Membership } from './pages/Membership';
import { Dashboard } from './pages/Dashboard';
import { Features as FeaturesPage } from './pages/Features';
import TestimonialsPage from './pages/Testimonials';
import Contact from './pages/Contact';

// Pages - Admin
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminMembership } from './pages/admin/AdminMembership';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPoints } from './pages/admin/AdminPoints';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLayout } from './components/AdminLayout';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

// 路由守卫 - 用户
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// 路由守卫 - 管理员
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const adminToken = localStorage.getItem('admin-token');
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

// 首页组件
function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F0FC]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首页/落地页 */}
        <Route path="/" element={<HomePage />} />

        {/* 功能介绍页面 */}
        <Route path="/features" element={<FeaturesPage />} />

        {/* 用户评价页面 */}
        <Route path="/testimonials" element={<TestimonialsPage />} />

        {/* 联系客服页面 */}
        <Route path="/contact" element={<Contact />} />

        {/* 认证页面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 法律页面 */}
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* 支付页面 */}
        <Route path="/payment" element={<Payment />} />

        {/* 会员页面 */}
        <Route path="/membership" element={<Membership />} />
        <Route path="/payment" element={<Payment />} />

        {/* 受保护的论文助手界面 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 管理员登录 */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 管理员页面 - 受保护 */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="membership" element={<AdminMembership />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="points" element={<AdminPoints />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
