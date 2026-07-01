import { Avatar, AvatarImage, AvatarFallback } from "vite_react_shadcn_ts";

export const SingleAvatar = () => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/120" alt="Ana Beatriz" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-medium">Ana Beatriz</p>
      <p className="text-muted-foreground">Administradora</p>
    </div>
  </div>
);

export const AvatarRow = () => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/120?img=11" alt="Carlos" />
      <AvatarFallback>CR</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/120?img=5" alt="Mariana" />
      <AvatarFallback>MS</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/120?img=14" alt="João" />
      <AvatarFallback>JP</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>RF</AvatarFallback>
    </Avatar>
  </div>
);
