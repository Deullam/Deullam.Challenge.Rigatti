import { Separator } from "vite_react_shadcn_ts";

export const Horizontal = () => (
  <div className="w-[320px]">
    <div className="space-y-1">
      <h4 className="font-medium">Painel da loja</h4>
      <p className="text-sm text-muted-foreground">Gerencie produtos, pedidos e relatórios.</p>
    </div>
    <Separator className="my-4" />
    <p className="text-sm text-muted-foreground">
      Configure integrações e o agente de vendas com IA.
    </p>
  </div>
);

export const Vertical = () => (
  <div className="flex h-6 items-center gap-3 text-sm">
    <span>Produtos</span>
    <Separator orientation="vertical" />
    <span>Pedidos</span>
    <Separator orientation="vertical" />
    <span>Relatórios</span>
  </div>
);
