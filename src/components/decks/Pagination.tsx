import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  limit: number;
  offset: number;
  total: number;
  onPageChange: (newOffset: number) => void;
};

export function Pagination({
  limit,
  offset,
  total,
  onPageChange,
}: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + limit < total;
  const hasPrevPage = offset > 0;

  const handlePrevPage = useCallback(() => {
    if (hasPrevPage) {
      onPageChange(Math.max(0, offset - limit));
    }
  }, [hasPrevPage, offset, limit, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      onPageChange(offset + limit);
    }
  }, [hasNextPage, offset, limit, onPageChange]);

  const handleFirstPage = useCallback(() => {
    onPageChange(0);
  }, [onPageChange]);

  const handleLastPage = useCallback(() => {
    onPageChange((totalPages - 1) * limit);
  }, [totalPages, limit, onPageChange]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Wyświetlanie {offset + 1}-{Math.min(offset + limit, total)} z {total}{" "}
        talii
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={!hasPrevPage}
        >
          Pierwsza
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={!hasPrevPage}
        >
          Poprzednia
        </Button>
        <span className="flex items-center px-4 text-sm">
          Strona {currentPage} z {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!hasNextPage}
        >
          Następna
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={!hasNextPage}
        >
          Ostatnia
        </Button>
      </div>
    </div>
  );
}
