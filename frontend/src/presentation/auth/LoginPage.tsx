import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { authUseCases } from "@/composition/auth";
import { useTheme } from "@/presentation/shared/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Moon, Sun, Loader2, Database } from "lucide-react";

const DEMOS = [
  { company: "TechCorp", admin: "admin@techcorp.com", user: "user@techcorp.com" },
  { company: "FoodCorp", admin: "admin@foodcorp.com", user: "user@foodcorp.com" },
];

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { document.title = "Entrar — TenantAI"; }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authUseCases.signIn({ email, password });
      nav("/dashboard");
    } catch (err: any) {
      toast({ title: "Falha ao entrar", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authUseCases.signUp({ email, password, companyName });
      toast({ title: "Conta criada", description: "Você já está autenticado." });
      nav("/dashboard");
    } catch (err: any) {
      toast({ title: "Falha no cadastro", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (em: string) => { setEmail(em); setPassword("Demo1234!"); };

  const seed = async () => {
    setSeeding(true);
    const { data, error } = await supabase.functions.invoke("seed-demo");
    setSeeding(false);
    if (error) toast({ title: "Falha ao popular dados", description: error.message, variant: "destructive" });
    else toast({ title: "Dados de demonstração prontos", description: "Todas as 4 contas demo foram criadas." });
    console.log("seed result", data);
  };

  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg gradient-hero grid place-items-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          Tenant<span className="text-primary">AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <div className="flex-1 container grid lg:grid-cols-2 gap-12 items-center py-12">
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
              <Button size="sm" variant="secondary" onClick={seed} disabled={seeding} className="w-full mt-2">
                {seeding ? <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Populando…</> : "Popular dados de demonstração"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Entre na sua conta ou crie um novo workspace para sua empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da empresa</Label>
                    <Input id="company" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Empresa Exemplo Ltda." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email2">E-mail</Label>
                    <Input id="email2" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Senha</Label>
                    <Input id="password2" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Criar empresa
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
