import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Newspaper, Plus, Trash2, Eye, EyeOff, Star, RefreshCw, Search, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface NewsItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string;
  date: string;
  type: "featured" | "archive";
  is_published: boolean;
  source: string;
  created_at: string;
}

export default function AdminNews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPublished, setFilterPublished] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_banners")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news_banners")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("News usunięty");
    },
    onError: () => toast.error("Błąd usuwania"),
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from("news_banners")
        .update({ is_published: !isPublished })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Status publikacji zmieniony");
    },
  });

  const makeFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news_banners")
        .update({ type: "featured" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Oznaczono jako wyróżniony");
    },
  });

  const handleFetchRSS = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss-news");
      
      if (error) throw error;
      
      toast.success(`Dodano ${data.added} nowych newsów (${data.duplicates} duplikatów)`);
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    } catch (error) {
      console.error("Error fetching RSS:", error);
      toast.error("Błąd pobierania newsów z RSS");
    } finally {
      setIsFetching(false);
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesPublished =
      filterPublished === "all" ||
      (filterPublished === "published" && item.is_published) ||
      (filterPublished === "unpublished" && !item.is_published);

    return matchesSearch && matchesType && matchesPublished;
  });

  const stats = {
    total: news.length,
    published: news.filter((n) => n.is_published).length,
    featured: news.filter((n) => n.type === "featured").length,
    automatic: news.filter((n) => n.source !== "manual").length,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Zarządzanie Newsami</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleFetchRSS} disabled={isFetching} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Pobierz z RSS
          </Button>
          <NewsFormDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-news"] })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Wszystkie</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Opublikowane</div>
          <div className="text-2xl font-bold">{stats.published}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Wyróżnione</div>
          <div className="text-2xl font-bold">{stats.featured}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Z RSS</div>
          <div className="text-2xl font-bold">{stats.automatic}</div>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj w tytule lub opisie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="featured">Wyróżnione</SelectItem>
            <SelectItem value="archive">Archiwum</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPublished} onValueChange={setFilterPublished}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="published">Opublikowane</SelectItem>
            <SelectItem value="unpublished">Nieopublikowane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Ładowanie...</div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Brak newsów</div>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {item.type === "featured" && (
                        <Badge variant="default">Wyróżniony</Badge>
                      )}
                      {item.is_published ? (
                        <Badge variant="default">Opublikowany</Badge>
                      ) : (
                        <Badge variant="secondary">Ukryty</Badge>
                      )}
                      {item.source !== "manual" && (
                        <Badge variant="outline">RSS</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Data: {item.date} • Źródło: {item.source}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublishMutation.mutate({ id: item.id, isPublished: item.is_published })}
                    >
                      {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {item.type !== "featured" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => makeFeaturedMutation.mutate(item.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingNews(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                        Otwórz link
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editingNews && (
        <NewsFormDialog
          isOpen={!!editingNews}
          onOpenChange={(open) => !open && setEditingNews(null)}
          editingNews={editingNews}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-news"] });
            setEditingNews(null);
          }}
        />
      )}
    </div>
  );
}

interface NewsFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingNews?: NewsItem | null;
  onSuccess: () => void;
}

function NewsFormDialog({ isOpen, onOpenChange, editingNews, onSuccess }: NewsFormDialogProps) {
  const [formData, setFormData] = useState({
    title: editingNews?.title || "",
    subtitle: editingNews?.subtitle || "",
    link_url: editingNews?.link_url || "",
    image_url: editingNews?.image_url || "",
    date: editingNews?.date || new Date().toISOString().split("T")[0],
    type: editingNews?.type || "archive",
    is_published: editingNews?.is_published ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingNews) {
        const { error } = await supabase
          .from("news_banners")
          .update(data)
          .eq("id", editingNews.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("news_banners")
          .insert({ ...data, source: "manual" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingNews ? "News zaktualizowany" : "News dodany");
      onSuccess();
      onOpenChange(false);
    },
    onError: () => toast.error("Błąd zapisu"),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {!editingNews && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj News
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingNews ? "Edytuj News" : "Dodaj Nowy News"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tytuł *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Opis</Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>
          <div>
            <Label>Link URL *</Label>
            <Input
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
          </div>
          <div>
            <Label>URL obrazka</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
          <div>
            <Label>Data *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <Label>Typ</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "featured" | "archive") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Wyróżniony</SelectItem>
                <SelectItem value="archive">Archiwum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publish"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_published: checked as boolean })
              }
            />
            <Label htmlFor="publish">Opublikuj od razu</Label>
          </div>
          <Button
            onClick={() => saveMutation.mutate(formData)}
            disabled={!formData.title || !formData.link_url || !formData.date}
            className="w-full"
          >
            {editingNews ? "Zapisz zmiany" : "Dodaj news"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
