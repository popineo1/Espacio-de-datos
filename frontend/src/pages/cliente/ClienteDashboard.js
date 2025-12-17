import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  FileText, 
  CheckCircle2, 
  Clock,
  Upload,
  Bell
} from 'lucide-react';

const ClienteDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Solicitudes Totales', value: '5', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'En Proceso', value: '2', icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Aprobadas', value: '3', icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
    { label: 'Documentos Pendientes', value: '1', icon: Upload, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div data-testid="cliente-dashboard" className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
          Mi Panel
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
              <FileText className="h-5 w-5 text-[#8b1530]" />
              Mis Solicitudes
            </CardTitle>
            <CardDescription>Estado de tus trámites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Subvención Kit Digital</p>
                    <p className="text-xs text-[#64748b]">Aprobada el 15/11/2024</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Completada
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Ayuda Transformación Digital</p>
                    <p className="text-xs text-[#64748b]">En revisión</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                  En proceso
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#8b1530]" />
              Notificaciones Recientes
            </CardTitle>
            <CardDescription>Últimas actualizaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 mt-2 rounded-full bg-[#8b1530]"></div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">Documento requerido</p>
                  <p className="text-xs text-[#64748b]">Por favor, sube el certificado de empresa actualizado</p>
                  <p className="text-xs text-[#8b1530] mt-1">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">Solicitud aprobada</p>
                  <p className="text-xs text-[#64748b]">Tu solicitud de Kit Digital ha sido aprobada</p>
                  <p className="text-xs text-[#64748b] mt-1">Hace 3 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asesor Info */}
      <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-lg">Tu Asesor Asignado</CardTitle>
          <CardDescription>Contacta con tu asesor para cualquier consulta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#fbeff3] flex items-center justify-center">
              <span className="text-[#8b1530] font-bold text-lg">AD</span>
            </div>
            <div>
              <p className="font-semibold text-[#0f172a]">Asesor Demo</p>
              <p className="text-sm text-[#64748b]">asesor@espaciodatos.com</p>
              <p className="text-xs text-[#8b1530] mt-1">Disponible de Lunes a Viernes, 9:00 - 18:00</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

export default ClienteDashboard;
