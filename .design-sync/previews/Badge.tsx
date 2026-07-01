import { Badge } from "vite_react_shadcn_ts";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge>Padrão</Badge>
    <Badge variant="secondary">Secundário</Badge>
    <Badge variant="destructive">Destrutivo</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
);

export const StatusBadges = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge>Em estoque</Badge>
    <Badge variant="secondary">Pré-venda</Badge>
    <Badge variant="destructive">Esgotado</Badge>
    <Badge variant="outline">Descontinuado</Badge>
  </div>
);
