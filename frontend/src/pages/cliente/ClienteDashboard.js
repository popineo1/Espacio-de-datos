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
  AlertCircle,
  Database,
  Users,
  FileText,
  ShieldCheck,
  Play
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

  const getIncorporationStatusConfig = (status) => {
    const configs = {
      pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-100' },
      en_progreso: { label: 'En progreso', color: 'text-blue-600', bg: 'bg-blue-100' },
      completada: { label: 'Completada', color: 'text-green-600', bg: 'bg-green-100' }
    };
    return configs[status] || configs.pendiente;
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

  const project = dashboardData?.project;
  const incorporationStatus = project?.incorporation_status || 'pendiente';
  const incConfig = getIncorporationStatusConfig(incorporationStatus);

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

      {/* Status Card - For non-apta status */}
      {dashboardData?.status !== 'apta' && (
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
      )}

      {/* Incorporation Status - For apta status with project */}
      {dashboardData?.status === 'apta' && project && (
        <>
          {/* Main Status Card */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Database className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
                  Incorporación al Espacio de Datos
                </h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${incConfig.bg} ${incConfig.color} font-medium mt-2`}>
                  {incorporationStatus === 'pendiente' && <Clock className="h-4 w-4" />}
                  {incorporationStatus === 'en_progreso' && <Play className="h-4 w-4" />}
                  {incorporationStatus === 'completada' && <CheckCircle2 className="h-4 w-4" />}
                  {incConfig.label}
                </div>
                <p className="text-[#64748b] mt-4 max-w-md">
                  {incorporationStatus === 'pendiente' && 'Tu proceso de incorporación está pendiente de iniciar.'}
                  {incorporationStatus === 'en_progreso' && 'Tu empresa está siendo incorporada al espacio de datos.'}
                  {incorporationStatus === 'completada' && '¡Enhorabuena! La incorporación al espacio de datos se ha completado.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Details Card */}
          <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#8b1530]" />
                Detalles de la Incorporación
              </CardTitle>
              <CardDescription>Información de tu proceso de incorporación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.space_name && (
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <Database className="h-5 w-5 text-[#8b1530] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#64748b]">Espacio de Datos</p>
                    <p className="font-medium text-[#0f172a]">{project.space_name}</p>
                  </div>
                </div>
              )}
              
              {project.target_role && (
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <Users className="h-5 w-5 text-[#8b1530] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#64748b]">Modalidad</p>
                    <p className="font-medium text-[#0f172a]">
                      {project.target_role === 'participante' ? 'Participante (consumidor de datos)' : 'Proveedor (aporta datos)'}
                    </p>
                  </div>
                </div>
              )}
              
              {project.use_case && (
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <FileText className="h-5 w-5 text-[#8b1530] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#64748b]">Caso de Uso</p>
                    <p className="font-medium text-[#0f172a]">{project.use_case}</p>
                  </div>
                </div>
              )}

              {!project.space_name && !project.target_role && !project.use_case && (
                <div className="text-center py-6 text-[#64748b]">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Los detalles de tu incorporación están siendo preparados por tu asesor.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="text-lg">Progreso del Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#0f172a]">Fase 2: Incorporación</span>
                      <span className="text-sm text-[#64748b]">
                        {incorporationStatus === 'pendiente' && '0%'}
                        {incorporationStatus === 'en_progreso' && '50%'}
                        {incorporationStatus === 'completada' && '100%'}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ 
                          width: incorporationStatus === 'pendiente' ? '0%' : 
                                 incorporationStatus === 'en_progreso' ? '50%' : '100%' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist visual */}
                {project.incorporation_checklist && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${project.incorporation_checklist.espacio_seleccionado ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {project.incorporation_checklist.espacio_seleccionado ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span className="text-sm">Espacio seleccionado</span>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${project.incorporation_checklist.rol_definido ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {project.incorporation_checklist.rol_definido ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span className="text-sm">Modalidad definida</span>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${project.incorporation_checklist.caso_uso_definido ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {project.incorporation_checklist.caso_uso_definido ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span className="text-sm">Caso de uso</span>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${project.incorporation_checklist.validacion_rgpd ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {project.incorporation_checklist.validacion_rgpd ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span className="text-sm">Validación RGPD</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
