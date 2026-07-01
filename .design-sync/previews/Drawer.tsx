import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter,
  Button, Separator,
} from "vite_react_shadcn_ts";
import { ShoppingCart } from "lucide-react";

export const OrderSummary = () => (
  <Drawer open>
    <DrawerContent>
      <div className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-primary" />
            <DrawerTitle>Resumo do pedido</DrawerTitle>
          </div>
          <DrawerDescription>
            Confira os itens antes de finalizar a compra.
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid gap-3 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span>Fone Bluetooth Pro</span>
            <span className="font-medium">R$ 499,90</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Teclado Mecânico RGB</span>
            <span className="font-medium">R$ 329,00</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Frete</span>
            <span>R$ 24,90</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">R$ 853,80</span>
          </div>
        </div>

        <DrawerFooter>
          <Button>Finalizar compra</Button>
          <Button variant="outline">Continuar comprando</Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
);
