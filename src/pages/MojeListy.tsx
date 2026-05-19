/**
 * MojeListy — strona zarządzania prywatnymi listami kultur
 * Route: /moje-listy  (dodaj do App.tsx)
 *
 * Widoki:
 *   - Lista wszystkich kolekcji użytkownika
 *   - Szczegół kolekcji z kulturami + notatkami
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookmarkCheck,
  ChevronLeft,
  Edit2,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  FlaskConical,
} from "lucide-react";
import { useUserLists, useListItems } from "@/hooks/useUserLists";
import { useAuth } from "@/hooks/useAuth";

// ─── Typ etykiety dla typów kultur ───────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  mezofilne:            "bg-blue-100 text-blue-800",
  termofilne:           "bg-orange-100 text-orange-800",
  "mezofilno-termofilne": "bg-amber-100 text-amber-800",
  pleśniowe:            "bg-green-100 text-green-800",
  propionowe:           "bg-purple-100 text-purple-800",
  aromatyzujące:        "bg-pink-100 text-pink-800",
  kefir:                "bg-cyan-100 text-cyan-800",
  jogurtowe:            "bg-yellow-100 text-yellow-800",
  probiotyczne:         "bg-teal-100 text-teal-800",
  ochronne:             "bg-red-100 text-red-800",
  zestaw:               "bg-gray-100 text-gray-800",
  wege:                 "bg-lime-100 text-lime-800",
};

// ─── Widok szczegółu listy ────────────────────────────────────────────────────

function ListDetail({
  listId,
  listName,
  onBack,
}: {
  listId: string;
  listName: string;
  onBack: () => void;
}) {
  const { items, loading, removeItem, updateNote } = useListItems(listId);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const startEditNote = (itemId: string, currentNote: string | null) => {
    setEditingNoteId(itemId);
    setNoteValue(currentNote ?? "");
  };

  const saveNote = async (itemId: string) => {
    await updateNote(itemId, noteValue);
    setEditingNoteId(null);
  };

  return (
    <div>
      {/* Nagłówek */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          Moje listy
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{listName}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "kultura" : "kultur"}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Lista jest pusta</p>
          <p className="text-sm mt-1">
            Dodaj kultury klikając ikonkę{" "}
            <BookmarkCheck className="inline h-4 w-4" /> w{" "}
            <Link to="/baza-kultur" className="text-primary underline">
              Bazie Kultur
            </Link>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Dane kultury */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-sm">
                      {item.culture?.product_url ? (
                        <a
                          href={item.culture.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {item.culture?.name}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                      ) : (
                        item.culture?.name
                      )}
                    </h3>
                    {item.culture?.type && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          TYPE_COLORS[item.culture.type] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.culture.type}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>
                      <span className="font-medium">Sklep:</span>{" "}
                      {item.culture?.shop}
                      {item.culture?.price_label && (
                        <span className="ml-2 font-semibold text-foreground">
                          {item.culture.price_label}
                        </span>
                      )}
                    </div>
                    {item.culture?.application && (
                      <div className="truncate">
                        <span className="font-medium">Zastosowanie:</span>{" "}
                        {item.culture.application}
                      </div>
                    )}
                    {item.culture?.temperature && (
                      <div>
                        <span className="font-medium">Temperatura:</span>{" "}
                        {item.culture.temperature}
                      </div>
                    )}
                  </div>

                  {/* Notatka */}
                  <div className="mt-2">
                    {editingNoteId === item.id ? (
                      <div className="space-y-1">
                        <Textarea
                          autoFocus
                          value={noteValue}
                          onChange={e => setNoteValue(e.target.value)}
                          placeholder="Twoja notatka..."
                          className="text-sm h-20 resize-none"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => saveNote(item.id)}
                          >
                            Zapisz
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => setEditingNoteId(null)}
                          >
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    ) : item.notes ? (
                      <div
                        className="text-xs bg-muted/50 rounded p-2 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => startEditNote(item.id, item.notes)}
                      >
                        <span className="text-muted-foreground">📝 </span>
                        {item.notes}
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditNote(item.id, null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Dodaj notatkę
                      </button>
                    )}
                  </div>
                </div>

                {/* Usuń */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeItem(item.id)}
                  title="Usuń z listy"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Strona główna — lista kolekcji ──────────────────────────────────────────

