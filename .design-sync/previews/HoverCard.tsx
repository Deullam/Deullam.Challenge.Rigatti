import {
  HoverCard, HoverCardTrigger, HoverCardContent,
  Button, Avatar, AvatarImage, AvatarFallback,
} from "vite_react_shadcn_ts";
import { CalendarDays } from "lucide-react";

export const UserPreview = () => (
  <HoverCard open>
    <HoverCardTrigger asChild>
      <Button variant="link">@ana.rodrigues</Button>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src="" alt="Ana Rodrigues" />
          <AvatarFallback>AR</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Ana Rodrigues</h4>
          <p className="text-sm text-muted-foreground">
            Administradora do catálogo na TechCorp. Gerencia produtos e o agente de vendas IA.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Membro desde março de 2024</span>
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);
