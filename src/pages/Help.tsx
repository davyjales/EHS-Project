
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { HelpCircle, MailIcon, MessageSquare, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Help() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simular envio do formulário
    setTimeout(() => {
      toast({
        title: "Mensagem enviada!",
        description: "Nossa equipe entrará em contato em breve.",
        duration: 5000,
      });
      
      // Limpar formulário
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubmitting(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Precisando de Ajuda?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar com qualquer dúvida sobre a plataforma, 
            processos de reciclagem ou para resolver problemas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="bg-eco-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-eco-green-600" />
              </div>
              <CardTitle>Chat de Suporte</CardTitle>
              <CardDescription>
                Inicie um chat ao vivo com nossos especialistas durante o horário comercial.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center text-center">
              <div className="bg-eco-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-eco-blue-600" />
              </div>
              <CardTitle>Contato Telefônico</CardTitle>
              <CardDescription>
                Fale conosco diretamente por telefone para resolver suas dúvidas.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg font-medium mb-2">0800 123 4567</p>
              <p className="text-sm text-muted-foreground">
                Segunda a Sexta, 8h às 18h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center text-center">
              <div className="bg-eco-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-eco-brown-600" />
              </div>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                Encontre respostas para as dúvidas mais comuns em nossa base de conhecimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Ver FAQs
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Entre em Contato</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Assunto
                </label>
                <Input 
                  id="subject" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem
                </label>
                <Textarea 
                  id="message" 
                  rows={5} 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar Mensagem"}
                <MailIcon className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>RecyclingSA - Conectando quem tem resíduos a quem precisa deles</p>
          <p>contato@recyclingsa.com.br</p>
        </div>
      </div>
    </Layout>
  );
}
