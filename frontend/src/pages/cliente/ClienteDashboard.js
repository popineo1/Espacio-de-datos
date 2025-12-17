import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Clock, 
  CheckCircle2, 
  XCircle,
  Building2,
  FileCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClienteDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/client/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        setError('Error al cargar los datos');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b1530]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-[#64748b]">{error}</p>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (!dashboardData) return null;

    switch (dashboardData.status) {
      case 'en_evaluacion':
        return {
          icon: Clock,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          cardBorder: 'border-amber-200',
          cardBg: 'bg-amber-50'
        };
      case 'apta':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          cardBorder: 'border-green-200',
          cardBg: 'bg-green-50'
        };
      case 'no_apta':
        return {
          icon: XCircle,
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          cardBorder: 'border-slate-200',
          cardBg: 'bg-slate-50'
        };
      default:
        return {
          icon: AlertCircle,
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          cardBorder: 'border-slate-200',
          cardBg: 'bg-slate-50'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config?.icon || AlertCircle;

  // No company assigned
  if (dashboardData?.status === 'sin_empresa') {
    return (
      <div data-testid="cliente-dashboard" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
            Mi Panel
          </h1>
          <p className="text-[#64748b] mt-1">
            Bienvenido, {user?.name}
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-900 mb-2">
              Sin empresa asignada
            </h2>
            <p className="text-amber-700">
              {dashboardData.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Company Info */}
      {dashboardData?.company && (
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#fbeff3] flex items-center justify-center">
                <Building2 className="h-7 w-7 text-[#8b1530]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0f172a]">
                  {dashboardData.company.name}
                </h2>
                <p className="text-[#64748b]">Tu empresa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card className={`${config?.cardBorder} ${config?.cardBg}`}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className={`h-20 w-20 rounded-full ${config?.iconBg} flex items-center justify-center mb-4`}>
              <StatusIcon className={`h-10 w-10 ${config?.iconColor}`} />
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
              {dashboardData?.title}
            </h2>
            <p className="text-[#64748b] max-w-md">
              {dashboardData?.message}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Info (only if apta) */}
      {dashboardData?.project && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <FileCheck className="h-5 w-5" />
              Tu Proyecto
            </CardTitle>
            <CardDescription className="text-green-700">
              Información sobre tu proceso de incorporación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                <div>
                  <p className="font-semibold text-[#0f172a]">{dashboardData.project.title}</p>
                  <p className="text-sm text-[#64748b]">Estado: {dashboardData.project.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#64748b]">Fase actual</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardData.project.phase}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-green-200 p-4">
                <h4 className="font-medium text-[#0f172a] mb-3">Progreso del proceso</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#64748b]">Fase 1</span>
                      <span className="text-xs text-[#64748b]">Fase 2</span>
                      <span className="text-xs text-[#64748b]">Fase 3</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${(dashboardData.project.phase / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Actualmente en Fase {dashboardData.project.phase}: Incorporación efectiva al espacio de datos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info about the process */}
      <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-lg">Información del Proceso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-6 w-6 rounded-full bg-[#8b1530] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">Evaluación inicial</p>
                <p className="text-sm text-[#64748b]">Nuestro equipo analiza la elegibilidad de tu empresa</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-6 w-6 rounded-full bg-[#8b1530] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">Incorporación al espacio de datos</p>
                <p className="text-sm text-[#64748b]">Proceso de integración efectiva en el ecosistema de datos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-6 w-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-[#0f172a]">Siguiente fase</p>
                <p className="text-sm text-[#64748b]">Más información próximamente</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-[#fbeff3] bg-[#fbeff3]/50">
        <CardContent className="p-6 text-center">
          <p className="text-[#8b1530] font-medium">
            ¿Tienes dudas sobre tu proceso?
          </p>
          <p className="text-sm text-[#64748b] mt-1">
            Contacta con tu asesor asignado para más información.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClienteDashboard;
