import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>25.11.09 Update</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          1. 예소드 정보를 추가했어요.
          <br />
          2. 총력전 점수 계산기가 이제 4분 30초 옵션을 지원해요.
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
