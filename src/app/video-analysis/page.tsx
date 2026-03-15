import { VideoAnalysisContent } from "./_components/video-analysis-content";

export default async function VideoAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ raid?: string }>;
}) {
  const { raid } = await searchParams;

  return <VideoAnalysisContent initialRaid={raid || "all"} />;
}
