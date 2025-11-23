import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>25.11.23 Update</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          1. 예로니무스 대결전 정보를 추가했어요.
          <br />
          2. 이제 별명으로도 학생을 검색할 수 있어요. (ex. 제왓삐, 수즈사)
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
