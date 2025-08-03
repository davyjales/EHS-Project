
import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserType } from "@/types";

// Criando um modelo de usuário mockado para simular autenticação
const createMockUser = (userType: UserType): User => ({
  id: `user-${Math.random().toString(36).substring(2, 9)}`,
  name: userType === "industry" ? "Indústria Demo" : "Coletor Demo",
  email: `${userType}@exemplo.com`,
  userType,
  createdAt: new Date(),
  location: userType === "industry" ? "São Paulo, SP" : "Rio de Janeiro, RJ",
  photoURL: `https://ui-avatars.com/api/?name=${userType === "industry" ? "Industria" : "Coletor"}&background=random`
});

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, userType: UserType) => Promise<void>;
  setUserType: (userType: UserType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Funções simuladas de autenticação
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simula um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determina o tipo de usuário pela primeira parte do email
      const userType: UserType = email.startsWith("industry") ? "industry" : "collector";
      setUser(createMockUser(userType));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Simula um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por padrão, usamos o tipo "industry" para demonstração
      setUser(createMockUser("industry"));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Simula um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, userType: UserType) => {
    setLoading(true);
    try {
      // Simula um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Cria um usuário com o tipo especificado
      setUser({
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        userType,
        createdAt: new Date(),
        location: "Localização não definida",
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      });
    } finally {
      setLoading(false);
    }
  };

  const setUserType = (userType: UserType) => {
    if (user) {
      setUser({ ...user, userType });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, signup, setUserType }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
