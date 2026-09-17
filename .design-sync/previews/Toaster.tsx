import {
  ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastViewport,
} from "vite_react_shadcn_ts";

// O Toaster real é dirigido em runtime pelo store useToast() e renderiza vazio
// estaticamente. Compomos um toast estático representativo (mesma primitiva) para
// o card não ficar em branco. O wrapper com transform contém o ToastViewport fixed.
export const OrderToast = () => (
  <div style={{ position: "relative", transform: "translateZ(0)", width: 440, height: 200, overflow: "hidden" }}>
    <ToastProvider>
      <Toast open>
        <div className="grid gap-1">
          <ToastTitle>Pedido confirmado</ToastTitle>
          <ToastDescription>Seu pedido #10482 está a caminho.</ToastDescription>
        </div>
        <ToastAction altText="Acompanhar">Acompanhar</ToastAction>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  </div>
);
