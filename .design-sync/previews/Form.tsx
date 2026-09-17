import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Input,
} from "vite_react_shadcn_ts";
import { useForm } from "react-hook-form";

export const ProductNameField = () => {
  const form = useForm({ defaultValues: { name: "Fone Bluetooth Pro" } });
  return (
    <Form {...form}>
      <form className="space-y-4 w-[320px]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Mouse Gamer RGB" {...field} />
              </FormControl>
              <FormDescription>Aparece no catálogo e nas respostas do agente de IA.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
