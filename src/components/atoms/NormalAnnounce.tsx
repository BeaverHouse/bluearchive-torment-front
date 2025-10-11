import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Play } from "lucide-react";
import Link from "next/link";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>S82 게부라 업데이트 + 점수 계산기</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          문제가 있다면 이메일로 알려주세요.
          <br />
          PS. 연휴가 지나면 기능 업데이트가 느려질 수 있어요.
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
