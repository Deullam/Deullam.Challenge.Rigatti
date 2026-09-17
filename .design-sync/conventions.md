# Rigatti Design System — how to build with it

This is **shadcn/ui** (Radix primitives + Tailwind) themed with the Rigatti tokens.
Components are React, imported from the bundle global `window.RigattiUI.*`. Style with
**Tailwind utility classes** plus the token-backed color utilities below. Every component
accepts `className`, forwards refs, and spreads native props.

## Styling idiom — token utility classes (use these, not raw hex)
Colors are CSS variables (HSL). Brand primary is purple `hsl(262 83% 58%)`. Prefer the
semantic token utilities so light/dark stay correct:

| Utility family | Tokens |
|---|---|
| `bg-*` / `text-*` / `border-*` / `ring-*` | `background` `foreground` `primary` `secondary` `muted` `accent` `destructive` `card` `popover` `border` `input` `ring` |
| paired foregrounds | `text-primary-foreground` `text-muted-foreground` `text-accent-foreground` `text-card-foreground` `text-secondary-foreground` `text-destructive-foreground` |
| radius | `rounded-lg` (=`var(--radius)` 0.75rem) `rounded-md` `rounded-sm` |

Layout/spacing/typography is ordinary Tailwind (`flex grid gap-* p-* w-* max-w-* text-sm
font-medium space-y-*`). Example: `<div className="rounded-lg border bg-card p-6 text-card-foreground">`.
Dark mode: add `class="dark"` on any ancestor — tokens flip automatically.

## Component API patterns
- **Variants via props**, not classes: `Button` (`variant`: default | secondary | outline |
  ghost | destructive | link; `size`: default | sm | lg | icon), `Badge`/`Alert`/`Toggle`
  also take `variant`. See each `<Name>.d.ts` for the exact union.
- **Compound components** — compose the parts (all on `window.RigattiUI`):
  `Card`+`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`;
  `Dialog`+`DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter`;
  `Select`+`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`;
  `Table`, `DropdownMenu`, `Tabs`, `Accordion`, `Command`, `Sidebar` follow the same part pattern.

## Required wrappers (styling/behavior breaks without them)
- **Tooltip**: wrap the tree in `<TooltipProvider>` (once near the root).
- **Sidebar**: wrap in `<SidebarProvider>`; use `<Sidebar collapsible="none">` for inline/static layouts.
- **Form**: it IS the react-hook-form provider — `const form = useForm()`, then
  `<Form {...form}>` around `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage`.
- **Toast/Sonner**: render `<Toaster />` (or `<SonnerToaster />`) once at the app root; trigger
  with the `useToast()` hook / `toast()` helper.

## Where the truth lives
- Tokens + compiled component CSS: `styles.css` → `@import "./_ds_bundle.css"` (read it for the
  exact `--token` values and utility output).
- Per-component API + usage: `components/<group>/<Name>/<Name>.d.ts` (props) and
  `<Name>.prompt.md`. Groups: actions, forms, data-display, overlays, navigation, feedback, layout.

## Idiomatic snippet
```tsx
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } = window.RigattiUI;
<Card className="w-[320px]">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Fone Bluetooth Pro</CardTitle>
      <Badge>Em estoque</Badge>
    </div>
    <CardDescription>Áudio sem fio com cancelamento de ruído.</CardDescription>
  </CardHeader>
  <CardContent><p className="text-2xl font-semibold">R$ 499,90</p></CardContent>
  <CardFooter className="gap-2">
    <Button className="flex-1">Adicionar</Button>
    <Button variant="outline">Detalhes</Button>
  </CardFooter>
</Card>
```
