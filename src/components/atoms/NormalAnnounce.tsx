import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Play } from "lucide-react";
import Link from "next/link";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>영상 기능 추가 (beta)</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          테스트 + 기능 보완 중이에요. 문제가 있다면 이메일로 알려주세요.
        </div>
        <Link 
          href="/video-analysis" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline font-medium"
        >
          <Play className="h-3 w-3 mr-1" />
          영상 분석 페이지 바로가기
        </Link>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
