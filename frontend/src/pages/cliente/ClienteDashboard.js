import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
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
  ClipboardList,
  Send,
  Play,
  BadgeCheck
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClienteDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  // Intake form state
  const [intakeForm, setIntakeForm] = useState({
    data_types: [],
    data_usage: 'solo_interno',
    main_interests: [],
    data_sensitivity: 'baja',
    notes: ''
  });
  const [savingIntake, setSavingIntake] = useState(false);
  const [intakeError, setIntakeError] = useState('');
  const [intakeSuccess, setIntakeSuccess] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/client/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      
      // Initialize form with existing intake data
      if (response.data.intake) {
        setIntakeForm({
          data_types: response.data.intake.data_types || [],
          data_usage: response.data.intake.data_usage || 'solo_interno',
          main_interests: response.data.intake.main_interests || [],
          data_sensitivity: response.data.intake.data_sensitivity || 'baja',
          notes: response.data.intake.notes || ''
        });
      }
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataTypeChange = (type, checked) => {
    setIntakeForm(prev => ({
      ...prev,
      data_types: checked 
        ? [...prev.data_types, type]
        : prev.data_types.filter(t => t !== type)
    }));
  };

  const handleInterestChange = (interest, checked) => {
    setIntakeForm(prev => ({
      ...prev,
      main_interests: checked 
        ? [...prev.main_interests, interest]
        : prev.main_interests.filter(i => i !== interest)
    }));
  };

  const handleSubmitIntake = async () => {
    setSavingIntake(true);
    setIntakeError('');
    
    try {
      // First save the intake
      await axios.post(
        `${API_URL}/companies/${dashboardData.company.id}/intake`,
        intakeForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Then submit it
      await axios.post(
        `${API_URL}/companies/${dashboardData.company.id}/intake/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIntakeSuccess(true);
      // Refresh dashboard
      await fetchDashboard();
    } catch (error) {
      setIntakeError(error.response?.data?.detail || 'Error al enviar el cuestionario');
    } finally {
      setSavingIntake(false);
    }
  };

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

  const getIncorporationStatusConfig = (status) => {
    const configs = {
      pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-100' },
      en_progreso: { label: 'En progreso', color: 'text-blue-600', bg: 'bg-blue-100' },
      completada: { label: 'Completada', color: 'text-green-600', bg: 'bg-green-100' }
    };
    return configs[status] || configs.pendiente;
  };

  // No company assigned
  if (dashboardData?.status === 'sin_empresa') {
    return (
      <div data-testid="cliente-dashboard" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Mi Panel</h1>
          <p className="text-[#64748b] mt-1">Bienvenido, {user?.name}</p>
        </div>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-900 mb-2">Sin empresa asignada</h2>
            <p className="text-amber-700">{dashboardData.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const company = dashboardData?.company;
  const intake = dashboardData?.intake;
  const project = dashboardData?.project;
  const isLead = company?.status === 'lead';
  const isApta = company?.status === 'apta';
  const isDescartada = company?.status === 'descartada';
  const intakeSubmitted = intake?.submitted || company?.intake_status === 'recibida';

  // Data type options
  const dataTypeOptions = [
    { value: 'operativos', label: 'Operativos' },
    { value: 'comerciales', label: 'Comerciales' },
    { value: 'clientes_pacientes', label: 'Clientes/pacientes' },
    { value: 'sensores_iot', label: 'Sensores/IoT' },
    { value: 'historicos', label: 'Históricos' },
    { value: 'no_lo_se', label: 'No lo sé' }
  ];

  const dataUsageOptions = [
    { value: 'solo_interno', label: 'Solo interno' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'estrategico', label: 'Decisiones estratégicas' },
    { value: 'apenas', label: 'Apenas se usan' }
  ];

  const interestOptions = [
    { value: 'mejorar_procesos', label: 'Mejorar procesos' },
    { value: 'acceder_datos_externos', label: 'Acceder a datos externos' },
    { value: 'monetizar', label: 'Monetizar datos propios' },
    { value: 'cumplimiento', label: 'Cumplimiento/modernización' },
    { value: 'no_lo_tengo_claro', label: 'No lo tengo claro' }
  ];

  const sensitivityOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta (salud/menores/etc.)' },
    { value: 'no_lo_se', label: 'No lo sé' }
  ];

  const getDataTypeLabel = (value) => dataTypeOptions.find(o => o.value === value)?.label || value;
  const getDataUsageLabel = (value) => dataUsageOptions.find(o => o.value === value)?.label || value;
  const getInterestLabel = (value) => interestOptions.find(o => o.value === value)?.label || value;
  const getSensitivityLabel = (value) => sensitivityOptions.find(o => o.value === value)?.label || value;

  return (
    <div data-testid="cliente-dashboard" className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Mi Panel</h1>
        <p className="text-[#64748b] mt-1">Bienvenido, {user?.name}</p>
      </div>

      {/* Company Info */}
      {company && (
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#fbeff3] flex items-center justify-center">
                <Building2 className="h-7 w-7 text-[#8b1530]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0f172a]">{company.name}</h2>
                <p className="text-[#64748b]">Tu empresa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LEAD STATUS: Show Intake Questionnaire */}
      {isLead && (
        <>
          {/* Status Card */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">En evaluación</h3>
                  <p className="text-amber-700">Tu empresa está siendo evaluada por nuestro equipo de asesores.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intake Questionnaire */}
          <Card className={`border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${intakeSubmitted ? 'bg-green-50 border-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-6 w-6 text-[#8b1530]" />
                  <div>
                    <CardTitle className="text-lg">Cuestionario de Contexto de Datos</CardTitle>
                    <CardDescription>
                      {intakeSubmitted 
                        ? 'Información enviada correctamente'
                        : 'Esta información nos ayuda a valorar si tiene sentido iniciar una incorporación a un espacio de datos.'}
                    </CardDescription>
                  </div>
                </div>
                {intakeSubmitted && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    <BadgeCheck className="h-4 w-4" />
                    Enviado
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {intakeSubmitted ? (
                /* Read-only view */
                <div className="space-y-6">
                  <Alert className="bg-green-100 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Gracias. Nuestro equipo está evaluando la viabilidad.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-sm text-[#64748b] mb-2">Tipo de datos</p>
                      <div className="flex flex-wrap gap-2">
                        {(intake?.data_types || []).map(type => (
                          <span key={type} className="px-2 py-1 bg-slate-100 rounded text-sm">{getDataTypeLabel(type)}</span>
                        ))}
                        {(!intake?.data_types || intake.data_types.length === 0) && <span className="text-[#64748b]">-</span>}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-sm text-[#64748b] mb-2">Uso actual</p>
                      <p className="font-medium">{getDataUsageLabel(intake?.data_usage)}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-sm text-[#64748b] mb-2">Interés principal</p>
                      <div className="flex flex-wrap gap-2">
                        {(intake?.main_interests || []).map(interest => (
                          <span key={interest} className="px-2 py-1 bg-slate-100 rounded text-sm">{getInterestLabel(interest)}</span>
                        ))}
                        {(!intake?.main_interests || intake.main_interests.length === 0) && <span className="text-[#64748b]">-</span>}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-sm text-[#64748b] mb-2">Sensibilidad</p>
                      <p className="font-medium">{getSensitivityLabel(intake?.data_sensitivity)}</p>
                    </div>
                  </div>
                  {intake?.notes && (
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-sm text-[#64748b] mb-2">Comentarios</p>
                      <p>{intake.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Editable form */
                <div className="space-y-6">
                  <p className="text-sm text-[#64748b] bg-slate-50 p-3 rounded-lg">
                    No implica ninguna solicitud ni compromiso.
                  </p>

                  {intakeError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{intakeError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Data Types */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Tipo de datos que genera tu empresa</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dataTypeOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <Checkbox
                            id={`data-${option.value}`}
                            checked={intakeForm.data_types.includes(option.value)}
                            onCheckedChange={(checked) => handleDataTypeChange(option.value, checked)}
                            data-testid={`data-type-${option.value}`}
                          />
                          <Label htmlFor={`data-${option.value}`} className="cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Usage */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Uso actual de los datos</Label>
                    <RadioGroup
                      value={intakeForm.data_usage}
                      onValueChange={(value) => setIntakeForm(prev => ({ ...prev, data_usage: value }))}
                      className="grid grid-cols-2 gap-3"
                    >
                      {dataUsageOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <RadioGroupItem value={option.value} id={`usage-${option.value}`} data-testid={`data-usage-${option.value}`} />
                          <Label htmlFor={`usage-${option.value}`} className="cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Main Interests */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Interés principal</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <Checkbox
                            id={`interest-${option.value}`}
                            checked={intakeForm.main_interests.includes(option.value)}
                            onCheckedChange={(checked) => handleInterestChange(option.value, checked)}
                            data-testid={`interest-${option.value}`}
                          />
                          <Label htmlFor={`interest-${option.value}`} className="cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Sensitivity */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Sensibilidad de los datos</Label>
                    <RadioGroup
                      value={intakeForm.data_sensitivity}
                      onValueChange={(value) => setIntakeForm(prev => ({ ...prev, data_sensitivity: value }))}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {sensitivityOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <RadioGroupItem value={option.value} id={`sens-${option.value}`} data-testid={`sensitivity-${option.value}`} />
                          <Label htmlFor={`sens-${option.value}`} className="cursor-pointer text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-base font-medium">Comentario (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={intakeForm.notes}
                      onChange={(e) => setIntakeForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Cualquier información adicional que quieras compartir..."
                      data-testid="intake-notes"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitIntake}
                    disabled={savingIntake}
                    data-testid="submit-intake-btn"
                    className="w-full bg-[#8b1530] hover:bg-[#701126] py-6 text-lg gap-2"
                  >
                    {savingIntake ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    Enviar información
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* APTA STATUS: Show Incorporation Progress */}
      {isApta && project && (
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
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getIncorporationStatusConfig(project.incorporation_status).bg} ${getIncorporationStatusConfig(project.incorporation_status).color} font-medium mt-2`}>
                  {project.incorporation_status === 'pendiente' && <Clock className="h-4 w-4" />}
                  {project.incorporation_status === 'en_progreso' && <Play className="h-4 w-4" />}
                  {project.incorporation_status === 'completada' && <CheckCircle2 className="h-4 w-4" />}
                  {getIncorporationStatusConfig(project.incorporation_status).label}
                </div>
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

          {/* Progress */}
          {project.incorporation_checklist && (
            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle className="text-lg">Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'espacio_seleccionado', label: 'Espacio seleccionado' },
                    { key: 'rol_definido', label: 'Modalidad definida' },
                    { key: 'caso_uso_definido', label: 'Caso de uso' },
                    { key: 'validacion_rgpd', label: 'Validación RGPD' }
                  ].map(item => (
                    <div key={item.key} className={`flex items-center gap-2 p-3 rounded-lg ${project.incorporation_checklist[item.key] ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {project.incorporation_checklist[item.key] ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* DESCARTADA STATUS */}
      {isDescartada && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Evaluación completada</h2>
              <p className="text-[#64748b] max-w-md">
                Tras el análisis realizado, tu empresa no cumple actualmente con los requisitos necesarios. 
                Si tienes dudas, contacta con tu asesor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      <Card className="border-[#fbeff3] bg-[#fbeff3]/50">
        <CardContent className="p-6 text-center">
          <p className="text-[#8b1530] font-medium">¿Tienes dudas sobre tu proceso?</p>
          <p className="text-sm text-[#64748b] mt-1">Contacta con tu asesor asignado para más información.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClienteDashboard;
