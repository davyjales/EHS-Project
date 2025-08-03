
import { ReactNode } from "react";
import { Header } from "./Header";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && (
        <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} RecyclingSA. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
