import {
  Popover, PopoverTrigger, PopoverContent,
  Button, Label, Input, Separator,
} from "vite_react_shadcn_ts";
import { Settings2 } from "lucide-react";

export const Dimensions = () => (
  <Popover open>
    <PopoverTrigger asChild>
      <Button variant="outline"><Settings2 /> Dimensões</Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="grid gap-4">
        <div className="space-y-1">
          <h4 className="font-medium leading-none">Dimensões do produto</h4>
          <p className="text-sm text-muted-foreground">
            Defina o tamanho usado no cálculo de frete.
          </p>
        </div>
        <Separator />
        <div className="grid gap-3">
          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="largura">Largura</Label>
            <Input id="largura" defaultValue="20 cm" className="col-span-2 h-8" />
          </div>
          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="altura">Altura</Label>
            <Input id="altura" defaultValue="8 cm" className="col-span-2 h-8" />
          </div>
          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="peso">Peso</Label>
            <Input id="peso" defaultValue="350 g" className="col-span-2 h-8" />
          </div>
        </div>
        <Button size="sm">Salvar dimensões</Button>
      </div>
    </PopoverContent>
  </Popover>
);
