
import { useAuth } from "@/contexts/AuthContext";
import { useWaste } from "@/contexts/WasteContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Leaf, Package, Recycle, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { WasteItem } from "@/types";
import { InnovationSection } from "@/components/feed/InnovationSection";
import { Map } from "@/components/map/Map";

export default function Index() {
  const { user } = useAuth();
  const { userWastes } = useWaste();

  // Determina o tipo de feed baseado no tipo de usuário
  const feedTitle = user?.userType === "industry" 
    ? "Coletores Disponíveis" 
    : "Resíduos Disponíveis";

  return (
    <Layout>
      {!user ? (
        <LandingPage />
      ) : (
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Olá, {user.name}!
            </h1>
            <p className="text-muted-foreground">
              {user.userType === "industry" 
                ? "Anuncie seus resíduos e encontre coletores interessados." 
                : "Encontre resíduos disponíveis para coleta."}
            </p>
          </div>

          {/* Mapa de coletas/resíduos */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {user.userType === "industry" ? "Mapa de Coletores" : "Mapa de Resíduos"}
              </h2>
              <Button variant="outline" size="sm">
                Filtrar por região
              </Button>
            </div>
            <Map height="300px" className="w-full" />
          </section>

          {/* Feed principal */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{feedTitle}</h2>
              
              {user.userType === "industry" && (
                <Button asChild>
                  <Link to="/waste/new">
                    Anunciar Resíduo
                  </Link>
                </Button>
              )}
            </div>

            {userWastes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userWastes.map((waste) => (
                  <WasteCard 
                    key={waste.id} 
                    waste={waste}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhum resíduo disponível</h3>
                <p className="mt-2 text-muted-foreground">
                  {user.userType === "industry" 
                    ? "Ainda não há coletores cadastrados. Seja o primeiro a anunciar seus resíduos!" 
                    : "Ainda não há resíduos anunciados. Volte mais tarde!"}
                </p>
                {user.userType === "industry" && (
                  <Button className="mt-4" asChild>
                    <Link to="/waste/new">
                      Anunciar Resíduo
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Seção de inovações/ideias */}
          <InnovationSection userType={user.userType} />
        </div>
      )}
    </Layout>
  );
}

function LandingPage() {
  return (
    <div>
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-eco-green-50 to-white">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div>
              <Badge className="mb-4 bg-eco-green-100 text-eco-green-800 hover:bg-eco-green-200">Sustentabilidade em Rede</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Conectamos quem tem resíduos a quem precisa deles
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                EcoConnect é a ponte entre indústrias e coletores, transformando resíduos em recursos e promovendo a economia circular.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Comece agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">
                    Já tenho uma conta
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block absolute top-1/2 left-10 transform -translate-y-1/2">
          <Leaf className="h-32 w-32 text-eco-green-200 opacity-30" />
        </div>
        <div className="hidden md:block absolute top-1/4 right-10">
          <Recycle className="h-24 w-24 text-eco-blue-200 opacity-30" />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="bg-eco-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-eco-green-600" />
                </div>
                <CardTitle>Anuncie seus resíduos</CardTitle>
                <CardDescription>
                  Indústrias cadastram os resíduos disponíveis, informando o tipo, quantidade e localização.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="bg-eco-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Recycle className="h-6 w-6 text-eco-blue-600" />
                </div>
                <CardTitle>Conecte-se</CardTitle>
                <CardDescription>
                  Coletores encontram os resíduos disponíveis e entram em contato com as indústrias.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="bg-eco-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-eco-brown-600" />
                </div>
                <CardTitle>Feche negócio</CardTitle>
                <CardDescription>
                  Com o acordo fechado, geramos automaticamente um contrato em PDF para documentar a transação.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se à comunidade EcoConnect e faça parte da revolução da economia circular.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">
              Criar uma conta gratuita
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function WasteCard({ waste }: { waste: WasteItem }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="mb-2">{waste.title}</CardTitle>
            <CardDescription>{waste.location}</CardDescription>
          </div>
          <Badge variant="outline">{getWasteTypeLabel(waste.wasteType)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Quantidade</p>
            <p>{waste.quantity} {waste.unit}</p>
          </div>
          {waste.price && (
            <div>
              <p className="text-sm font-medium">Preço</p>
              <p className="font-medium text-eco-green-600">R$ {waste.price}/{waste.unit}</p>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {waste.description || "Sem descrição adicional."}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/waste/${waste.id}`}>
            Ver detalhes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function getWasteTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    plastic: 'Plástico',
    paper: 'Papel/Papelão',
    metal: 'Metal',
    glass: 'Vidro',
    wood: 'Madeira',
    textile: 'Têxtil',
    electronic: 'Eletrônico',
    organic: 'Orgânico',
    chemical: 'Químico',
    other: 'Outros'
  };
  
  return typeMap[type] || type;
}
