
import { useParams, useNavigate } from "react-router-dom";
import { useWaste } from "@/contexts/WasteContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Package, Truck, MessageCircle } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { Contract } from "@/types";

export default function WasteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWasteItemById, createContract } = useWaste();
  const { user } = useAuth();
  const { createChat } = useChat();
  const [quantity, setQuantity] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [chatCreated, setChatCreated] = useState(false);
  
  const waste = id ? getWasteItemById(id) : undefined;

  if (!waste) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Resíduo não encontrado</h1>
          <p className="mb-8">O resíduo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate("/")}>Voltar para a página inicial</Button>
        </div>
      </Layout>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateContract = async () => {
    if (!user) return;
    
    try {
      // Cria o contrato
      const newContract = await createContract(
        waste.id,
        user.id,
        user.name,
        quantity,
        waste.unit,
        waste.price
      );
      
      setContract(newContract);
      
      // Gera o PDF
      generateContractPDF(newContract);
      
      // Fecha o diálogo e navega para a página de sucesso
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
    }
  };

  const generateContractPDF = (contract: Contract) => {
    const doc = new jsPDF();
    
    // Título do documento
    doc.setFontSize(20);
    doc.text("CONTRATO DE COMPRA E VENDA DE RESÍDUOS", 105, 20, { align: "center" });
    
    // Informações do contrato
    doc.setFontSize(12);
    doc.text("CONTRATO Nº: " + contract.id, 20, 40);
    doc.text("DATA: " + new Date().toLocaleDateString('pt-BR'), 20, 50);
    
    // Partes envolvidas
    doc.setFontSize(14);
    doc.text("PARTES ENVOLVIDAS:", 20, 70);
    doc.setFontSize(12);
    doc.text("VENDEDOR: " + contract.sellerName, 20, 80);
    doc.text("COMPRADOR: " + contract.buyerName, 20, 90);
    
    // Informações do resíduo
    doc.setFontSize(14);
    doc.text("OBJETO:", 20, 110);
    doc.setFontSize(12);
    doc.text("Tipo de resíduo: " + waste.wasteType, 20, 120);
    doc.text("Quantidade: " + contract.quantity + " " + contract.unit, 20, 130);
    if (contract.price) {
      doc.text("Valor: R$ " + (contract.price * contract.quantity).toFixed(2), 20, 140);
    }
    
    // Assinaturas
    doc.setFontSize(14);
    doc.text("ASSINATURAS:", 20, 180);
    doc.line(20, 200, 100, 200); // Linha para assinatura do vendedor
    doc.text(contract.sellerName, 20, 210);
    
    doc.line(120, 200, 200, 200); // Linha para assinatura do comprador
    doc.text(contract.buyerName, 120, 210);
    
    // Salva o PDF
    doc.save(`contrato-${contract.id}.pdf`);
  };

  const handleCreateChat = async () => {
    if (!user || !waste) return;
    
    try {
      await createChat(waste.id, waste.ownerId, waste.ownerName);
      setChatCreated(true);
      
      // Remove a mensagem após 3 segundos
      setTimeout(() => setChatCreated(false), 3000);
    } catch (error) {
      console.error("Erro ao criar chat:", error);
    }
  };

  const getWasteTypeLabel = (type: string): string => {
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
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              ← Voltar
            </Button>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">{waste.title}</h1>
                <Badge variant="outline">{getWasteTypeLabel(waste.wasteType)}</Badge>
              </div>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" /> {waste.location}
              </div>
              
              <div className="flex items-center text-muted-foreground mb-6">
                <Calendar className="h-4 w-4 mr-1" /> Publicado em {formatDate(waste.createdAt)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Quantidade disponível</h3>
                  <p className="text-2xl font-bold">{waste.quantity} {waste.unit}</p>
                </div>
                
                {waste.price && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-1">Preço por {waste.unit}</h3>
                    <p className="text-2xl font-bold text-eco-green-600">R$ {waste.price.toFixed(2)}</p>
                  </div>
                )}
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Vendedor</h3>
                  <p className="text-lg font-medium">{waste.ownerName}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Descrição</h2>
                <p className="text-muted-foreground">
                  {waste.description || "Nenhuma descrição fornecida."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Interessado neste resíduo?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Entre em contato com o vendedor para negociar e gerar um contrato automaticamente.
                </p>
              </div>

              {user?.userType === "collector" && waste.isAvailable && (
                <>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Truck className="h-4 w-4 mr-2" />
                        Solicitar coleta
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Solicitar coleta de resíduo</DialogTitle>
                      <DialogDescription>
                        Defina a quantidade que deseja coletar. Um contrato será gerado automaticamente.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">
                          Quantidade (disponível: {waste.quantity} {waste.unit})
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min={1}
                          max={waste.quantity}
                          required
                        />
                      </div>
                      
                      {waste.price && (
                        <div>
                          <Label>Valor total estimado</Label>
                          <p className="text-lg font-medium text-eco-green-600 mt-1">
                            R$ {(waste.price * quantity).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={handleCreateContract} disabled={quantity <= 0 || quantity > waste.quantity}>
                        Gerar contrato e baixar PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={handleCreateChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar com Vendedor
                </Button>
                </>
              )}

              {user?.userType === "industry" && (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Como indústria, você não pode coletar resíduos.
                  </p>
                </div>
              )}
              
              {!user && (
                <div className="text-center py-4">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Faça login para solicitar a coleta deste resíduo.
                  </p>
                  <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                    Fazer login
                  </Button>
                </div>
              )}
              
              {contract && (
                <div className="mt-4 p-3 bg-eco-green-100 text-eco-green-800 rounded-lg text-sm">
                  <p className="font-medium">Contrato gerado com sucesso!</p>
                  <p>O PDF foi baixado automaticamente.</p>
                </div>
              )}
              
              {chatCreated && (
                <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
                  <p className="font-medium">Chat criado com sucesso!</p>
                  <p>Agora você pode conversar com o vendedor. Clique no ícone de mensagens no topo da página.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
