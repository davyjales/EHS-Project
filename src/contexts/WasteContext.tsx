
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { WasteItem, Contract, User } from "@/types";
import { useAuth } from "./AuthContext";

// Dados mockados para simular um banco de dados
const generateMockWasteItems = (): WasteItem[] => [
  {
    id: "waste-1",
    title: "Lote de papelão",
    ownerId: "user-industry-1",
    ownerName: "Indústria Papel Forte",
    wasteType: "paper",
    quantity: 500,
    unit: "kg",
    location: "São Paulo, SP",
    description: "Papelão limpo de caixas de embalagens, pronto para reciclagem",
    imageUrl: "https://images.unsplash.com/photo-1605600659726-073aggressive-paints?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyZGJvYXJkfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    price: 0.8,
    currency: "BRL",
    isAvailable: true,
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 dias atrás
    updatedAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: "waste-2",
    title: "Plástico PET",
    ownerId: "user-industry-2",
    ownerName: "BebCorp Ltda",
    wasteType: "plastic",
    quantity: 350,
    unit: "kg",
    location: "Campinas, SP",
    description: "Garrafas PET transparentes limpas",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-9bbc9f4c9d11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cGxhc3RpYyUyMGJvdHRsZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    price: 1.2,
    currency: "BRL",
    isAvailable: true,
    createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    id: "waste-3",
    title: "Retalhos de madeira",
    ownerId: "user-industry-3",
    ownerName: "Móveis Naturais SA",
    wasteType: "wood",
    quantity: 800,
    unit: "kg",
    location: "Belo Horizonte, MG",
    description: "Retalhos de madeira pinus de sobra de produção",
    imageUrl: "https://images.unsplash.com/photo-1610479651294-62a8668fd375?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8d29vZCUyMHNjcmFwc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    price: 0.5,
    currency: "BRL",
    isAvailable: true,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 dias atrás
    updatedAt: new Date(Date.now() - 86400000 * 3)
  },
  {
    id: "waste-4",
    title: "Resíduos metálicos",
    ownerId: "user-industry-4",
    ownerName: "MetalMax Indústria",
    wasteType: "metal",
    quantity: 1200,
    unit: "kg",
    location: "Joinville, SC",
    description: "Sobras de aço inox e alumínio de processos industriais",
    imageUrl: "https://images.unsplash.com/photo-1618330934914-1a918ee85426?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2NyYXAlMjBtZXRhbHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    price: 3.5,
    currency: "BRL",
    isAvailable: true,
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 dias atrás
    updatedAt: new Date(Date.now() - 86400000 * 4)
  },
  {
    id: "waste-5",
    title: "Vidro misturado",
    ownerId: "user-industry-5",
    ownerName: "VidroArt Embalagens",
    wasteType: "glass",
    quantity: 600,
    unit: "kg",
    location: "Recife, PE",
    description: "Cacos de vidro de diferentes cores",
    imageUrl: "https://images.unsplash.com/photo-1599540937765-a42e27d40897?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Z2xhc3MlMjBzY3JhcHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    price: 0.6,
    currency: "BRL",
    isAvailable: true,
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 dias atrás
    updatedAt: new Date(Date.now() - 86400000 * 7)
  }
];

interface WasteContextType {
  wasteItems: WasteItem[];
  contracts: Contract[];
  userWastes: WasteItem[];
  addWasteItem: (wasteItem: Omit<WasteItem, 'id' | 'ownerId' | 'ownerName' | 'createdAt' | 'updatedAt' | 'isAvailable'>) => Promise<void>;
  updateWasteItem: (id: string, updates: Partial<WasteItem>) => Promise<void>;
  deleteWasteItem: (id: string) => Promise<void>;
  createContract: (wasteItemId: string, buyerId: string, buyerName: string, quantity: number, unit: string, price?: number) => Promise<Contract>;
  updateContractStatus: (id: string, status: Contract['status']) => Promise<void>;
  getWasteItemById: (id: string) => WasteItem | undefined;
  getContractById: (id: string) => Contract | undefined;
  getUserWastes: () => WasteItem[];
  getUserContracts: () => Contract[];
}

const WasteContext = createContext<WasteContextType | undefined>(undefined);

