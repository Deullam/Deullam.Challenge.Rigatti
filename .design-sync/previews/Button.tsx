import { Button } from "vite_react_shadcn_ts";
import { Plus, Trash2, Loader2 } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Salvar produto</Button>
    <Button variant="secondary">Secundário</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Excluir</Button>
    <Button variant="link">Saiba mais</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Pequeno</Button>
    <Button size="default">Padrão</Button>
    <Button size="lg">Grande</Button>
    <Button size="icon" aria-label="Adicionar"><Plus /></Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button><Plus /> Novo produto</Button>
    <Button variant="destructive"><Trash2 /> Remover</Button>
    <Button variant="secondary" disabled><Loader2 className="animate-spin" /> Salvando…</Button>
  </div>
);

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Ativo</Button>
    <Button disabled>Desabilitado</Button>
    <Button variant="outline" disabled>Outline desabilitado</Button>
  </div>
);
