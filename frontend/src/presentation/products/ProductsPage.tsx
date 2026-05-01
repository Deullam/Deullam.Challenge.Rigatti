import { useEffect, useState } from "react";
import { useAuth } from "@/presentation/auth/AuthContext";
import { productUseCases } from "@/composition/products";
import type { Product } from "@/domain/products/Product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Package2, Image as ImageIcon, Loader2 } from "lucide-react";

const empty: Partial<Product> = { name: "", description: "", price: 0, category: "geral", image_url: "" };

export default function ProductsPage() {
  const { role, companyId, companyName } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [imgUploading, setImgUploading] = useState(false);

  const isAdmin = role === "admin";

  useEffect(() => { document.title = `Produtos — ${companyName ?? "TenantAI"}`; }, [companyName]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await productUseCases.list();
      setProducts(data);
    } catch (err: any) {
      toast({ title: "Falha ao carregar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const categories = productUseCases.categoriesOf(products);
  const filtered = productUseCases.filter(products, { query: q, category: cat });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !companyId) return;
    try {
      await productUseCases.save({
        name: editing.name?.trim() ?? "",
        description: editing.description ?? "",
        price: Number(editing.price ?? 0),
        category: editing.category ?? "geral",
        image_url: editing.image_url || null,
        companyId: companyId,
      }, editing.id);
      setOpen(false); setEditing(null); load();
      toast({ title: editing.id ? "Atualizado" : "Criado" });
    } catch (err: any) {
      toast({ title: "Falha ao salvar", description: err.message, variant: "destructive" });
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await productUseCases.remove(id);
      load();
    } catch (err: any) {
      toast({ title: "Falha ao excluir", description: err.message, variant: "destructive" });
    }
  };

  const onUpload = async (file: File) => {
    if (!companyId) return;
    setImgUploading(true);
    try {
      const { url } = await productUseCases.uploadImage(companyId, file);
      setEditing(e => ({ ...(e ?? {}), image_url: url }));
    } catch (err: any) {
      toast({ title: "Falha no upload", description: err.message, variant: "destructive" });
    } finally {
      setImgUploading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Catálogo da {companyName} — restrito por empresa via RLS.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ ...empty })} className="gap-2">
                <Plus className="h-4 w-4" /> Novo produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
              {editing && (
                <form onSubmit={onSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input required value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Preço</Label>
                      <Input type="number" step="0.01" min="0" required value={editing.price ?? 0} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Input value={editing.category ?? ""} onChange={e => setEditing({ ...editing, category: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea rows={3} value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Imagem</Label>
                    <div className="flex items-center gap-3">
                      {editing.image_url ? (
                        <img src={editing.image_url} alt="" className="h-16 w-16 rounded-md object-cover border" />
                      ) : (
                        <div className="h-16 w-16 rounded-md border grid place-items-center text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <Input type="file" accept="image/*" disabled={imgUploading} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editing.id ? "Salvar alterações" : "Criar produto"}</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar produtos…" className="pl-9" />
        </div>
        <select
          value={cat}
          onChange={e => setCat(e.target.value)}
          className="rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas as categorias</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-2">
            <Package2 className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
            {isAdmin && <p className="text-sm text-muted-foreground">Clique em "Novo produto" para adicionar, ou popule dados de demonstração na tela de login.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="overflow-hidden shadow-card hover:shadow-glow transition-shadow group">
              <div className="aspect-video bg-muted relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <Package2 className="h-8 w-8" />
                  </div>
                )}
                <Badge variant="secondary" className="absolute top-2 left-2">{p.category}</Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{p.name}</h3>
                  <span className="font-bold text-primary">R$ {Number(p.price).toFixed(2).replace(".", ",")}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { setEditing(p); setOpen(true); }}>
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive" onClick={() => onDelete(p.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
