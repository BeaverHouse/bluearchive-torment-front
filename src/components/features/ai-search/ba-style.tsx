import { cn } from "@/lib/utils";

// The slanted name tag over Arona's dialogue window, borrowed from Blue
// Archive's in-game UI. The slant is a skew on the frame, undone on the
// content so the text stays upright. Buttons keep the site's own shape.

export function AronaNameTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block -skew-x-12 rounded-sm bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-0.5 shadow-sm",
        className,
      )}
    >
      <span className="inline-block skew-x-12 text-xs font-bold tracking-wider text-white">A.R.O.N.A</span>
    </span>
  );
}
