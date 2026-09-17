import { Calendar } from "vite_react_shadcn_ts";

export const DatePicker = () => (
  <Calendar mode="single" selected={new Date(2026, 5, 18)} defaultMonth={new Date(2026, 5)} className="rounded-md border" />
);
