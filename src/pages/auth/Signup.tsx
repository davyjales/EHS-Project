
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FaGoogle } from "react-icons/fa";
import { Leaf } from "lucide-react";
import { UserType } from "@/types";

export default function Signup() {
  const { signup, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState<UserType>("industry");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    
    try {
      await signup(email, password, name, userType);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Falha no cadastro. Tente novamente.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Falha no cadastro com Google.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4 sm:p-6 lg:p-8">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Leaf className="h-6 w-6 text-eco-green-600" />
        <span className="text-xl font-bold text-eco-green-600">EcoConnect</span>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar uma conta</CardTitle>
          <CardDescription>
            Conecte-se à rede de gerenciamento de resíduos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-2 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou nome da empresa"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                autoComplete="new-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
                autoComplete="new-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de conta</Label>
              <RadioGroup 
                defaultValue={userType} 
                onValueChange={(value) => setUserType(value as UserType)}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="industry" id="industry" />
                  <Label htmlFor="industry" className="font-normal">
                    Indústria (quero vender ou repassar resíduos)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="collector" id="collector" />
                  <Label htmlFor="collector" className="font-normal">
                    Coletor (quero comprar ou coletar resíduos)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative bg-background px-3 text-muted-foreground text-sm">ou continue com</div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full"
          >
            <FaGoogle className="mr-2" />
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
