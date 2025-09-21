import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>영상 기능 추가 (beta)</AlertTitle>
      <AlertDescription>
        테스트 + 기능 보완 중이에요. 문제가 있다면 이메일로 알려주세요.
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
