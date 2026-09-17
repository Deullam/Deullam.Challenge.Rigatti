import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "vite_react_shadcn_ts";

export const ProductFAQ = () => (
  <Accordion type="single" defaultValue="item-1" collapsible className="w-[460px]">
    <AccordionItem value="item-1">
      <AccordionTrigger>Qual é o prazo de entrega?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Pedidos pagos até as 14h são despachados no mesmo dia útil. A entrega leva
        de 3 a 7 dias úteis para todo o Brasil, com rastreamento por e-mail.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>O produto tem garantia?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Todos os eletrônicos contam com 12 meses de garantia do fabricante, além
        de 30 dias para troca ou devolução sem custo.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Posso parcelar a compra?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Sim. Parcelamos em até 12x no cartão de crédito ou 5% de desconto à vista
        no Pix.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const PoliticasLoja = () => (
  <Accordion type="single" defaultValue="trocas" collapsible className="w-[460px]">
    <AccordionItem value="trocas">
      <AccordionTrigger>Política de trocas</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Solicite a troca pelo painel em até 30 dias. O produto deve estar na
        embalagem original e sem sinais de uso.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="frete">
      <AccordionTrigger>Frete grátis</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Frete grátis para compras acima de R$ 299,00 nas regiões Sul e Sudeste.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
