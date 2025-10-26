import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Play } from "lucide-react";
import Link from "next/link";

function NormalAnnounce() {
  return (
    <Alert className="mb-3 w-full text-left">
      <Info className="h-4 w-4" />
      <AlertTitle>25.10.26 Update</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-2">
          대결전 S27 실내 시로쿠로
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default NormalAnnounce;
