import { ScrollArea } from "vite_react_shadcn_ts";

const produtos = [
  "Fone Bluetooth Pro", "Teclado Mecânico RGB", "Mouse Sem Fio Ergonômico",
  "Monitor 27\" 144Hz", "Webcam Full HD", "Headset Gamer 7.1",
  "SSD NVMe 1TB", "Hub USB-C 7 em 1", "Cadeira Gamer Ergonômica",
  "Mesa Digitalizadora", "Microfone Condensador", "Suporte para Notebook",
  "Carregador Turbo 65W", "Cabo HDMI 2.1 2m", "Pen Drive 256GB",
];

export const ProductList = () => (
  <ScrollArea className="h-[200px] w-[300px] rounded-md border">
    <div className="p-4">
      <h4 className="mb-3 text-sm font-medium">Catálogo · Eletrônicos</h4>
      {produtos.map((p, i) => (
        <div key={p} className="text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span>{p}</span>
            <span className="text-muted-foreground">R$ {(99 + i * 50).toLocaleString("pt-BR")},90</span>
          </div>
          {i < produtos.length - 1 && <div className="border-t" />}
        </div>
      ))}
    </div>
  </ScrollArea>
);
