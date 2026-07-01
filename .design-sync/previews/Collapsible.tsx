import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
  Button,
} from "vite_react_shadcn_ts";
import { ChevronsUpDown } from "lucide-react";

export const FaqItem = () => (
  <Collapsible open className="w-[440px] space-y-2">
    <div className="flex items-center justify-between gap-4 rounded-md border bg-card px-4 py-3">
      <h4 className="text-sm font-semibold">
        Como o agente de IA acessa os dados do meu catálogo?
      </h4>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon">
          <ChevronsUpDown />
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="space-y-2">
      <div className="rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground">
        O agente consulta o banco de dados real da sua empresa em tempo real, com
        isolamento total por tenant — ele nunca responde com base na memória do modelo.
      </div>
      <div className="rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground">
        Apenas os produtos da sua empresa ficam visíveis para o agente.
      </div>
    </CollapsibleContent>
  </Collapsible>
);
