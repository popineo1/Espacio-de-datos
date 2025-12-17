import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { 
  Plus, 
  Search,
  Building2,
  Eye,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    fetchCompanies();
  }, [token, statusFilter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search) {
        params.append('search', search);
      }
      
      const response = await axios.get(`${API_URL}/companies?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'lead': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'apta': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'descartada': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      lead: 'bg-amber-100 text-amber-800',
      apta: 'bg-green-100 text-green-800',
      descartada: 'bg-red-100 text-red-800'
    };
    const labels = {
      lead: 'En evaluación',
      apta: 'Apta',
      descartada: 'Descartada'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {getStatusIcon(status)}
        {labels[status]}
      </span>
    );
  };

  return (
    <div data-testid="company-list" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
            Empresas / Clientes
          </h1>
          <p className="text-[#64748b] mt-1">
            Gestiona las empresas y sus diagnósticos
          </p>
        </div>
        <Button
          onClick={() => navigate('/asesor/empresas/nueva')}
          data-testid="create-company-btn"
          className="bg-[#8b1530] hover:bg-[#701126] gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
              <Input
                placeholder="Buscar por nombre, NIF o contacto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="search-companies"
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="status-filter">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="lead">En evaluación</SelectItem>
                <SelectItem value="apta">Aptas</SelectItem>
                <SelectItem value="descartada">Descartadas</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle>Empresas ({companies.length})</CardTitle>
          <CardDescription>Lista de empresas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#8b1530]" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-[#64748b] mx-auto mb-4" />
              <p className="text-[#64748b]">No se encontraron empresas</p>
              <Button
                onClick={() => navigate('/asesor/empresas/nueva')}
                className="mt-4 bg-[#8b1530] hover:bg-[#701126]"
              >
                Añadir primera empresa
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>NIF</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} data-testid={`company-row-${company.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#fbeff3] flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-[#8b1530]" />
                        </div>
                        <span className="font-medium text-[#0f172a]">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#64748b] font-mono text-sm">{company.nif}</TableCell>
                    <TableCell className="text-[#64748b]">{company.sector || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-[#0f172a]">{company.contact_name || '-'}</p>
                        <p className="text-xs text-[#64748b]">{company.contact_phone || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(company.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/asesor/empresas/${company.id}`)}
                        data-testid={`view-company-${company.id}`}
                        className="gap-2 text-[#8b1530] hover:text-[#701126] hover:bg-[#fbeff3]"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyList;
