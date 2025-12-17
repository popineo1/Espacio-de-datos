import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield,
  Briefcase,
  User,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    asesores: 0,
    clientes: 0,
    pending: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = response.data;
        setStats({
          total: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          asesores: users.filter(u => u.role === 'asesor').length,
          clientes: users.filter(u => u.role === 'cliente').length,
          pending: users.filter(u => !u.role).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [token]);

  const statCards = [
    { label: 'Total Usuarios', value: stats.total, icon: Users, color: 'bg-slate-100 text-slate-600' },
    { label: 'Administradores', value: stats.admins, icon: Shield, color: 'bg-red-100 text-red-600' },
    { label: 'Asesores', value: stats.asesores, icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
    { label: 'Clientes', value: stats.clientes, icon: User, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-[#64748b] mt-1">
            Bienvenido, {user?.name}
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/users')}
          data-testid="manage-users-btn"
          className="bg-[#8b1530] hover:bg-[#701126] gap-2"
        >
          <Users className="h-4 w-4" />
          Gestionar Usuarios
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748b]">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#0f172a] mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Users Alert */}
      {stats.pending > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <UserX className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {stats.pending} usuario(s) sin rol asignado
                </p>
                <p className="text-sm text-amber-700">
                  Estos usuarios no pueden acceder al sistema hasta que les asignes un rol.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/admin/users')}
              className="bg-amber-600 hover:bg-amber-700 gap-2"
            >
              Asignar roles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#8b1530]" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Gestión del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-[#0f172a]"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-4 w-4" />
              Ver todos los usuarios
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-[#0f172a]"
              onClick={() => navigate('/admin/users?action=create')}
            >
              <User className="h-4 w-4" />
              Crear nuevo usuario
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8b1530]" />
              Resumen del Sistema
            </CardTitle>
            <CardDescription>Estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[#64748b]">Estado del sistema</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Operativo
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[#64748b]">Usuarios activos</span>
                <span className="text-[#0f172a] font-medium">{stats.total - stats.pending}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748b]">Pendientes de activar</span>
                <span className="text-amber-600 font-medium">{stats.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
