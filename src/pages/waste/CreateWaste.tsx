
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useWaste } from "@/contexts/WasteContext";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { WasteType, wasteTypeOptions, UnitType, unitTypeOptions } from "@/types";

type FormData = {
  title: string;
  wasteType: WasteType;
  quantity: number;
  unit: UnitType;
  location: string;
  description?: string;
  price?: number;
};

export default function CreateWaste() {
  const { user } = useAuth();
  const { addWasteItem } = useWaste();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      wasteType: "plastic",
      unit: "kg",
    }
  });
  
  if (!user || user.userType !== "industry") {
    navigate("/");
    return null;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await addWasteItem(data);
      navigate("/");
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
    } finally {
      setLoading(false);
    }
  };

  // Para acompanhar os valores selecionados nos campos de select
  const wasteType = watch("wasteType");
  const unitType = watch("unit");

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Anunciar Resíduo</h1>
          <p className="text-muted-foreground mt-2">
            Preencha os dados abaixo para anunciar um resíduo para coleta.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do anúncio <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              {...register("title", { required: "O título é obrigatório" })}
              placeholder="Ex: Lote de papelão para reciclagem"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="wasteType">Tipo de resíduo <span className="text-destructive">*</span></Label>
              <Select 
                defaultValue={wasteType} 
                onValueChange={(value) => setValue("wasteType", value as WasteType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de resíduo" />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localização <span className="text-destructive">*</span></Label>
              <Input
                id="location"
                {...register("location", { required: "A localização é obrigatória" })}
                placeholder="Ex: São Paulo, SP"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade <span className="text-destructive">*</span></Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", { 
                  required: "A quantidade é obrigatória",
                  min: { value: 0.01, message: "A quantidade deve ser maior que zero" }
                })}
                step="0.01"
                placeholder="Ex: 500"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade <span className="text-destructive">*</span></Label>
              <Select 
                defaultValue={unitType} 
                onValueChange={(value) => setValue("unit", value as UnitType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço por unidade (opcional)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="price"
                  type="number"
                  {...register("price")}
                  step="0.01"
                  placeholder="Ex: 1.50"
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva os detalhes do resíduo, como condição, características específicas, etc."
              rows={5}
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Publicar Anúncio"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
