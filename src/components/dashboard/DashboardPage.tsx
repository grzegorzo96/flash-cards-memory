import { useDashboardOverview } from "@/components/hooks/useDashboardOverview";
import { DashboardHeader } from "./DashboardHeader";
import { TodayStatsCard } from "./TodayStatsCard";
import { DecksOverviewList } from "./DecksOverviewList";
import { QuickActions } from "./QuickActions";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardOverview();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  if (!data || data.decks.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 space-y-8">
        <TodayStatsCard dueTodayTotal={data.due_today_total} />
        
        <DecksOverviewList decks={data.decks} />
        
        <QuickActions />
      </div>
    </main>
  );
}
