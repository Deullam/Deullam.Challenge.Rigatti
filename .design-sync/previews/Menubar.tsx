import {
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem,
  MenubarSeparator, MenubarShortcut, MenubarCheckboxItem,
} from "vite_react_shadcn_ts";

export const CatalogMenubar = () => (
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>Arquivo</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          Novo produto <MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Importar catálogo <MenubarShortcut>⌘I</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Exportar para CSV</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Editar</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          Desfazer <MenubarShortcut>⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Refazer <MenubarShortcut>⇧⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Excluir selecionados</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Ver</MenubarTrigger>
      <MenubarContent>
        <MenubarCheckboxItem checked>Mostrar esgotados</MenubarCheckboxItem>
        <MenubarCheckboxItem>Somente destaques</MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem>Atualizar catálogo</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
);
