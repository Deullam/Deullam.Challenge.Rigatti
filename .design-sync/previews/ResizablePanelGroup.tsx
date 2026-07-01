import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle, Badge,
} from "vite_react_shadcn_ts";

export const ListDetail = () => (
  <ResizablePanelGroup direction="horizontal" className="h-[240px] w-[520px] rounded-lg border">
    <ResizablePanel defaultSize={40}>
      <div className="flex h-full flex-col gap-2 p-4">
        <h4 className="text-sm font-semibold">Pedidos</h4>
        <div className="rounded-md bg-muted p-2 text-sm">#10482 · TechCorp</div>
        <div className="p-2 text-sm text-muted-foreground">#10481 · FoodCorp</div>
        <div className="p-2 text-sm text-muted-foreground">#10479 · TechCorp</div>
      </div>
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={60}>
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Pedido #10482</h4>
          <Badge>Em separação</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Cliente: Mariana Souza</p>
        <p className="text-sm">2× Fone Bluetooth Pro</p>
        <p className="text-2xl font-semibold">R$ 999,80</p>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
);
