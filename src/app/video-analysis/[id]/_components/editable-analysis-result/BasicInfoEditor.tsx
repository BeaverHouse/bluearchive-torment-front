"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BasicInfoEditorProps } from "./types";
import { useTranslations } from "@/lib/i18n";

export function BasicInfoEditor({
  score,
  description,
  onUpdateScore,
  onUpdateDescription,
}: BasicInfoEditorProps) {
  const { t } = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("videoAnalysis.edit.basicInfo")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              {t("videoAnalysis.edit.score")}
            </label>
            <Input
              type="number"
              value={score}
              onChange={(e) => onUpdateScore(parseInt(e.target.value) || 0)}
              placeholder={t("videoAnalysis.edit.scorePlaceholder")}
              className="h-9 w-full"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground">
            {t("videoAnalysis.edit.description")}
          </label>
          <Textarea
            value={description || ""}
            onChange={(e) => onUpdateDescription(e.target.value)}
            placeholder={t("videoAnalysis.edit.descriptionPlaceholder")}
            rows={3}
            className="w-full resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
