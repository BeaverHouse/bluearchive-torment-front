"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitWikiFeedback } from "@/lib/wiki";
import { useTranslations } from "@/lib/i18n";

const MAX_LEN = 2000;

// Inline "something wrong?" form. No GitHub / login concept is exposed to the
// user — a single textarea. `trap` is a honeypot: hidden from humans, so a
// filled value marks an automated submission that the server discards.
export function FeedbackForm({ slug }: { slug: string }) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done") {
    return <p className="text-sm text-muted-foreground">{t("wiki.feedback.thanks")}</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-border transition hover:text-foreground hover:ring-foreground/30"
      >
        <Flag className="h-3.5 w-3.5" />
        {t("wiki.feedback.open")}
      </button>
    );
  }

  const submit = async () => {
    if (!comment.trim()) return;
    setState("sending");
    const ok = await submitWikiFeedback({ slug, comment: comment.trim(), trap });
    setState(ok ? "done" : "error");
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, MAX_LEN))}
        placeholder={t("wiki.feedback.placeholder")}
        rows={3}
        className="text-sm"
      />
      {/* honeypot — visually hidden, off-screen, not announced to AT */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit} disabled={state === "sending" || !comment.trim()}>
          {state === "sending" ? t("wiki.feedback.sending") : t("wiki.feedback.submit")}
        </Button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-muted-foreground hover:underline"
        >
          {t("common.cancel")}
        </button>
        {state === "error" && (
          <span className="text-sm text-destructive">{t("wiki.feedback.error")}</span>
        )}
      </div>
    </div>
  );
}
