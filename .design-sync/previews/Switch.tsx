import { Switch, Label } from "vite_react_shadcn_ts";

export const States = () => (
  <div className="flex items-center gap-6">
    <Switch />
    <Switch defaultChecked />
    <Switch disabled />
    <Switch defaultChecked disabled />
  </div>
);

export const SettingsRows = () => (
  <div className="flex flex-col gap-4 w-[360px]">
    <div className="flex items-center justify-between">
      <Label htmlFor="s1">Agente de IA ativo</Label>
      <Switch id="s1" defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label htmlFor="s2">Notificar novos pedidos</Label>
      <Switch id="s2" defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label htmlFor="s3">Mostrar produtos esgotados</Label>
      <Switch id="s3" />
    </div>
  </div>
);
