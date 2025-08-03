
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Package, FileText, UserCircle, LogOut, RecycleIcon, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-eco-green-800">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <RecycleIcon className="h-6 w-6 text-white" />
          <span className="text-xl font-bold text-white">RecyclingSA</span>
        </Link>
        <div className="flex-1" />
        
        {/* Botão de ajuda sempre visível */}
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="mr-4 text-white hover:bg-eco-green-700"
        >
          <Link to="/help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Ajuda
          </Link>
        </Button>
        
        {user ? (
          <nav className="flex items-center gap-4">
            {user.userType === "industry" && (
              <Button asChild variant="outline" size="sm" className="bg-white text-eco-green-800 hover:bg-eco-green-50">
                <Link to="/waste/new">
                  <Package className="mr-2 h-4 w-4" />
                  Anunciar Resíduo
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full border-2 border-white">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6 text-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contracts" className="w-full cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Meus Contratos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-white hover:bg-eco-green-700">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-white text-eco-green-800 hover:bg-eco-green-50">
              <Link to="/signup">Criar conta</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
