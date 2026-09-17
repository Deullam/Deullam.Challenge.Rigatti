import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Input, Label,
} from "vite_react_shadcn_ts";

export const EditProduct = () => (
  <Dialog open>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar produto</DialogTitle>
        <DialogDescription>Atualize as informações do produto e clique em salvar.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" defaultValue="Fone Bluetooth Pro" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" defaultValue="499,90" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar alterações</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
