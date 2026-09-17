import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "vite_react_shadcn_ts";
import { AlertTriangle } from "lucide-react";

export const DeleteProduct = () => (
  <AlertDialog open>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-destructive" />
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita. O produto “Fone Bluetooth Pro” será
          removido permanentemente do catálogo da TechCorp.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction>Sim, excluir produto</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
