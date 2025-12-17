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
import { Loader2, Mail, Lock, AlertCircle, ArrowRight, Shield, CheckCircle2, FileCheck } from 'lucide-react';

const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
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

  // Landing Page View
  if (!showLogin) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex flex-col">
        <Banner />
        
        <div className="flex-1 pt-[42px]">
          {/* Hero Section */}
          <section className="py-16 md:py-24 px-4">
            <div className="max-w-5xl mx-auto">
              {/* Logo and Brand */}
              <div className="text-center mb-12">
                <img 
                  src="https://customer-assets.emergentagent.com/job_auth-foundation-1/artifacts/gbgikawn_logo.png" 
                  alt="Tu Administrativo" 
                  className="h-24 md:h-32 mx-auto mb-8"
                />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0f172a] tracking-tight mb-4">
                  Espacio de Datos
                </h1>
                <p className="text-lg md:text-xl text-[#64748b] max-w-2xl mx-auto">
                  Incorporación real a espacios de datos · Evaluación profesional · Opción de subvención
                </p>
              </div>

              {/* CTA Button */}
              <div className="text-center mb-16">
                <Button
                  onClick={() => setShowLogin(true)}
                  data-testid="access-platform-btn"
                  className="bg-[#8b1530] hover:bg-[#701126] text-white px-8 py-6 text-lg font-medium rounded-lg gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  Acceder a la plataforma
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Key Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Message 1 - Principal */}
                <Card className="border-0 shadow-[0_4px_20px_rgba(139,21,48,0.08)] bg-white col-span-1 md:col-span-2">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#fbeff3] flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-[#8b1530]" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-2">
                          Esto no es un kit ni una ayuda automática.
                        </h3>
                        <p className="text-[#64748b]">
                          Plataforma profesional para empresas que quieren hacer las cosas bien.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Message 2 */}
                <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0f172a] mb-1">Paso 1</p>
                        <p className="text-[#64748b] text-sm">
                          Primero se ejecuta la incorporación real al espacio de datos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Message 3 */}
                <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0f172a] mb-1">Paso 2</p>
                        <p className="text-[#64748b] text-sm">
                          Después, si procede, se solicita la subvención para cubrir esos costes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 border-t border-slate-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <p className="text-sm text-[#64748b]">
                © {new Date().getFullYear()} Tu Administrativo · Servicios administrativos on line
              </p>
            </div>
          </footer>
        </div>

        <WhatsAppButton />
      </div>
    );
  }

  // Login Form View
  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col">
      <Banner />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-16">
        <Card 
          data-testid="login-card"
          className="w-full max-w-md shadow-xl border-0 bg-white"
        >
          <CardHeader className="space-y-1 text-center pb-6 relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute -top-2 left-0 text-[#64748b] hover:text-[#0f172a] text-sm flex items-center gap-1"
            >
              ← Volver
            </button>
            <img 
              src="https://customer-assets.emergentagent.com/job_auth-foundation-1/artifacts/gbgikawn_logo.png" 
              alt="Tu Administrativo" 
              className="h-16 mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-bold text-[#0f172a]">
              Acceso a la plataforma
            </CardTitle>
            <CardDescription className="text-[#64748b]">
              Introduce tus credenciales para acceder
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
          </CardContent>
        </Card>
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default Login;
