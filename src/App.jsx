import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import ClientLayout from './components/layout/ClientLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/system/UsersPage';
import RolesPage from './pages/admin/system/RolesPage';
import PermissionsPage from './pages/admin/system/PermissionsPage';
import CategoriesPage from './pages/admin/system/CategoriesPage';
import BannersPage from './pages/admin/system/BannersPage';
import NotificationsPage from './pages/admin/system/NotificationsPage';
import SchedulePage from './pages/admin/system/SchedulePage';
import CertificatesPage from './pages/admin/catalog/CertificatesPage';
import SubjectsPage from './pages/admin/catalog/SubjectsPage';
import ClassroomsPage from './pages/admin/catalog/ClassroomsPage';
import UnitsPage from './pages/admin/catalog/UnitsPage';
import CertificateClassesPage from './pages/admin/classes/CertificateClassesPage';
import ActivityClassPage from './pages/admin/classes/ActivityClassPage';
import CourseClassesPage from './pages/admin/classes/CourseClassesPage';
import ExamSessionsPage from './pages/admin/exam/ExamSessionsPage';
import ExamRegistrationPage from './pages/admin/exam/ExamRegistrationPage';
import ExamPaidListPage from './pages/admin/exam/ExamPaidListPage';
import ExamRoomPage from './pages/admin/exam/ExamRoomPage';
import ExamScoresPage from './pages/admin/exam/ExamScoresPage';
import InstructorsPage from './pages/admin/payment/InstructorsPage';
import PaymentRatesPage from './pages/admin/payment/PaymentRatesPage';
import ContractsPage from './pages/admin/payment/ContractsPage';
import PaymentSessionsPage from './pages/admin/payment/PaymentSessionsPage';
import TuitionPaymentPage from './pages/admin/payment/TuitionPaymentPage';
import RegistrationStatsPage from './pages/admin/reports/RegistrationStatsPage';
import FeeReportPage from './pages/admin/reports/FeeReportPage';
import DeletedTuitionReceipts from './pages/admin/reports/DeletedTuitionReceipts';
import DeletedFeeReceipts from './pages/admin/reports/DeletedFeeReceipts';
import TuitionBySessionPage from './pages/admin/reports/TuitionBySessionPage';
import ExamListReportPage from './pages/admin/reports/ExamListReportPage';
import SettingsPage from './pages/admin/settings/SettingsPage';
import OnlineRegistrationPage from './pages/admin/online/OnlineRegistrationPage';
import OnlineExamRegistrationPage from './pages/admin/online/OnlineExamRegistrationPage';

// Client pages
import HomePage from './pages/client/HomePage';
import AboutPage from './pages/client/AboutPage';
import NoticesPage from './pages/client/NoticesPage';
import LookupPage from './pages/client/LookupPage';
import RegisterPage from './pages/client/RegisterPage';
import ContactPage from './pages/client/ContactPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isStaff } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <span className="loading-spinner" style={{ width: 32, height: 32 }}></span>
        <div style={{ color: 'var(--text-tertiary)' }}>Đang tải dữ liệu phiên làm việc...</div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isStaff) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Client Portal */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/thong-bao" element={<NoticesPage />} />
        <Route path="/tra-cuu" element={<LookupPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>

      {/* Admin Panel */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />

        {/* System */}
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="schedule" element={<SchedulePage />} />

        {/* Catalog */}
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="units" element={<UnitsPage />} />

        {/* Classes */}
        <Route path="certificate-classes" element={<CertificateClassesPage />} />
        <Route path="activity-class" element={<ActivityClassPage />} />
        <Route path="course-classes" element={<CourseClassesPage />} />

        {/* Exam */}
        <Route path="exam-sessions" element={<ExamSessionsPage />} />
        <Route path="exam-registration" element={<ExamRegistrationPage />} />
        <Route path="exam-paid" element={<ExamPaidListPage />} />
        <Route path="exam-rooms" element={<ExamRoomPage />} />
        <Route path="exam-scores" element={<ExamScoresPage />} />

        {/* Payment */}
        <Route path="instructors" element={<InstructorsPage />} />
        <Route path="payment-rates" element={<PaymentRatesPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="payment-sessions" element={<PaymentSessionsPage />} />
        <Route path="tuition-payment" element={<TuitionPaymentPage />} />

        {/* Reports */}
        <Route path="report-registration" element={<RegistrationStatsPage />} />
        <Route path="report-fees" element={<FeeReportPage />} />
        <Route path="report-deleted-tuition" element={<DeletedTuitionReceipts />} />
        <Route path="report-deleted-fees" element={<DeletedFeeReceipts />} />
        <Route path="report-tuition-session" element={<TuitionBySessionPage />} />
        <Route path="report-exam-list" element={<ExamListReportPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Online */}
        <Route path="online-registration" element={<OnlineRegistrationPage />} />
        <Route path="online-exam" element={<OnlineExamRegistrationPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
