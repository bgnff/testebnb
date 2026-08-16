import { Toaster } from "@/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/ProtectedRoute';
import ScrollToTop from '@/ScrollToTop';
import { ThemeProvider } from 'next-themes';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Board from '@/pages/Board';
import Calendar from '@/pages/Calendar';
import TaskList from '@/pages/TaskList';
import Settings from '@/pages/Settings';
import Sales from '@/pages/Sales';
import Styleguide from '@/pages/Styleguide';
import Layout from '@/Layout';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/styleguide" element={<Styleguide />} />
                </Route>
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <Toaster />
      </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App