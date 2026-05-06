/**
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Página de Autenticação. Gerencia o Login de usuários existentes e a criação de novas empresas (Workspaces).
 */

import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import { authUseCases } from "@/composition/auth";
import { useTheme } from "@/presentation/shared/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Boxes, Moon, Sun, Loader2, Database } from "lucide-react";

// Documentação: Dados estáticos para preencher o formulário rapidamente durante o desenvolvimento
const DEMOS = [
  { company: "TechCorp", admin: "admin@techcorp.com", user: "user@techcorp.com" },
  { company: "FoodCorp", admin: "admin@foodcorp.com", user: "user@foodcorp.com" },
];

export default function LoginPage() {
  const { user, loading, login: contextLogin } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  // Documentação: Estados que guardam o que o usuário digita nos campos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Documentação: Estados de carregamento para mostrar os "spinners" e evitar duplos cliques
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Documentação: Define o título da aba do navegador assim que a página carrega
  useEffect(() => { document.title = "Entrar — Deullam Challenge Rigatti"; }, []);

  // Documentação: Se o sistema detectar que o usuário já tem um token válido, manda direto pro painel
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  /**
   * @description Processa a tentativa de Login usando o Contexto Global.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Documentação: A mágica acontece aqui! 
      // Chamamos a função do contexto. Ela faz o fetch, salva no localStorage 
      // e faz o 'setUser', o que atualiza o React imediatamente.
      await contextLogin({ email, password });

      toast({ title: "Bem-vindo de volta!", description: "Redirecionando para o sistema..." });

      // Documentação: Como o estado 'user' foi atualizado no contexto, 
      // essa navegação será permitida sem precisar de F5.
      nav("/dashboard");

    } catch (err: any) {
      toast({ title: "Falha ao entrar", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  /**
   * @description Processa a criação de uma NOVA empresa (Workspace).
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Documentação: Aqui ainda está usando a chamada direta.
      // O ideal no futuro é criar uma função 'register' no AuthContext 
      // idêntica à de login para que o estado atualize automaticamente aqui também.
      const response = await authUseCases.authRepository.register({ email, password, companyName });

      if (response && response.access_token) {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("auth_user", JSON.stringify(response.user)); // Adicionando o salvamento do user!
      }

      toast({ title: "Empresa criada com sucesso!", description: "Seu workspace está pronto." });

      // Forçamos o reload se o contexto não tratar o registro ainda
      window.location.href = "/dashboard";

    } catch (err: any) {
      toast({ title: "Falha no cadastro", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  // Documentação: Função auxiliar para preencher o formulário com dados de teste
  const fillDemo = (em: string) => {
    setEmail(em);
    setPassword("Demo1234!");
  };
  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      {/* CABEÇALHO SUPERIOR */}
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg gradient-hero grid place-items-center shadow-glow">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          Deullam Challenge Rigatti<span className="text-primary">AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 container grid lg:grid-cols-2 gap-12 items-center py-12">

        {/* LADO ESQUERDO: Textos e Cartão de Demos */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            SaaS multi-empresa<br />
            com um <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">agente de IA</span> integrado.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Cada empresa gerencia seu próprio catálogo. O assistente de IA usa chamadas de ferramentas
            para responder perguntas — restritas estritamente aos dados da sua empresa.
          </p>

          <Card className="bg-card/50 backdrop-blur border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Contas de demonstração</CardTitle>
              <CardDescription>Senha para todas: <code className="font-mono">Demo1234!</code></CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMOS.map(d => (
                <div key={d.company} className="space-y-1">
                  <div className="text-sm font-semibold">{d.company}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => fillDemo(d.admin)}>
                      admin: {d.admin}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => fillDemo(d.user)}>
                      usuário: {d.user}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* LADO DIREITO: Formulários de Login e Cadastro */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Entre com suas credenciais ou crie um workspace para sua empresa.</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Documentação: As abas controlam qual formulário é exibido */}
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Empresa</TabsTrigger>
              </TabsList>

              {/* ABA 1: Formulário de Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Entrar
                  </Button>
                </form>
              </TabsContent>

              {/* ABA 2: Formulário de Criação de Empresa */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">

                  {/* Explicação clara para o usuário sobre o propósito deste formulário */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium">Novo Workspace</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Crie uma nova empresa no sistema. Você será o Administrador.
                      Se você é funcionário, peça ao seu gestor para cadastrá-lo internamente.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da empresa</Label>
                    <Input id="company" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Tech Solutions Ltda." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">Seu E-mail (Admin)</Label>
                    <Input id="email2" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Sua Senha</Label>
                    <Input id="password2" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Criar e Entrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}