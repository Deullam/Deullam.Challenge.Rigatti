import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger,
  NavigationMenuContent, NavigationMenuLink, navigationMenuTriggerStyle,
} from "vite_react_shadcn_ts";
import { LayoutGrid, Headphones, Cpu, Home } from "lucide-react";

export const TopNav = () => (
  <NavigationMenu defaultValue="catalogo">
    <NavigationMenuList>
      <NavigationMenuItem value="catalogo">
        <NavigationMenuTrigger>Catálogo</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[420px] gap-2 p-4 grid-cols-2">
            <li>
              <NavigationMenuLink className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent">
                <Cpu className="h-4 w-4 text-primary" /> Eletrônicos
              </NavigationMenuLink>
            </li>
            <li>
              <NavigationMenuLink className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent">
                <Headphones className="h-4 w-4 text-primary" /> Áudio e Som
              </NavigationMenuLink>
            </li>
            <li>
              <NavigationMenuLink className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent">
                <LayoutGrid className="h-4 w-4 text-primary" /> Acessórios
              </NavigationMenuLink>
            </li>
            <li>
              <NavigationMenuLink className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent">
                <Home className="h-4 w-4 text-primary" /> Casa e Decoração
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Pedidos</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Suporte</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);
