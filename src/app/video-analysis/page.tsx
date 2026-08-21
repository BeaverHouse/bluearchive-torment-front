import { Suspense } from "react";
import Loading from "@/components/common/loading";
import { VideoAnalysisContent } from "./_components/video-analysis-content";

// Reading searchParams on the server made this the only plain route rendered
// on demand, and every visit to it invoked a function. The child is a client
// component, so it can read the query itself. Dropping the Suspense boundary
// fails the prerender of /video-analysis, and without the fallback the
// prerendered body is empty until hydration.
export default function VideoAnalysisPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VideoAnalysisContent />
    </Suspense>
  );
}
