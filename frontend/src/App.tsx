import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Settings } from './pages/Settings';
import { CompanyDetails } from './pages/CompanyDetails';
<<<<<<< HEAD
import { Plans } from './pages/Plans';
=======
import { Admins } from './pages/Admins';
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetails />} />
<<<<<<< HEAD
          <Route path="/plans" element={<Plans />} />
=======
          <Route path="/admins" element={<Admins />} />
>>>>>>> 040bfc5ec9da160283e5d6302990ca2e0ff0e350
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
