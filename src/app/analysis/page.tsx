import { redirect } from "next/navigation";

// Total Analysis was dismantled: its character view moved to /students and its
// season trends to the /party "추이" tab. Old links land on the student hub.
export default function AnalysisPage() {
  redirect("/students");
}
