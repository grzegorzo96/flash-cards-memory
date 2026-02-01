type FlashcardFormHeaderProps = {
  isEditMode: boolean;
};

export function FlashcardFormHeader({ isEditMode }: FlashcardFormHeaderProps) {
  return (
    <header>
      <h1 className="text-4xl font-bold tracking-tight">
        {isEditMode ? "Edytuj fiszkę" : "Utwórz nową fiszkę"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isEditMode
          ? "Zaktualizuj pytanie i odpowiedź"
          : "Wypełnij formularz, aby utworzyć nową fiszkę"}
      </p>
    </header>
  );
}
