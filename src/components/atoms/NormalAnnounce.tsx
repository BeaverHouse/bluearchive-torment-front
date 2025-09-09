import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>UI 개선</AlertTitle>
      <AlertDescription>
        디자인을 변경하고 있어요. 문제가 있다면 이메일로 알려주세요.
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
