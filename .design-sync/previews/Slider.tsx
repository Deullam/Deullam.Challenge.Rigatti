import { Slider, Label } from "vite_react_shadcn_ts";

export const Default = () => (
  <div className="w-[280px]">
    <Slider defaultValue={[40]} max={100} step={1} />
  </div>
);

export const PriceRange = () => (
  <div className="flex flex-col gap-2 w-[280px]">
    <Label>Faixa de preço (R$ 200 – R$ 800)</Label>
    <Slider defaultValue={[200, 800]} min={0} max={1000} step={10} />
  </div>
);

export const Disabled = () => (
  <div className="flex flex-col gap-2 w-[280px]">
    <Label>Desconto máximo (bloqueado)</Label>
    <Slider defaultValue={[25]} max={100} step={1} disabled />
  </div>
);
