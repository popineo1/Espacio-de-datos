import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
  Shield
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companyRes, diagnosticRes, projectRes] = await Promise.all([
        axios.get(`${API_URL}/companies/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/companies/${id}/diagnostic`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/companies/${id}/project`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }))
      ]);
      
      setCompany(companyRes.data);
      setDiagnostic(diagnosticRes.data);
      setProject(projectRes.data);
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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

            <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] lg:col-span-2">
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
    </div>
  );
};

export default CompanyDetail;
