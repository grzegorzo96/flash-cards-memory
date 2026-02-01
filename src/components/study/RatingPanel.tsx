import { useCallback } from "react";
import type { ReviewRating } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RatingPanelProps = {
  onRate: (rating: ReviewRating) => void;
  isSubmitting: boolean;
};

const RATING_OPTIONS = [
  {
    rating: 1 as ReviewRating,
    label: "Bardzo słabo",
    description: "Nie pamiętam",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    rating: 2 as ReviewRating,
    label: "Słabo",
    description: "Z trudem przypomniałem",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    rating: 3 as ReviewRating,
    label: "Dobrze",
    description: "Przypomniałem po chwili",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    rating: 4 as ReviewRating,
    label: "Bardzo dobrze",
    description: "Pamiętam dobrze",
    color: "bg-green-500 hover:bg-green-600",
  },
];

export function RatingPanel({ onRate, isSubmitting }: RatingPanelProps) {
  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (!isSubmitting) {
        onRate(rating);
      }
    },
    [onRate, isSubmitting]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jak dobrze pamiętasz tę kartę?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RATING_OPTIONS.map((option, index) => (
            <Button
              key={option.rating}
              onClick={() => handleRate(option.rating)}
              disabled={isSubmitting}
              className={`h-auto flex-col gap-1 py-4 text-white ${option.color} hover-lift scale-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-lg font-bold">{option.rating}</span>
              <span className="text-base font-semibold">{option.label}</span>
              <span className="text-xs opacity-90">{option.description}</span>
            </Button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground fade-in-up" style={{ animationDelay: '0.4s' }}>
          Użyj klawiszy 1-4 lub kliknij przycisk
        </p>
      </CardContent>
    </Card>
  );
}
