import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuShortcut,
  Button,
} from "vite_react_shadcn_ts";
import { MoreHorizontal, Pencil, Copy, Trash2, Eye } from "lucide-react";

export const ProductRowActions = () => (
  <DropdownMenu open>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="icon">
        <MoreHorizontal />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="start">
      <DropdownMenuLabel>Ações do produto</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Eye /> Ver detalhes
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Pencil /> Editar produto
        <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Copy /> Duplicar
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem checked>Disponível no catálogo</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem>Destaque na vitrine</DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive">
        <Trash2 /> Excluir
        <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
