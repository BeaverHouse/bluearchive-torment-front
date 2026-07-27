import { redirect } from "next/navigation";

// A.R.O.N.A chat is now merged into Arona's Archive (/guide). Keep this route as
// a redirect so old links and bookmarks still land in the right place.
export default function AISearchPage() {
  redirect("/guide");
}
