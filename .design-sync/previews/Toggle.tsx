import { Toggle } from "vite_react_shadcn_ts";
import { Bold, Italic, Star } from "lucide-react";

export const Default = () => (
  <Toggle aria-label="Negrito"><Bold /></Toggle>
);

export const Pressed = () => (
  <Toggle pressed aria-label="Itálico"><Italic /></Toggle>
);

export const WithText = () => (
  <Toggle variant="outline" pressed><Star /> Em destaque</Toggle>
);

export const Disabled = () => (
  <Toggle disabled aria-label="Negrito"><Bold /></Toggle>
);
