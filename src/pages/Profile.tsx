
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User } from "@/types";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    description: user?.description || ""
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulando atualização de dados (seria integrado com backend)
    setTimeout(() => {
      toast.success("Perfil atualizado com sucesso");
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

        <Card>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tipo de conta
                  </p>
                  <p>{user.userType === "industry" ? "Indústria" : "Coletor"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </p>
                  <p>{user.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Localização
                  </p>
                  <p>{user.location || "Não informado"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Descrição
                  </p>
                  <p>{user.description || "Não informado"}</p>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t">
              <Button variant="outline" onClick={handleLogout}>
                Sair da conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