export default function MojeListy() {
  const { user } = useAuth();
  const { lists, loading, createList, deleteList, renameList } = useUserLists();

  const [selectedList, setSelectedList] = useState<{ id: string; name: string } | null>(null);

  // Dialogi
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const [renameDialogId, setRenameDialogId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    await createList(newListName.trim(), newListDesc.trim() || undefined);
    setNewListName("");
    setNewListDesc("");
    setCreatingList(false);
    setCreateDialogOpen(false);
  };

  const handleRename = async () => {
    if (!renameDialogId || !renameValue.trim()) return;
    await renameList(renameDialogId, renameValue.trim());
    setRenameDialogId(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteList(deleteConfirmId, deleteConfirmName);
    setDeleteConfirmId(null);
    if (selectedList?.id === deleteConfirmId) setSelectedList(null);
  };

  // ── Niezalogowany ──
  if (!user) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <BookmarkCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h1 className="text-2xl font-bold mb-2">Moje listy kultur</h1>
          <p className="text-muted-foreground mb-6">
            Zaloguj się, żeby tworzyć prywatne kolekcje kultur i dodawać notatki.
          </p>
          <Button asChild>
            <Link to="/auth">Zaloguj się</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  // ── Szczegół listy ──
  if (selectedList) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <ListDetail
            listId={selectedList.id}
            listName={selectedList.name}
            onBack={() => setSelectedList(null)}
          />
        </main>
        <Footer />
      </>
    );
  }

  // ── Lista kolekcji ──
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Nagłówek */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookmarkCheck className="h-6 w-6 text-primary" />
              Moje listy kultur
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Prywatne kolekcje kultur z notatkami
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nowa lista
          </Button>
        </div>

        {/* Ładowanie */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Puste */}
        {!loading && lists.length === 0 && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
            <BookmarkCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nie masz jeszcze żadnych list</p>
            <p className="text-sm mt-1 mb-4">
              Utwórz listę i dodawaj kultury z{" "}
              <Link to="/baza-kultur" className="text-primary underline">
                Bazy Kultur
              </Link>
            </p>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Utwórz pierwszą listę
            </Button>
          </div>
        )}

        {/* Karty list */}
        <div className="grid gap-3 sm:grid-cols-2">
          {lists.map(list => (
            <Card
              key={list.id}
              className="cursor-pointer hover:border-primary transition-colors group"
              onClick={() => setSelectedList({ id: list.id, name: list.name })}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {list.name}
                  </CardTitle>
                  {/* Akcje — zatrzymaj propagację kliknięcia */}
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setRenameDialogId(list.id);
                        setRenameValue(list.name);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => {
                        setDeleteConfirmId(list.id);
                        setDeleteConfirmName(list.name);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {list.description && (
                  <CardDescription className="text-xs">
                    {list.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {list.items_count ?? 0}{" "}
                    {(list.items_count ?? 0) === 1 ? "kultura" : "kultur"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(list.created_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Dialog: Nowa lista */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nowa lista kultur</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium">Nazwa *</label>
              <Input
                autoFocus
                placeholder="np. Do Goudy, Testowane, Na zakup..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Opis (opcjonalnie)
              </label>
              <Input
                placeholder="Krótki opis listy..."
                value={newListDesc}
                onChange={e => setNewListDesc(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newListName.trim() || creatingList}
            >
              {creatingList && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Utwórz listę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Zmień nazwę */}
      <Dialog open={!!renameDialogId} onOpenChange={() => setRenameDialogId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Zmień nazwę listy</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleRename()}
            className="my-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogId(null)}>
              Anuluj
            </Button>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Potwierdź usunięcie */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć listę?</AlertDialogTitle>
            <AlertDialogDescription>
              Lista <strong>„{deleteConfirmName}"</strong> i wszystkie jej pozycje
              zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń listę
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </>
  );
}
