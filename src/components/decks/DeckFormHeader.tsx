type DeckFormHeaderProps = {
  isEditMode: boolean;
};

export function DeckFormHeader({ isEditMode }: DeckFormHeaderProps) {
  return (
    <header>
      <h1 className="text-4xl font-bold tracking-tight">
        {isEditMode ? "Edytuj talię" : "Utwórz nową talię"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isEditMode
          ? "Zaktualizuj informacje o talii"
          : "Wypełnij formularz, aby utworzyć nową talię fiszek"}
      </p>
    </header>
  );
}
