import { Progress } from "vite_react_shadcn_ts";

export const MetaMensal = () => (
  <div className="w-[280px] space-y-2">
    <div className="flex justify-between text-sm">
      <span>Meta mensal de vendas</span>
      <span className="text-muted-foreground">66%</span>
    </div>
    <Progress value={66} />
  </div>
);

export const Niveis = () => (
  <div className="w-[280px] space-y-4">
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Estoque crítico</p>
      <Progress value={18} />
    </div>
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Pedidos processados</p>
      <Progress value={45} />
    </div>
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Catálogo completo</p>
      <Progress value={92} />
    </div>
  </div>
);
