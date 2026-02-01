import { useCallback } from "react";
import type { DeckSortField, ApiSortOrder } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type DecksFiltersProps = {
  sort: DeckSortField;
  order: ApiSortOrder;
  onSortChange: (sort: DeckSortField) => void;
  onOrderChange: (order: ApiSortOrder) => void;
};

export function DecksFilters({
  sort,
  order,
  onSortChange,
  onOrderChange,
}: DecksFiltersProps) {
  const handleSortChange = useCallback(
    (value: string) => {
      onSortChange(value as DeckSortField);
    },
    [onSortChange]
  );

  const handleOrderChange = useCallback(
    (value: string) => {
      onOrderChange(value as ApiSortOrder);
    },
    [onOrderChange]
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="sort" className="mb-2 block text-sm font-medium">
              Sortuj według
            </label>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nazwa</SelectItem>
                <SelectItem value="created_at">Data utworzenia</SelectItem>
                <SelectItem value="due_count">Liczba kart do powtórki</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="order" className="mb-2 block text-sm font-medium">
              Kolejność
            </label>
            <Select value={order} onValueChange={handleOrderChange}>
              <SelectTrigger id="order">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Rosnąco</SelectItem>
                <SelectItem value="desc">Malejąco</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
