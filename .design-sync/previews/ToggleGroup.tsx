import { ToggleGroup, ToggleGroupItem } from "vite_react_shadcn_ts";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from "lucide-react";

export const TextAlign = () => (
  <ToggleGroup type="single" defaultValue="left">
    <ToggleGroupItem value="left" aria-label="Alinhar à esquerda"><AlignLeft /></ToggleGroupItem>
    <ToggleGroupItem value="center" aria-label="Centralizar"><AlignCenter /></ToggleGroupItem>
    <ToggleGroupItem value="right" aria-label="Alinhar à direita"><AlignRight /></ToggleGroupItem>
  </ToggleGroup>
);

export const Formatting = () => (
  <ToggleGroup type="multiple" defaultValue={["bold", "italic"]} variant="outline">
    <ToggleGroupItem value="bold" aria-label="Negrito"><Bold /></ToggleGroupItem>
    <ToggleGroupItem value="italic" aria-label="Itálico"><Italic /></ToggleGroupItem>
    <ToggleGroupItem value="underline" aria-label="Sublinhado"><Underline /></ToggleGroupItem>
  </ToggleGroup>
);
