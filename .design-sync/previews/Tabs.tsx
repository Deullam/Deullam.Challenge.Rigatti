import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Badge, Separator,
} from "vite_react_shadcn_ts";

export const ProductDetails = () => (
  <Tabs defaultValue="detalhes" className="w-[440px]">
    <TabsList>
      <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
      <TabsTrigger value="estoque">Estoque</TabsTrigger>
      <TabsTrigger value="vendas">Vendas</TabsTrigger>
    </TabsList>
    <TabsContent value="detalhes" className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Fone Bluetooth Pro</span>
        <Badge>Disponível</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Fone de ouvido sem fio com cancelamento de ruído e até 30h de bateria.
      </p>
      <Separator />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Categoria</span>
        <span className="font-medium">Áudio e Som</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Preço</span>
        <span className="font-medium text-primary">R$ 499,90</span>
      </div>
    </TabsContent>
    <TabsContent value="estoque" className="space-y-2">
      <p className="text-sm text-muted-foreground">32 unidades em estoque.</p>
    </TabsContent>
    <TabsContent value="vendas" className="space-y-2">
      <p className="text-sm text-muted-foreground">128 unidades vendidas neste mês.</p>
    </TabsContent>
  </Tabs>
);
