import {
  ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastViewport,
} from "vite_react_shadcn_ts";

// O ToastViewport usa position:fixed. O wrapper com transform cria um bloco de
// contenção para que o toast apareça dentro do card (e não no canto do iframe).
export const OrderToast = () => (
  <div style={{ position: "relative", transform: "translateZ(0)", width: 440, height: 200, overflow: "hidden" }}>
    <ToastProvider>
      <Toast open>
        <div className="grid gap-1">
          <ToastTitle>Pedido confirmado</ToastTitle>
          <ToastDescription>O pedido #10482 foi enviado para separação.</ToastDescription>
        </div>
        <ToastAction altText="Ver pedido">Ver pedido</ToastAction>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  </div>
);
