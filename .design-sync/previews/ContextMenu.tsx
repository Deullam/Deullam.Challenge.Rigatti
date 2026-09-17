import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuLabel,
  ContextMenuItem, ContextMenuSeparator, ContextMenuCheckboxItem, ContextMenuShortcut,
} from "vite_react_shadcn_ts";
import { MousePointerClick, Pencil, Copy, Star, Trash2 } from "lucide-react";

export const ProductCardArea = () => (
  <ContextMenu>
    <ContextMenuTrigger className="flex h-[160px] w-[320px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted text-center text-muted-foreground">
      <MousePointerClick className="text-primary" />
      <span className="font-medium text-foreground">Fone Bluetooth Pro</span>
      <span className="text-sm">Clique com o botão direito para ações rápidas</span>
    </ContextMenuTrigger>
    <ContextMenuContent className="w-56">
      <ContextMenuLabel>Ações do produto</ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <Pencil /> Editar produto
        <ContextMenuShortcut>⌘E</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy /> Duplicar
      </ContextMenuItem>
      <ContextMenuCheckboxItem checked>
        <Star /> Destaque na vitrine
      </ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuItem className="text-destructive">
        <Trash2 /> Excluir
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);
