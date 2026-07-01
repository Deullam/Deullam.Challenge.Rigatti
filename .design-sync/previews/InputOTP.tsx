import { InputOTP, InputOTPGroup, InputOTPSlot } from "vite_react_shadcn_ts";

export const VerificationCode = () => (
  <div className="space-y-2">
    <p className="text-sm font-medium">Código de verificação</p>
    <InputOTP maxLength={6} value="482915">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
    <p className="text-sm text-muted-foreground">Enviamos o código para o seu e-mail corporativo.</p>
  </div>
);
