import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Building2, 
  FileCheck, 
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AsesorDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    leads: 0,
    aptas: 0,
    descartadas: 0,
    projects: 0
  });
  const [recentCompanies, setRecentCompanies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, projectsRes] = await Promise.all([
          axios.get(`${API_URL}/companies`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const companies = companiesRes.data;
        setStats({
          total: companies.length,
          leads: companies.filter(c => c.status === 'lead').length,
          aptas: companies.filter(c => c.status === 'apta').length,
          descartadas: companies.filter(c => c.status === 'descartada').length,
          projects: projectsRes.data.length
        });
        
        // Get 5 most recent companies
        setRecentCompanies(companies.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  const statCards = [
    { label: 'Total Empresas', value: stats.total, icon: Building2, color: 'bg-slate-100 text-slate-600' },
    { label: 'En Evaluación', value: stats.leads, icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Aptas', value: stats.aptas, icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
    { label: 'Descartadas', value: stats.descartadas, icon: XCircle, color: 'bg-red-100 text-red-600' },
  ];

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
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div data-testid="asesor-dashboard" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">
            Panel de Asesor
          </h1>
          <p className="text-[#64748b] mt-1">
            Bienvenido, {user?.name}
          </p>
        </div>
        <Button
          onClick={() => navigate('/asesor/empresas')}
          data-testid="view-companies-btn"
          className="bg-[#8b1530] hover:bg-[#701126] gap-2"
        >
          <Building2 className="h-4 w-4" />
          Gestionar Empresas
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

      {/* Quick Actions + Recent Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8b1530]" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Gestión del CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-[#0f172a]"
              onClick={() => navigate('/asesor/empresas')}
            >
              <Building2 className="h-4 w-4" />
              Ver todas las empresas
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-[#0f172a]"
              onClick={() => navigate('/asesor/empresas?status=lead')}
            >
              <Clock className="h-4 w-4" />
              Empresas pendientes de evaluación
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-[#0f172a]"
              onClick={() => navigate('/asesor/empresas/nueva')}
            >
              <Building2 className="h-4 w-4" />
              Añadir nueva empresa
            </Button>
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#8b1530]" />
              Empresas Recientes
            </CardTitle>
            <CardDescription>Últimas empresas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompanies.length === 0 ? (
              <p className="text-[#64748b] text-sm text-center py-4">
                No hay empresas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {recentCompanies.map((company) => (
                  <div 
                    key={company.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/asesor/empresas/${company.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#fbeff3] flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-[#8b1530]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0f172a]">{company.name}</p>
                        <p className="text-xs text-[#64748b]">{company.nif}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(company.status)}
                      <ArrowRight className="h-4 w-4 text-[#64748b]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      {stats.projects > 0 && (
        <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-[#8b1530]" />
              Proyectos Activos
            </CardTitle>
            <CardDescription>{stats.projects} proyecto(s) en Fase 2: Incorporación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Hay {stats.projects} empresa(s) apta(s) con proyecto de incorporación iniciado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AsesorDashboard;
