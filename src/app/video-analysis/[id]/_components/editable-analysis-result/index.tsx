"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { AnalysisResult } from "@/types/video";
import { updateVideoAnalysis } from "@/lib/api";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { usePartyEditor } from "./hooks/usePartyEditor";
import { useSkillOrders } from "./hooks/useSkillOrders";
import { BasicInfoEditor } from "./BasicInfoEditor";
import { PartyEditor } from "./PartyEditor";
import { SkillOrderList } from "./SkillOrderList";
import { EditableAnalysisResultProps } from "./types";

export function EditableAnalysisResult({
  videoData,
  raidId,
  onUpdate,
  onCancel,
}: EditableAnalysisResultProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(
    videoData.analysis_result
  );
  const [saving, setSaving] = useState(false);
  const [compactMode, setCompactMode] = useState(true);
  const { studentsMap, studentSearchMap } = useStudentMaps();

  const {
    getCharacterOptions,
    updatePartyData,
    updateCharacterDetails,
    addParty,
    removeParty,
    getPartyCharacters,
  } = usePartyEditor({
    analysisResult,
    setAnalysisResult,
    studentsMap,
  });

  const {
    addSkillOrder,
    removeSkillOrder,
    updateSkillOrder,
    reorderSkillOrders,
  } = useSkillOrders({
    setAnalysisResult,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVideoAnalysis(videoData.video_id, analysisResult, raidId);
      onUpdate({
        ...videoData,
        analysis_result: analysisResult,
      });
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updateScore = useCallback((newScore: number) => {
    setAnalysisResult((prev) => ({ ...prev, score: newScore }));
  }, []);

  const updateDescription = useCallback((newDescription: string) => {
    setAnalysisResult((prev) => ({ ...prev, description: newDescription }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          취소
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      <BasicInfoEditor
        score={analysisResult.score}
        description={analysisResult.description || ""}
        onUpdateScore={updateScore}
        onUpdateDescription={updateDescription}
      />

      <PartyEditor
        partyData={analysisResult.partyData}
        getCharacterOptions={getCharacterOptions}
        onUpdateParty={updatePartyData}
        onUpdateCharacterDetails={updateCharacterDetails}
        onAddParty={addParty}
        onRemoveParty={removeParty}
        studentSearchMap={studentSearchMap}
      />

      <SkillOrderList
        skillOrders={analysisResult.skillOrders}
        partyData={analysisResult.partyData}
        compactMode={compactMode}
        onToggleCompactMode={() => setCompactMode(!compactMode)}
        onAddSkillOrder={addSkillOrder}
        onRemoveSkillOrder={removeSkillOrder}
        onUpdateSkillOrder={updateSkillOrder}
        onReorder={reorderSkillOrders}
        getPartyCharacters={getPartyCharacters}
      />
    </div>
  );
}
