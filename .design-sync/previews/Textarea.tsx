import { Textarea, Label } from "vite_react_shadcn_ts";

export const Default = () => (
  <div className="w-[360px]">
    <Textarea placeholder="Descreva o produto em poucas palavras..." />
  </div>
);

export const WithLabel = () => (
  <div className="flex flex-col gap-2 w-[360px]">
    <Label htmlFor="descricao">Descrição do produto</Label>
    <Textarea
      id="descricao"
      defaultValue="Fone de ouvido sem fio com cancelamento de ruído ativo, até 30h de bateria e estojo de carregamento USB-C."
    />
  </div>
);

export const Disabled = () => (
  <div className="flex flex-col gap-2 w-[360px]">
    <Label htmlFor="obs">Observações internas</Label>
    <Textarea
      id="obs"
      disabled
      defaultValue="Edição bloqueada — produto sincronizado com o catálogo principal."
    />
  </div>
);
