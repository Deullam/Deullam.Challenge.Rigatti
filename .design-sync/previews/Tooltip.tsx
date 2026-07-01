import {
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button,
} from "vite_react_shadcn_ts";
import { HelpCircle } from "lucide-react";

export const HelpTooltip = () => (
  <TooltipProvider>
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Ajuda">
          <HelpCircle />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>O SKU identifica o produto de forma única no estoque.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