export function WasteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wasteItems, setWasteItems] = useState<WasteItem[]>(generateMockWasteItems());
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [userWastes, setUserWastes] = useState<WasteItem[]>([]);

  // Atualiza os resíduos do usuário quando o usuário muda
  useEffect(() => {
    if (user) {
      // Para usuários da indústria, mostramos seus próprios resíduos
      if (user.userType === "industry") {
        setUserWastes(wasteItems.filter(item => item.ownerId === user.id));
      } 
      // Para coletores, mostramos todos os resíduos disponíveis (de outras pessoas)
      else {
        setUserWastes(wasteItems.filter(item => item.ownerId !== user.id && item.isAvailable));
      }
    } else {
      setUserWastes([]);
    }
  }, [user, wasteItems]);

  const addWasteItem = async (newItem: Omit<WasteItem, 'id' | 'ownerId' | 'ownerName' | 'createdAt' | 'updatedAt' | 'isAvailable'>) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    const now = new Date();
    const newWasteItem: WasteItem = {
      ...newItem,
      id: `waste-${Math.random().toString(36).substring(2, 9)}`,
      ownerId: user.id,
      ownerName: user.name,
      isAvailable: true,
      createdAt: now,
      updatedAt: now
    };

    setWasteItems(prev => [...prev, newWasteItem]);
    return Promise.resolve();
  };

  const updateWasteItem = async (id: string, updates: Partial<WasteItem>) => {
    setWasteItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
    ));
    return Promise.resolve();
  };

  const deleteWasteItem = async (id: string) => {
    setWasteItems(prev => prev.filter(item => item.id !== id));
    return Promise.resolve();
  };

  const createContract = async (
    wasteItemId: string, 
    buyerId: string, 
    buyerName: string, 
    quantity: number, 
    unit: string, 
    price?: number
  ): Promise<Contract> => {
    const wasteItem = wasteItems.find(item => item.id === wasteItemId);
    if (!wasteItem) throw new Error("Item de resíduo não encontrado");
    
    // Cria o contrato
    const newContract: Contract = {
      id: `contract-${Math.random().toString(36).substring(2, 9)}`,
      wasteItemId,
      sellerId: wasteItem.ownerId,
      sellerName: wasteItem.ownerName,
      buyerId,
      buyerName,
      quantity,
      unit,
      price: price || wasteItem.price,
      currency: wasteItem.currency || "BRL",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Atualiza a quantidade disponível do resíduo
    const remainingQuantity = wasteItem.quantity - quantity;
    
    if (remainingQuantity <= 0) {
      // Se toda a quantidade foi comprada, marca o item como indisponível
      await updateWasteItem(wasteItemId, { 
        quantity: 0, 
        isAvailable: false 
      });
    } else {
      // Atualiza apenas a quantidade
      await updateWasteItem(wasteItemId, { 
        quantity: remainingQuantity 
      });
    }

    // Adiciona o novo contrato
    setContracts(prev => [...prev, newContract]);
    
    return newContract;
  };

  const updateContractStatus = async (id: string, status: Contract['status']) => {
    setContracts(prev => prev.map(contract => 
      contract.id === id ? { ...contract, status, updatedAt: new Date() } : contract
    ));
    return Promise.resolve();
  };

  const getWasteItemById = (id: string) => {
    return wasteItems.find(item => item.id === id);
  };

  const getContractById = (id: string) => {
    return contracts.find(contract => contract.id === id);
  };

  const getUserWastes = () => {
    if (!user) return [];
    return userWastes;
  };

  const getUserContracts = () => {
    if (!user) return [];
    
    // Filtra contratos onde o usuário é comprador ou vendedor
    return contracts.filter(contract => 
      contract.buyerId === user.id || contract.sellerId === user.id
    );
  };

  return (
    <WasteContext.Provider value={{
      wasteItems,
      contracts,
      userWastes,
      addWasteItem,
      updateWasteItem,
      deleteWasteItem,
      createContract,
      updateContractStatus,
      getWasteItemById,
      getContractById,
      getUserWastes,
      getUserContracts
    }}>
      {children}
    </WasteContext.Provider>
  );
}

export function useWaste() {
  const context = useContext(WasteContext);
  if (context === undefined) {
    throw new Error("useWaste must be used within a WasteProvider");
  }
  return context;
}
