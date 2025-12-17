import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Banner from './Banner';
import WhatsAppButton from './WhatsAppButton';
import { 
  LayoutDashboard, 
  Users, 
  LogOut,
  ChevronRight,
  Building2,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';

const Layout = () => {
  const { user, logout, isAdmin, isAsesor, isCliente } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Usuarios', icon: Users },
      ];
    }
    if (isAsesor) {
      return [
        { path: '/asesor', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/asesor/empresas', label: 'Empresas', icon: Building2 },
      ];
    }
    if (isCliente) {
      return [
        { path: '/cliente', label: 'Mi Panel', icon: LayoutDashboard },
      ];
    }
    return [];
  };

  const navItems = getNavItems();
  const roleLabel = isAdmin ? 'Administrador' : isAsesor ? 'Asesor' : 'Cliente';
  const roleColor = isAdmin ? 'bg-red-100 text-red-800' : isAsesor ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';

  const isActiveRoute = (path) => {
    if (path === '/asesor' && location.pathname === '/asesor') return true;
    if (path === '/asesor/empresas' && location.pathname.startsWith('/asesor/empresas')) return true;
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path === '/admin/users' && location.pathname.startsWith('/admin/users')) return true;
    if (path === '/cliente' && location.pathname.startsWith('/cliente')) return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Banner />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-[42px] bottom-0 w-64 bg-white border-r border-slate-200 z-40 flex flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-[#0f172a]">Espacio de Datos</h1>
          <p className="text-xs text-[#64748b] mt-1">Gestión de Subvenciones</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#fbeff3] flex items-center justify-center">
              <span className="text-[#8b1530] font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0f172a] truncate">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#fbeff3] text-[#8b1530]' 
                    : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={handleLogout}
            data-testid="logout-button"
            className="w-full justify-start gap-3 text-[#64748b] hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-[42px] min-h-screen">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
};

export default Layout;
