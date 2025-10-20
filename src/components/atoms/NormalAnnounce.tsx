import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Play } from "lucide-react";
import Link from "next/link";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>사이트 관련 안내</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          AWS 서버 장애로 인해 페이지 응답이 느리거나 깨질 수 있어요.
          <br />
          작업을 통해 최대한 서버 부하를 낮추어 놓은 상태에요.
        </div>
        <Link 
          href="/calculator/score" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline font-medium"
        >
          <Play className="h-3 w-3 mr-1" />
          점수 계산기 바로가기
        </Link>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
