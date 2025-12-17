import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/layout/Banner';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldX, ArrowLeft, LogOut, Clock } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();
  
  const reason = location.state?.reason;
  const isNoRole = reason === 'no-role';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col">
      <Banner />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-16">
        <Card 
          data-testid="unauthorized-card"
          className="w-full max-w-md shadow-xl border-0"
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
              {isNoRole ? (
                <Clock className="h-10 w-10 text-amber-500" />
              ) : (
                <ShieldX className="h-10 w-10 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-[#0f172a]">
              {isNoRole ? 'Cuenta Pendiente' : 'Acceso No Autorizado'}
            </CardTitle>
            <CardDescription className="text-[#64748b]">
              {isNoRole 
                ? 'Tu cuenta aún no tiene un rol asignado. Contacta con el administrador.'
                : 'No tienes permisos para acceder a esta sección.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isNoRole && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <p className="font-medium mb-1">¿Qué significa esto?</p>
                <p>Un administrador debe asignarte un rol (Admin, Asesor o Cliente) para que puedas acceder al sistema.</p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {!isNoRole && (
                <Button
                  onClick={() => navigate(-1)}
                  data-testid="go-back-button"
                  variant="outline"
                  className="w-full gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver atrás
                </Button>
              )}
              
              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  data-testid="logout-from-unauthorized"
                  className="w-full gap-2 bg-[#8b1530] hover:bg-[#701126]"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              )}
              
              {!isAuthenticated && (
                <Button
                  onClick={() => navigate('/login')}
                  data-testid="go-to-login"
                  className="w-full bg-[#8b1530] hover:bg-[#701126]"
                >
                  Ir al inicio de sesión
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default Unauthorized;
