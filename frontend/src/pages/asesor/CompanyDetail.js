import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  ArrowLeft, 
  Pencil,
  Loader2,
  Building2,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Globe,
  Phone,
  User,
  Briefcase,
  Calendar,
  Shield,
  UserPlus,
  Mail,
  Key,
  Database,
  Users,
  FileText,
  ShieldCheck,
  Play,
  Check,
  Square,
  ClipboardList,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyDetail = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // User creation state
  const [companyUser, setCompanyUser] = useState(null);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({ email: '', name: '', password: '' });
  const [userError, setUserError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  
  // Project state
  const [projectForm, setProjectForm] = useState({
    space_name: '',
    target_role: '',
    use_case: '',
    rgpd_checked: false
  });
  const [savingProject, setSavingProject] = useState(false);
  const [projectError, setProjectError] = useState('');
  
  // Intake state
  const [intake, setIntake] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companyRes, diagnosticRes, projectRes, userRes, intakeRes] = await Promise.all([
        axios.get(`${API_URL}/companies/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/companies/${id}/diagnostic`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/companies/${id}/project`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/companies/${id}/user`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/companies/${id}/intake`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }))
      ]);
      
      setCompany(companyRes.data);
      setDiagnostic(diagnosticRes.data);
      setProject(projectRes.data);
      setCompanyUser(userRes.data);
      setIntake(intakeRes.data);
      
      // Initialize project form if project exists
      if (projectRes.data) {
        setProjectForm({
          space_name: projectRes.data.space_name || '',
          target_role: projectRes.data.target_role || '',
          use_case: projectRes.data.use_case || '',
          rgpd_checked: projectRes.data.rgpd_checked || false
        });
      }
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setCreatingUser(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/companies/${id}/user`,
        userFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanyUser(response.data);
      setShowCreateUserDialog(false);
      setUserFormData({ email: '', name: '', password: '' });
    } catch (error) {
      setUserError(error.response?.data?.detail || 'Error al crear usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  const openCreateUserDialog = () => {
    // Pre-fill with contact info if available
    setUserFormData({
      email: '',
      name: company?.contact_name || '',
      password: ''
    });
    setUserError('');
    setShowCreateUserDialog(true);
  };

  const updateProjectField = async (field, value) => {
    setSavingProject(true);
    setProjectError('');
    
    try {
      const response = await axios.put(
        `${API_URL}/companies/${id}/project`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(response.data);
      setProjectForm(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      setProjectError(error.response?.data?.detail || 'Error al actualizar');
    } finally {
      setSavingProject(false);
    }
  };

  const updateIncorporationStatus = async (newStatus) => {
    setSavingProject(true);
    setProjectError('');
    
    try {
      const response = await axios.put(
        `${API_URL}/companies/${id}/project`,
        { incorporation_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(response.data);
    } catch (error) {
      setProjectError(error.response?.data?.detail || 'Error al actualizar estado');
    } finally {
      setSavingProject(false);
    }
  };

  const getIncorporationStatusBadge = (status) => {
    const config = {
      pendiente: { color: 'bg-amber-100 text-amber-800', label: 'Pendiente' },
      en_progreso: { color: 'bg-blue-100 text-blue-800', label: 'En progreso' },
      completada: { color: 'bg-green-100 text-green-800', label: 'Completada' }
    };
    const { color, label } = config[status] || config.pendiente;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{label}</span>;
  };

  const updateDiagnostic = async (field, value) => {
    if (diagnostic.result !== 'pendiente') return;
    
    try {
      const response = await axios.put(
        `${API_URL}/companies/${id}/diagnostic`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiagnostic(response.data);
    } catch (error) {
      console.error('Error updating diagnostic:', error);
    }
  };

  const handleDecision = async (decision) => {
    setSaving(true);
    setError('');
    
    try {
      await axios.post(
        `${API_URL}/companies/${id}/diagnostic/decide`,
        { result: decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowConfirmDialog(false);
      setConfirmAction(null);
      
      // Refresh data
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al procesar la decisión');
    } finally {
      setSaving(false);
    }
  };

  const openConfirmDialog = (action) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      lead: { icon: Clock, color: 'bg-amber-100 text-amber-800', label: 'En evaluación' },
      apta: { icon: CheckCircle2, color: 'bg-green-100 text-green-800', label: 'Apta' },
      descartada: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Descartada' }
    };
    const { icon: Icon, color, label } = config[status] || config.lead;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  };

  const getRiskBadge = (risk) => {
    const config = {
      bajo: 'bg-green-100 text-green-800',
      medio: 'bg-amber-100 text-amber-800',
      alto: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[risk]}`}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b1530]" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-[#64748b]">Empresa no encontrada</p>
        <Button onClick={() => navigate('/asesor/empresas')} className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="company-detail" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/asesor/empresas')}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
                {company.name}
              </h1>
              {getStatusBadge(company.status)}
            </div>
            <p className="text-[#64748b] mt-1 font-mono">{company.nif}</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/asesor/empresas/${id}/editar`)}
          variant="outline"
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Editar empresa
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Project Banner */}
      {project && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">{project.title}</p>
              <p className="text-sm text-green-700">Fase {project.phase}: Incorporación efectiva • Estado: {project.status}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="datos" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="datos" data-testid="tab-datos" className="gap-2">
            <Building2 className="h-4 w-4" />
            Datos
          </TabsTrigger>
          <TabsTrigger value="diagnostico" data-testid="tab-diagnostico" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Diagnóstico
          </TabsTrigger>
          {project && (
            <TabsTrigger value="proyecto" data-testid="tab-proyecto" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Proyecto (Fase 2)
            </TabsTrigger>
          )}
        </TabsList>

        {/* Datos Tab */}
        <TabsContent value="datos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <Building2 className="h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-xs text-[#64748b]">Sector</p>
                    <p className="text-[#0f172a]">{company.sector || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <User className="h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-xs text-[#64748b]">Tamaño</p>
                    <p className="text-[#0f172a]">{company.size_range || 'No especificado'} empleados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <Globe className="h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-xs text-[#64748b]">País</p>
                    <p className="text-[#0f172a]">{company.country || 'España'}</p>
                  </div>
                </div>
                {company.website && (
                  <div className="flex items-center gap-3 py-2">
                    <Globe className="h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-xs text-[#64748b]">Sitio web</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#8b1530] hover:underline">
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle className="text-lg">Contacto Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <User className="h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-xs text-[#64748b]">Nombre</p>
                    <p className="text-[#0f172a]">{company.contact_name || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <Briefcase className="h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-xs text-[#64748b]">Cargo</p>
                    <p className="text-[#0f172a]">{company.contact_role || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Phone className="h-5 w-5 text-[#64748b]" />
                  <div>
                    <p className="text-xs text-[#64748b]">Teléfono</p>
                    <p className="text-[#0f172a]">{company.contact_phone || 'No especificado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Access Card */}
            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-[#8b1530]" />
                  Acceso de Usuario
                </CardTitle>
                <CardDescription>Usuario cliente vinculado a esta empresa</CardDescription>
              </CardHeader>
              <CardContent>
                {companyUser ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{companyUser.name}</p>
                        <p className="text-sm text-green-700">{companyUser.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <User className="h-10 w-10 text-[#64748b] mx-auto mb-2" />
                    <p className="text-[#64748b] text-sm mb-4">No hay usuario asignado</p>
                    <Button
                      onClick={openCreateUserDialog}
                      data-testid="create-user-btn"
                      className="bg-[#8b1530] hover:bg-[#701126] gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Crear usuario cliente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle className="text-lg">Registro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-xs text-[#64748b]">Fecha de alta</p>
                      <p className="text-[#0f172a]">{new Date(company.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#64748b]" />
                    <div>
                      <p className="text-xs text-[#64748b]">Última actualización</p>
                      <p className="text-[#0f172a]">{new Date(company.updated_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Proyecto Tab */}
        {project && (
          <TabsContent value="proyecto">
            <div className="space-y-6">
              {projectError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{projectError}</AlertDescription>
                </Alert>
              )}

              {/* Status Card */}
              <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Estado de Incorporación</CardTitle>
                      <CardDescription>Fase 2: Incorporación al Espacio de Datos</CardDescription>
                    </div>
                    {getIncorporationStatusBadge(project.incorporation_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {project.incorporation_status === 'pendiente' && (
                      <Button
                        onClick={() => updateIncorporationStatus('en_progreso')}
                        disabled={savingProject}
                        data-testid="mark-in-progress-btn"
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Marcar como En progreso
                      </Button>
                    )}
                    {project.incorporation_status === 'en_progreso' && (
                      <Button
                        onClick={() => updateIncorporationStatus('completada')}
                        disabled={savingProject}
                        data-testid="mark-completed-btn"
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Marcar como Completada
                      </Button>
                    )}
                    {project.incorporation_status === 'completada' && (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Incorporación completada</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Checklist Card */}
              <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-[#8b1530]" />
                    Checklist de Incorporación
                  </CardTitle>
                  <CardDescription>Completa todos los pasos para poder finalizar la incorporación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${project.incorporation_checklist?.espacio_seleccionado ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                      {project.incorporation_checklist?.espacio_seleccionado ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                      <span className={project.incorporation_checklist?.espacio_seleccionado ? 'text-green-800' : 'text-slate-600'}>
                        Espacio de datos seleccionado
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${project.incorporation_checklist?.rol_definido ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                      {project.incorporation_checklist?.rol_definido ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                      <span className={project.incorporation_checklist?.rol_definido ? 'text-green-800' : 'text-slate-600'}>
                        Modalidad definida
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${project.incorporation_checklist?.caso_uso_definido ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                      {project.incorporation_checklist?.caso_uso_definido ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                      <span className={project.incorporation_checklist?.caso_uso_definido ? 'text-green-800' : 'text-slate-600'}>
                        Caso de uso definido
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${project.incorporation_checklist?.validacion_rgpd ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                      {project.incorporation_checklist?.validacion_rgpd ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                      <span className={project.incorporation_checklist?.validacion_rgpd ? 'text-green-800' : 'text-slate-600'}>
                        Validación RGPD
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Details Form */}
              <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-[#8b1530]" />
                    Datos de Incorporación
                  </CardTitle>
                  <CardDescription>Completa la información del espacio de datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="space_name" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Espacio de Datos
                      </Label>
                      <Select
                        value={projectForm.space_name}
                        onValueChange={(value) => updateProjectField('space_name', value)}
                        disabled={savingProject}
                      >
                        <SelectTrigger data-testid="space-name-select">
                          <SelectValue placeholder="Selecciona un espacio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Espacio de Datos Industrial">Espacio de Datos Industrial</SelectItem>
                          <SelectItem value="Espacio de Datos Agrícola">Espacio de Datos Agrícola</SelectItem>
                          <SelectItem value="Espacio de Datos Turismo">Espacio de Datos Turismo</SelectItem>
                          <SelectItem value="Espacio de Datos Salud">Espacio de Datos Salud</SelectItem>
                          <SelectItem value="Espacio de Datos Movilidad">Espacio de Datos Movilidad</SelectItem>
                          <SelectItem value="Espacio de Datos Energía">Espacio de Datos Energía</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_role" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Modalidad
                      </Label>
                      <Select
                        value={projectForm.target_role}
                        onValueChange={(value) => updateProjectField('target_role', value)}
                        disabled={savingProject}
                      >
                        <SelectTrigger data-testid="target-role-select">
                          <SelectValue placeholder="Selecciona modalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participante">Participante (consumidor de datos)</SelectItem>
                          <SelectItem value="proveedor">Proveedor (aporta datos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="use_case" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Caso de Uso
                    </Label>
                    <Textarea
                      id="use_case"
                      value={projectForm.use_case}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, use_case: e.target.value }))}
                      onBlur={(e) => updateProjectField('use_case', e.target.value)}
                      disabled={savingProject}
                      data-testid="use-case-input"
                      placeholder="Describe el caso de uso de la empresa en el espacio de datos..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <Checkbox
                      id="rgpd_checked"
                      checked={projectForm.rgpd_checked}
                      onCheckedChange={(checked) => {
                        setProjectForm(prev => ({ ...prev, rgpd_checked: checked }));
                        updateProjectField('rgpd_checked', checked);
                      }}
                      disabled={savingProject}
                      data-testid="rgpd-checkbox"
                    />
                    <div>
                      <Label htmlFor="rgpd_checked" className="font-medium cursor-pointer flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#8b1530]" />
                        Validación RGPD realizada
                      </Label>
                      <p className="text-xs text-[#64748b] mt-1">
                        Confirma que se ha realizado la validación de cumplimiento RGPD para el tratamiento de datos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Diagnóstico Tab */}
        <TabsContent value="diagnostico">
          <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-[#8b1530]" />
                    Diagnóstico de Elegibilidad
                  </CardTitle>
                  <CardDescription>Evalúa si la empresa es apta para el espacio de datos</CardDescription>
                </div>
                {diagnostic && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#64748b]">Estado:</span>
                    {diagnostic.result === 'pendiente' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">Pendiente</span>
                    )}
                    {diagnostic.result === 'apta' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Apta</span>
                    )}
                    {diagnostic.result === 'no_apta' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">No Apta</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {diagnostic ? (
                <>
                  {/* Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Checkbox
                          id="eligibility_ok"
                          checked={diagnostic.eligibility_ok}
                          onCheckedChange={(checked) => updateDiagnostic('eligibility_ok', checked)}
                          disabled={diagnostic.result !== 'pendiente'}
                          data-testid="check-eligibility"
                        />
                        <div>
                          <Label htmlFor="eligibility_ok" className="font-medium cursor-pointer">
                            Elegibilidad confirmada
                          </Label>
                          <p className="text-xs text-[#64748b] mt-1">
                            La empresa cumple los requisitos básicos de elegibilidad
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Checkbox
                          id="space_identified"
                          checked={diagnostic.space_identified}
                          onCheckedChange={(checked) => updateDiagnostic('space_identified', checked)}
                          disabled={diagnostic.result !== 'pendiente'}
                          data-testid="check-space"
                        />
                        <div>
                          <Label htmlFor="space_identified" className="font-medium cursor-pointer">
                            Espacio de datos identificado
                          </Label>
                          <p className="text-xs text-[#64748b] mt-1">
                            Se ha identificado un espacio de datos aplicable
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <Checkbox
                          id="data_potential"
                          checked={diagnostic.data_potential}
                          onCheckedChange={(checked) => updateDiagnostic('data_potential', checked)}
                          disabled={diagnostic.result !== 'pendiente'}
                          data-testid="check-potential"
                        />
                        <div>
                          <Label htmlFor="data_potential" className="font-medium cursor-pointer">
                            Potencial de datos
                          </Label>
                          <p className="text-xs text-[#64748b] mt-1">
                            La empresa tiene datos relevantes para compartir/consumir
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Riesgo legal
                          </Label>
                          {getRiskBadge(diagnostic.legal_risk)}
                        </div>
                        <Select
                          value={diagnostic.legal_risk}
                          onValueChange={(value) => updateDiagnostic('legal_risk', value)}
                          disabled={diagnostic.result !== 'pendiente'}
                        >
                          <SelectTrigger data-testid="select-risk">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bajo">Bajo</SelectItem>
                            <SelectItem value="medio">Medio</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="font-medium">Notas del diagnóstico</Label>
                    <Textarea
                      id="notes"
                      value={diagnostic.notes || ''}
                      onChange={(e) => updateDiagnostic('notes', e.target.value)}
                      disabled={diagnostic.result !== 'pendiente'}
                      data-testid="diagnostic-notes"
                      placeholder="Añade notas o comentarios sobre el diagnóstico..."
                      rows={4}
                    />
                  </div>

                  {/* Decision Buttons */}
                  {diagnostic.result === 'pendiente' && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                      <Button
                        onClick={() => openConfirmDialog('apta')}
                        data-testid="mark-apta-btn"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg gap-2"
                      >
                        <CheckCircle2 className="h-6 w-6" />
                        Marcar APTA
                      </Button>
                      <Button
                        onClick={() => openConfirmDialog('no_apta')}
                        data-testid="mark-no-apta-btn"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 py-6 text-lg gap-2"
                      >
                        <XCircle className="h-6 w-6" />
                        Marcar NO APTA
                      </Button>
                    </div>
                  )}

                  {/* Decision Info */}
                  {diagnostic.result !== 'pendiente' && diagnostic.decided_at && (
                    <div className={`p-4 rounded-lg ${diagnostic.result === 'apta' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className={`font-medium ${diagnostic.result === 'apta' ? 'text-green-800' : 'text-red-800'}`}>
                        {diagnostic.result === 'apta' ? 'Empresa marcada como APTA' : 'Empresa marcada como NO APTA'}
                      </p>
                      <p className={`text-sm ${diagnostic.result === 'apta' ? 'text-green-700' : 'text-red-700'}`}>
                        Decisión tomada el {new Date(diagnostic.decided_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[#64748b] text-center py-8">No se encontró información de diagnóstico</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'apta' ? 'Confirmar empresa APTA' : 'Confirmar empresa NO APTA'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'apta' 
                ? 'Al marcar la empresa como APTA, se iniciará automáticamente un Proyecto en Fase 2 (Incorporación efectiva). Esta acción no se puede deshacer.'
                : 'Al marcar la empresa como NO APTA, quedará descartada del proceso. Esta acción no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>
          
          {confirmAction === 'apta' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Se creará:</p>
              <p className="text-green-700 text-sm">Proyecto: Incorporación - {company.name}</p>
              <p className="text-green-700 text-sm">Fase 2: Incorporación efectiva</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDecision(confirmAction)}
              disabled={saving}
              className={confirmAction === 'apta' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              data-testid="confirm-decision-btn"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#8b1530]" />
              Crear Usuario Cliente
            </DialogTitle>
            <DialogDescription>
              Crea un usuario para que el cliente pueda acceder al sistema y ver el estado de su empresa.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            {userError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{userError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="user-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre completo
              </Label>
              <Input
                id="user-name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                data-testid="new-user-name"
                placeholder="Nombre del usuario"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="user-email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                data-testid="new-user-email"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Contraseña
              </Label>
              <Input
                id="user-password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                data-testid="new-user-password"
                placeholder="Contraseña de acceso"
                required
                minLength={6}
              />
              <p className="text-xs text-[#64748b]">Mínimo 6 caracteres</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <p className="text-[#64748b]">
                <strong className="text-[#0f172a]">Empresa:</strong> {company?.name}
              </p>
              <p className="text-[#64748b]">
                <strong className="text-[#0f172a]">Rol:</strong> Cliente
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creatingUser}
                data-testid="submit-create-user"
                className="bg-[#8b1530] hover:bg-[#701126] gap-2"
              >
                {creatingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Crear usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDetail;
