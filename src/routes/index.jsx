import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import MainLayout from '../layouts/MainLayout';
import GlobalBackButton from '../components/common/GlobalBackButton';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import OtpVerification from '../pages/auth/OtpVerification';
import ResetPassword from '../pages/auth/ResetPassword';
import Profile from '../pages/profile/Profile';
import Unauthorized from '../pages/auth/Unauthorized';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';
import ResourceList from '../pages/resource/ResourceList';
import AdminResource from '../pages/admin/AdminResource';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminBookings from '../pages/admin/AdminBookings';
import CreateTicket from '../pages/tickets/CreateTicket';
import MyTickets from '../pages/tickets/MyTickets';
import TicketDetails from '../pages/tickets/TicketDetails';
import AdminTickets from '../pages/admin/AdminTickets';
import AssignedTickets from '../pages/technician/AssignedTickets';
import Notifications from '../pages/notifications/Notifications';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminActivityLogs from '../pages/admin/AdminActivityLogs';
import MyBookings from '../pages/resource/MyBookings';
import VerifyIdentity from '../pages/admin/VerifyIdentity';

const AppRoutes = () => {
  return (
    <Router>
      <ToastProvider>
        <GlobalBackButton />
        <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Main App Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="resources" element={<ResourceList />} />
          <Route path="bookings/my" element={<MyBookings />} />
          <Route path="tickets/create" element={<CreateTicket />} />
          <Route path="tickets/my" element={<MyTickets />} />
          <Route path="tickets/:id" element={<TicketDetails />} />
          <Route path="notifications" element={<Notifications />} />
          <Route 
            path="admin/dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="admin/resources" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminResource />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="admin/users" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="admin/bookings" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminBookings />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="admin/logs" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminActivityLogs />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="admin/tickets" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTickets />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="technician/tickets" 
            element={
              <RoleProtectedRoute allowedRoles={['TECHNICIAN']}>
                <AssignedTickets />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="verify-id/:userId" 
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <VerifyIdentity />
              </RoleProtectedRoute>
            } 
          />
        </Route>

        {/* Catch-all route mapping to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ToastProvider>
    </Router>
  );
};

export default AppRoutes;
