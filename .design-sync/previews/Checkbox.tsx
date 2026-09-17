import { Checkbox, Label } from "vite_react_shadcn_ts";

export const States = () => (
  <div className="flex items-center gap-6">
    <Checkbox />
    <Checkbox defaultChecked />
    <Checkbox disabled />
    <Checkbox defaultChecked disabled />
  </div>
);

export const WithLabelRow = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="termos" defaultChecked />
    <Label htmlFor="termos">Aceito os termos de uso do catálogo</Label>
  </div>
);

export const Checklist = () => (
  <div className="flex flex-col gap-3 w-[320px]">
    <p className="text-sm font-medium">Publicação do produto</p>
    <div className="flex items-center gap-2">
      <Checkbox id="c1" defaultChecked />
      <Label htmlFor="c1">Imagens enviadas</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="c2" defaultChecked />
      <Label htmlFor="c2">Preço definido</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="c3" />
      <Label htmlFor="c3">Estoque conferido</Label>
    </div>
  </div>
);
