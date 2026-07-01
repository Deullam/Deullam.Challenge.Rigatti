import { Input, Label } from "vite_react_shadcn_ts";

export const Types = () => (
  <div className="flex flex-col gap-3 w-[320px]">
    <Input type="text" placeholder="Nome do produto" />
    <Input type="email" placeholder="contato@empresa.com.br" />
    <Input type="password" defaultValue="senha-secreta" />
    <Input type="number" placeholder="Preço em R$" />
  </div>
);

export const WithLabel = () => (
  <div className="flex flex-col gap-4 w-[320px]">
    <div className="flex flex-col gap-2">
      <Label htmlFor="nome">Nome do produto</Label>
      <Input id="nome" defaultValue="Fone Bluetooth Pro" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="sku">SKU</Label>
      <Input id="sku" placeholder="Ex.: FONE-BT-001" />
    </div>
  </div>
);

export const States = () => (
  <div className="flex flex-col gap-3 w-[320px]">
    <Input placeholder="Campo padrão" />
    <Input defaultValue="R$ 499,90" />
    <Input placeholder="Desabilitado" disabled />
    <Input defaultValue="Catálogo bloqueado" disabled />
  </div>
);
