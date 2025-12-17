import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  ArrowLeft, 
  Save,
  Loader2,
  AlertCircle,
  Building2
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    nif: '',
    sector: '',
    size_range: '',
    country: 'España',
    website: '',
    contact_name: '',
    contact_role: '',
    contact_phone: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data);
    } catch (error) {
      setError('Error al cargar la empresa');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/companies/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/companies`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/asesor/empresas');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al guardar la empresa');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b1530]" />
      </div>
    );
  }

  return (
    <div data-testid="company-form" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/asesor/empresas')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
            {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
          </h1>
          <p className="text-[#64748b] mt-1">
            {isEdit ? 'Modifica los datos de la empresa' : 'Registra una nueva empresa en el sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#8b1530]" />
              Datos de la Empresa
            </CardTitle>
            <CardDescription>Información básica de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  data-testid="company-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nif">NIF *</Label>
                <Input
                  id="nif"
                  value={formData.nif}
                  onChange={(e) => handleChange('nif', e.target.value)}
                  data-testid="company-nif"
                  placeholder="B12345678"
                  required
                  disabled={isEdit}
                />
                {isEdit && (
                  <p className="text-xs text-[#64748b]">El NIF no se puede modificar</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={formData.sector || ''}
                  onValueChange={(value) => handleChange('sector', value)}
                >
                  <SelectTrigger data-testid="company-sector">
                    <SelectValue placeholder="Selecciona un sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Energía">Energía</SelectItem>
                    <SelectItem value="Industria">Industria</SelectItem>
                    <SelectItem value="Comercio">Comercio</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Agricultura">Agricultura</SelectItem>
                    <SelectItem value="Construcción">Construcción</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size_range">Tamaño (empleados)</Label>
                <Select
                  value={formData.size_range || ''}
                  onValueChange={(value) => handleChange('size_range', value)}
                >
                  <SelectTrigger data-testid="company-size">
                    <SelectValue placeholder="Selecciona el tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 empleados</SelectItem>
                    <SelectItem value="11-50">11-50 empleados</SelectItem>
                    <SelectItem value="51-250">51-250 empleados</SelectItem>
                    <SelectItem value="250+">Más de 250 empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  data-testid="company-country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  data-testid="company-website"
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-[#0f172a] mb-4">Datos de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nombre del contacto</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name || ''}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                    data-testid="company-contact-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_role">Cargo</Label>
                  <Input
                    id="contact_role"
                    value={formData.contact_role || ''}
                    onChange={(e) => handleChange('contact_role', e.target.value)}
                    data-testid="company-contact-role"
                    placeholder="CEO, Director, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Teléfono</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    data-testid="company-contact-phone"
                    placeholder="+34 612 345 678"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/asesor/empresas')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                data-testid="save-company-btn"
                className="bg-[#8b1530] hover:bg-[#701126] gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? 'Guardar cambios' : 'Crear empresa'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CompanyForm;
