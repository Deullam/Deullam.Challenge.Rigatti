import { Label, Input, Checkbox } from "vite_react_shadcn_ts";

export const WithInput = () => (
  <div className="flex flex-col gap-2 w-[320px]">
    <Label htmlFor="preco">Preço de venda (R$)</Label>
    <Input id="preco" type="number" defaultValue="499.90" />
  </div>
);

export const WithCheckbox = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="destaque" defaultChecked />
    <Label htmlFor="destaque">Exibir produto em destaque na loja</Label>
  </div>
);

export const FieldGroup = () => (
  <div className="flex flex-col gap-4 w-[320px]">
    <div className="flex flex-col gap-2">
      <Label htmlFor="empresa">Nome da empresa</Label>
      <Input id="empresa" defaultValue="TechCorp Distribuidora" />
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="ativo" defaultChecked />
      <Label htmlFor="ativo">Catálogo ativo</Label>
    </div>
  </div>
);
