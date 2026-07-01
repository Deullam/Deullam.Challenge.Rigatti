import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Badge,
} from "vite_react_shadcn_ts";

export const ProductCard = () => (
  <Card className="w-[320px]">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Fone Bluetooth Pro</CardTitle>
        <Badge>Em estoque</Badge>
      </div>
      <CardDescription>Áudio sem fio com cancelamento de ruído ativo.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold">R$ 499,90</p>
      <p className="text-sm text-muted-foreground">Frete grátis para todo o Brasil</p>
    </CardContent>
    <CardFooter className="gap-2">
      <Button className="flex-1">Adicionar</Button>
      <Button variant="outline">Detalhes</Button>
    </CardFooter>
  </Card>
);

export const StatCard = () => (
  <Card className="w-[260px]">
    <CardHeader className="pb-2">
      <CardDescription>Vendas no mês</CardDescription>
      <CardTitle className="text-3xl">1.284</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">+12,5% vs. mês anterior</p>
    </CardContent>
  </Card>
);

export const SimpleCard = () => (
  <Card className="w-[320px]">
    <CardHeader>
      <CardTitle>Notificações</CardTitle>
      <CardDescription>Você tem 3 mensagens não lidas.</CardDescription>
    </CardHeader>
    <CardContent className="text-sm">
      Configure como e quando deseja ser avisado sobre novos pedidos.
    </CardContent>
  </Card>
);
