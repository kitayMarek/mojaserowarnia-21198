/**
 * AddToListButton — przycisk "Dodaj do listy" w wierszu tabeli kultur
 *
 * Użycie w BazaKultur.tsx (wewnątrz TableRow lub karty):
 *   <AddToListButton cultureId={culture.id} cultureName={culture.name} />
 *
 * Wymaga: użytkownik zalogowany — inaczej nie renderuje nic
 */

import { useState, useEffect } from "react";
import { Bookmark, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserLists } from "@/hooks/useUserLists";
import { useAuth } from "@/hooks/useAuth";

interface AddToListButtonProps {
  cultureId: string;
  cultureName: string;
  variant?: "icon" | "text"; // icon = tylko ikonka, text = ikona + "Dodaj do listy"
}

export default function AddToListButton({
  cultureId,
  cultureName,
  variant = "icon",
}: AddToListButtonProps) {
  const { user } = useAuth();
  const { lists, createList, addToList, getListsForCulture } = useUserLists();

  const [open, setOpen] = useState(false);
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  // Pobierz w których listach już jest ta kultura
  useEffect(() => {
    if (!open || !user) return;
    getListsForCulture(cultureId).then(ids => {
      setAddedToLists(new Set(ids));
    });
  }, [open, cultureId, user]);

  if (!user) return null;

  const handleAddToList = async (listId: string) => {
    if (addedToLists.has(listId)) return;
    setLoadingListId(listId);
    const ok = await addToList(listId, cultureId);
    if (ok) setAddedToLists(prev => new Set([...prev, listId]));
    setLoadingListId(null);
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    const newList = await createList(newListName.trim());
    if (newList) {
      await addToList(newList.id, cultureId);
      setAddedToLists(prev => new Set([...prev, newList.id]));
    }
    setNewListName("");
    setShowNewListInput(false);
    setCreatingList(false);
  };

  const isOnAnyList = lists.some(l => addedToLists.has(l.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={`h-8 ${isOnAnyList ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
          title="Dodaj do listy"
        >
          <Bookmark
            className={`h-4 w-4 ${isOnAnyList ? "fill-primary" : ""}`}
          />
          {variant === "text" && (
            <span className="ml-1">
              {isOnAnyList ? "Na liście" : "Dodaj do listy"}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs font-semibold text-muted-foreground mb-2 truncate">
          {cultureName}
        </p>

        {/* Lista istniejących list */}
        <div className="space-y-1 mb-2">
          {lists.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">
              Nie masz jeszcze żadnych list
            </p>
          )}
          {lists.map(list => {
            const isAdded = addedToLists.has(list.id);
            const isLoading = loadingListId === list.id;

            return (
              <button
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                disabled={isAdded || isLoading}
                className={`
                  w-full flex items-center justify-between px-2 py-1.5 rounded text-sm
                  transition-colors text-left
                  ${isAdded
                    ? "bg-primary/10 text-primary cursor-default"
                    : "hover:bg-accent cursor-pointer"
                  }
                `}
              >
                <span className="truncate">{list.name}</span>
                <span className="flex items-center gap-1 ml-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {list.items_count}
                  </span>
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isAdded ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nowa lista */}
        <div className="border-t pt-2">
          {showNewListInput ? (
            <div className="flex gap-1">
              <Input
                autoFocus
                placeholder="Nazwa listy..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleCreateAndAdd();
                  if (e.key === "Escape") setShowNewListInput(false);
                }}
                className="h-7 text-sm"
              />
              <Button
                size="sm"
                className="h-7 px-2"
                onClick={handleCreateAndAdd}
                disabled={!newListName.trim() || creatingList}
              >
                {creatingList ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewListInput(true)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nowa lista
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
