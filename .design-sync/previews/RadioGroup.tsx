import { RadioGroup, RadioGroupItem, Label } from "vite_react_shadcn_ts";

export const ShippingOptions = () => (
  <RadioGroup defaultValue="sedex" className="w-[320px]">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="sedex" id="sedex" />
      <Label htmlFor="sedex">SEDEX — entrega em 2 dias</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="pac" id="pac" />
      <Label htmlFor="pac">PAC — entrega em 7 dias</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="retirada" id="retirada" />
      <Label htmlFor="retirada">Retirada na loja</Label>
    </div>
  </RadioGroup>
);

export const PlanOptions = () => (
  <RadioGroup defaultValue="pro" className="w-[320px]">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="free" id="free" />
      <Label htmlFor="free">Gratuito — R$ 0/mês</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="pro" id="pro" />
      <Label htmlFor="pro">Pro — R$ 99/mês</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="enterprise" id="enterprise" disabled />
      <Label htmlFor="enterprise">Enterprise — sob consulta</Label>
    </div>
  </RadioGroup>
);
