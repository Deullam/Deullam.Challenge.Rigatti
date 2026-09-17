import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
  Label, Input, Button, Checkbox, Separator,
} from "vite_react_shadcn_ts";
import { SlidersHorizontal } from "lucide-react";

export const ProductFilters = () => (
  <Sheet open>
    <SheetContent side="right">
      <SheetHeader>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-primary" />
          <SheetTitle>Filtrar produtos</SheetTitle>
        </div>
        <SheetDescription>
          Refine o catálogo por categoria, preço e disponibilidade.
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-5 py-6">
        <div className="grid gap-1.5">
          <Label htmlFor="busca">Buscar</Label>
          <Input id="busca" placeholder="Nome do produto" defaultValue="Fone" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="min">Preço mín. (R$)</Label>
            <Input id="min" defaultValue="100" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="max">Preço máx. (R$)</Label>
            <Input id="max" defaultValue="500" />
          </div>
        </div>

        <Separator />

        <div className="grid gap-3">
          <Label>Categorias</Label>
          <div className="flex items-center gap-2">
            <Checkbox id="c1" defaultChecked />
            <Label htmlFor="c1" className="font-normal">Eletrônicos</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="c2" defaultChecked />
            <Label htmlFor="c2" className="font-normal">Áudio e Som</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="c3" />
            <Label htmlFor="c3" className="font-normal">Acessórios</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="estoque" defaultChecked />
          <Label htmlFor="estoque" className="font-normal">Apenas em estoque</Label>
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline">Limpar</Button>
        <Button>Aplicar filtros</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);
