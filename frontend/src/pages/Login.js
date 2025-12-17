import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/layout/Banner';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'asesor') {
        navigate('/asesor');
      } else if (user.role === 'cliente') {
        navigate('/cliente');
      } else {
        navigate('/unauthorized');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col">
      <Banner />
      
      <div 
        className="flex-1 flex items-center justify-center p-4 pt-16"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/12149152/pexels-photo-12149152.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#f4f6fb]/90" />
        
        <Card 
          data-testid="login-card"
          className="w-full max-w-md relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
        >
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#fbeff3] flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-[#8b1530] flex items-center justify-center">
                <span className="text-white font-bold text-lg">ED</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-[#0f172a]">
              Espacio de Datos
            </CardTitle>
            <CardDescription className="text-[#64748b]">
              Inicia sesión para acceder a tu panel
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="login-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0f172a]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="email-input"
                    className="pl-10 border-slate-200 focus:ring-[#8b1530] focus:border-[#8b1530]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0f172a]">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="password-input"
                    className="pl-10 border-slate-200 focus:ring-[#8b1530] focus:border-[#8b1530]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                data-testid="login-submit"
                disabled={loading}
                className="w-full bg-[#8b1530] hover:bg-[#701126] text-white font-medium py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-center text-[#64748b] mb-3">Usuarios de demostración:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="font-medium text-[#0f172a]">Admin</p>
                  <p className="text-[#64748b]">admin123</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="font-medium text-[#0f172a]">Asesor</p>
                  <p className="text-[#64748b]">asesor123</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="font-medium text-[#0f172a]">Cliente</p>
                  <p className="text-[#64748b]">cliente123</p>
                </div>
              </div>
              <p className="text-xs text-center text-[#64748b] mt-2">
                Email: [rol]@espaciodatos.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default Login;
