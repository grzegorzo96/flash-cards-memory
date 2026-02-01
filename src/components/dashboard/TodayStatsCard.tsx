import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TodayStatsCardProps = {
  dueTodayTotal: number;
};

export function TodayStatsCard({ dueTodayTotal }: TodayStatsCardProps) {
  return (
    <Card className="card-gradient-border hover-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Karty na dziś</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold scale-in">{dueTodayTotal}</div>
        <p className="mt-1 text-sm text-muted-foreground text-reveal" style={{ animationDelay: '0.2s' }}>
          {dueTodayTotal === 0
            ? "Świetna robota! Nie masz żadnych kart do powtórki."
            : dueTodayTotal === 1
              ? "Masz jedną kartę do powtórki."
              : `Masz ${dueTodayTotal} kart do powtórki.`}
        </p>
      </CardContent>
    </Card>
  );
}
