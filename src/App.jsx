import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
