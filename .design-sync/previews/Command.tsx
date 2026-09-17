import {
  Command, CommandInput, CommandList, CommandGroup, CommandItem,
  CommandSeparator, CommandShortcut,
} from "vite_react_shadcn_ts";
import { Search, Package, Headphones, Keyboard, Webcam, Plus, BarChart3 } from "lucide-react";

export const ProductPalette = () => (
  <Command className="w-[420px] rounded-lg border shadow-md">
    <CommandInput placeholder="Buscar produtos ou comandos..." />
    <CommandList>
      <CommandGroup heading="Produtos">
        <CommandItem>
          <Headphones /> Fone Bluetooth Pro
          <CommandShortcut>R$ 499,90</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Keyboard /> Teclado Mecânico RGB
          <CommandShortcut>R$ 329,00</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <Webcam /> Webcam Full HD
          <CommandShortcut>R$ 189,90</CommandShortcut>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Ações">
        <CommandItem>
          <Plus /> Cadastrar novo produto
        </CommandItem>
        <CommandItem>
          <Package /> Ver catálogo completo
        </CommandItem>
        <CommandItem>
          <BarChart3 /> Abrir relatório de vendas
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);
