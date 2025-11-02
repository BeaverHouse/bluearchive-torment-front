import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Play } from "lucide-react";
import Link from "next/link";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>25.11.02 Update</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          이제 영상이 있으면 파티 정보에 같이 표시돼요.
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
