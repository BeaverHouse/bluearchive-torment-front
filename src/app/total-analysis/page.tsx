import { TotalAnalysisLayout } from "@/components/features/total-analysis/TotalAnalysisLayout";
import { TotalAnalysisData } from "@/types/total-analysis";

const DATA_URL =
  "https://twauaebyyujvvvusbrwe.supabase.co/storage/v1/object/public/pb7h4uvn2b6m0lyu7i6r3j8ac/batorment/v3/total-analysis.json";

async function getTotalAnalysisData(): Promise<TotalAnalysisData> {
  const res = await fetch(DATA_URL, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error("Failed to fetch total analysis data");
  }
  return res.json();
}

export default async function TotalAnalysisPage() {
  const data = await getTotalAnalysisData();

  return <TotalAnalysisLayout data={data} />;
}
