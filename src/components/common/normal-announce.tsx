import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>25.12.07 Update</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          1. 쿠로카게 총력전 정보를 추가했어요.
          <br />
          2. 요약 탭에서 볼 수 있는 정보가 늘어났어요.
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
