import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock,
  TrendingUp
} from 'lucide-react';

const AsesorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Clientes Asignados', value: '12', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Solicitudes Activas', value: '8', icon: FileText, color: 'bg-amber-100 text-amber-600' },
    { label: 'Completadas Este Mes', value: '24', icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
    { label: 'Pendientes', value: '3', icon: Clock, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div data-testid="asesor-dashboard" className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
          Panel de Asesor
        </h1>
        <p className="text-[#64748b] mt-1">
          Bienvenido, {user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8b1530]" />
              Resumen de Actividad
            </CardTitle>
            <CardDescription>Tu rendimiento este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[#64748b]">Solicitudes gestionadas</span>
                <span className="text-[#0f172a] font-medium">32</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[#64748b]">Subvenciones aprobadas</span>
                <span className="text-green-600 font-medium">24</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748b]">Tasa de éxito</span>
                <span className="text-[#8b1530] font-medium">75%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#8b1530]" />
              Próximas Tareas
            </CardTitle>
            <CardDescription>Acciones pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 mt-2 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">Revisar documentación Cliente A</p>
                  <p className="text-xs text-[#64748b]">Vence hoy</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">Preparar informe mensual</p>
                  <p className="text-xs text-[#64748b]">Vence en 3 días</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">Reunión con Cliente B</p>
                  <p className="text-xs text-[#64748b]">Vence en 5 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-[#fbeff3] bg-[#fbeff3]/50">
        <CardContent className="p-6 text-center">
          <p className="text-[#8b1530] font-medium">
            Funcionalidad completa próximamente
          </p>
          <p className="text-sm text-[#64748b] mt-1">
            En esta primera iteración se ha configurado la base de autenticación y RBAC.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AsesorDashboard;
