import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/presentation/auth/AuthContext";
import { useTheme } from "@/presentation/shared/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Moon, Sun, Sparkles, Package, MessagesSquare } from "lucide-react";

/**
 * Presentation-layer shell shared by all authenticated routes.
 * Pure UI: it consumes auth/theme via hooks and never touches infrastructure directly.
 */
export default function AppLayout() {
  const { user, loading, role, companyId, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg gradient-hero grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>Deullam Rigatti<span className="text-primary">AI</span></span>
            {companyId && <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">{companyId}</Badge>}
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`
            }>
              <Package className="h-4 w-4" /> <span className="hidden sm:inline">Produtos</span>
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`
            }>
              <MessagesSquare className="h-4 w-4" /> <span className="hidden sm:inline">Chat</span>
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {role && <Badge variant={role === "admin" ? "default" : "outline"} className="hidden sm:inline-flex">{role}</Badge>}
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
