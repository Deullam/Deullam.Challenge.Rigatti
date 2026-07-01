import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel,
} from "vite_react_shadcn_ts";

export const CategoryPicker = () => (
  <Select open defaultValue="eletronicos">
    <SelectTrigger className="w-[260px]">
      <SelectValue placeholder="Selecione a categoria" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Categorias</SelectLabel>
        <SelectItem value="eletronicos">Eletrônicos</SelectItem>
        <SelectItem value="informatica">Informática</SelectItem>
        <SelectItem value="acessorios">Acessórios</SelectItem>
        <SelectItem value="audio">Áudio e Som</SelectItem>
        <SelectItem value="casa">Casa e Decoração</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);
