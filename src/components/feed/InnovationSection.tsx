
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb, Microscope, Recycle } from "lucide-react";
import { Link } from "react-router-dom";

interface Innovation {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  author: string;
  date: Date;
}

// Dados mockados para demonstração
const mockInnovations: Innovation[] = [
  {
    id: "inov-1",
    title: "Transformação de plástico em combustível",
    description: "Uma nova técnica para converter resíduos plásticos em combustível sustentável",
    category: "reciclagem",
    author: "Dr. Ana Silva",
    date: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: "inov-2",
    title: "Compactadores solares",
    description: "Compactadores de resíduos que usam energia solar, reduzindo custos operacionais",
    category: "equipamento",
    author: "Eng. Roberto Carlos",
    date: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: "inov-3",
    title: "Bioplásticos a partir de resíduos agrícolas",
    description: "Método para produzir bioplásticos utilizando resíduos da agricultura local",
    category: "pesquisa",
    author: "Universidade Federal",
    date: new Date(Date.now() - 86400000 * 15),
  }
];

interface InnovationSectionProps {
  userType: "industry" | "collector";
}

export function InnovationSection({ userType }: InnovationSectionProps) {
  const title = userType === "industry" 
    ? "Inovações em Reciclagem" 
    : "Ideias de Coleta";
  
  const description = userType === "industry"
    ? "Descubra as últimas tecnologias e processos para otimizar o aproveitamento de resíduos"
    : "Novas estratégias e métodos para melhorar suas operações de coleta";

  const innovations = mockInnovations;

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { color: string, icon: JSX.Element }> = {
      "reciclagem": { 
        color: "bg-eco-blue-100 text-eco-blue-800 hover:bg-eco-blue-200",
        icon: <Recycle className="h-3 w-3 mr-1" />
      },
      "equipamento": { 
        color: "bg-eco-yellow-100 text-eco-brown-800 hover:bg-eco-yellow-200",
        icon: <Microscope className="h-3 w-3 mr-1" />
      },
      "pesquisa": { 
        color: "bg-eco-green-100 text-eco-green-800 hover:bg-eco-green-200",
        icon: <Lightbulb className="h-3 w-3 mr-1" />
      },
    };

    const { color, icon } = categories[category] || 
      { color: "bg-gray-100 text-gray-800", icon: <Lightbulb className="h-3 w-3 mr-1" /> };

    return (
      <Badge className={`flex items-center ${color}`}>
        {icon}
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to={userType === "industry" ? "/innovations" : "/collection-ideas"}>
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {innovations.map((innovation) => (
          <Card key={innovation.id} className="overflow-hidden">
            {innovation.imageUrl ? (
              <div className="h-48 overflow-hidden">
                <img 
                  src={innovation.imageUrl} 
                  alt={innovation.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-r from-eco-green-100 to-eco-blue-100 flex items-center justify-center">
                <Lightbulb className="h-12 w-12 text-eco-green-600" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{innovation.title}</CardTitle>
                {getCategoryBadge(innovation.category)}
              </div>
              <CardDescription>
                {new Intl.DateTimeFormat('pt-BR').format(innovation.date)} • {innovation.author}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {innovation.description}
              </p>
              <Button variant="link" asChild className="pl-0 mt-2">
                <Link to={`/innovation/${innovation.id}`}>
                  Ler mais
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
