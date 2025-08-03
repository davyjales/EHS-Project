
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWaste } from "@/contexts/WasteContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileText } from "lucide-react";
import { Contract } from "@/types";
import { jsPDF } from "jspdf";

export default function UserContracts() {
  const { user } = useAuth();
  const { getUserContracts, getWasteItemById } = useWaste();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const contracts = getUserContracts();

  const downloadContract = (contract: Contract) => {
    setLoading(true);
    
    const waste = getWasteItemById(contract.wasteItemId);
    
    if (!waste) {
      console.error("Resíduo não encontrado");
      setLoading(false);
      return;
    }
    
    // Criar o PDF
    const doc = new jsPDF();
    
    // Título do documento
    doc.setFontSize(20);
    doc.text("CONTRATO DE COMPRA E VENDA DE RESÍDUOS", 105, 20, { align: "center" });
    
    // Informações do contrato
    doc.setFontSize(12);
    doc.text("CONTRATO Nº: " + contract.id, 20, 40);
    doc.text("DATA: " + new Date(contract.createdAt).toLocaleDateString('pt-BR'), 20, 50);
    
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
    doc.line(20, 200, 100, 200);
    doc.text(contract.sellerName, 20, 210);
    
    doc.line(120, 200, 200, 200);
    doc.text(contract.buyerName, 120, 210);
    
    // Salvar o PDF
    doc.save(`contrato-${contract.id}.pdf`);
    setLoading(false);
  };

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Meus Contratos</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
        
        {contracts.length > 0 ? (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Contrato #{contract.id.split("-")[1]}
                    </CardTitle>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Data
                      </p>
                      <p>
                        {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {user.userType === "industry" ? "Comprador" : "Vendedor"}
                      </p>
                      <p>
                        {user.userType === "industry" ? contract.buyerName : contract.sellerName}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Quantidade
                      </p>
                      <p>{contract.quantity} {contract.unit}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Valor total
                      </p>
                      <p>
                        {contract.price 
                          ? `R$ ${(contract.price * contract.quantity).toFixed(2)}`
                          : "Não especificado"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => downloadContract(contract)}
                      disabled={loading}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhum contrato encontrado</h3>
            <p className="mt-2 text-muted-foreground">
              Você ainda não possui contratos registrados.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
