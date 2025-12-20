import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>25.12.21 Update</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          1. 카이텐 대결전 정보를 추가했어요.
          <br />
          2. 모바일과 요약 탭 UI를 약간 수정했어요.
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
