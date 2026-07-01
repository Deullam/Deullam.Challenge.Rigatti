import { Alert, AlertTitle, AlertDescription } from "vite_react_shadcn_ts";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const OrderConfirmed = () => (
  <Alert className="max-w-md">
    <CheckCircle2 className="h-4 w-4" />
    <AlertTitle>Pedido confirmado</AlertTitle>
    <AlertDescription>
      O pedido #10482 foi recebido e está em separação. Você receberá o código de rastreio em breve.
    </AlertDescription>
  </Alert>
);

export const PaymentError = () => (
  <Alert variant="destructive" className="max-w-md">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Falha no pagamento</AlertTitle>
    <AlertDescription>
      Não foi possível processar o cartão de crédito. Verifique os dados e tente novamente.
    </AlertDescription>
  </Alert>
);
