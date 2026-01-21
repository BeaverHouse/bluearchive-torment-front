import { useCallback } from "react";
import { AnalysisResult, SkillOrder } from "@/types/video";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

interface UseSkillOrdersProps {
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult>>;
}

export function useSkillOrders({ setAnalysisResult }: UseSkillOrdersProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addSkillOrder = useCallback(() => {
    const newSkill: SkillOrder = {
      partyNumber: 1,
      cost: 100,
      remainingTime: "03:00.000",
      type: "striker",
      order: 1,
      description: "",
    };

    setAnalysisResult((prev) => ({
      ...prev,
      skillOrders: [...prev.skillOrders, newSkill],
    }));
  }, [setAnalysisResult]);

  const removeSkillOrder = useCallback(
    (index: number) => {
      setAnalysisResult((prev) => ({
        ...prev,
        skillOrders: prev.skillOrders.filter((_, i) => i !== index),
      }));
    },
    [setAnalysisResult]
  );

  const updateSkillOrder = useCallback(
    (index: number, updates: Partial<SkillOrder>) => {
      setAnalysisResult((prev) => ({
        ...prev,
        skillOrders: prev.skillOrders.map((skill, i) =>
          i === index ? { ...skill, ...updates } : skill
        ),
      }));
    },
    [setAnalysisResult]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setAnalysisResult((prev) => {
          const oldIndex = prev.skillOrders.findIndex(
            (_, i) => i.toString() === active.id
          );
          const newIndex = prev.skillOrders.findIndex(
            (_, i) => i.toString() === over.id
          );

          return {
            ...prev,
            skillOrders: arrayMove(prev.skillOrders, oldIndex, newIndex),
          };
        });
      }
    },
    [setAnalysisResult]
  );

  const reorderSkillOrders = useCallback(
    (oldIndex: number, newIndex: number) => {
      setAnalysisResult((prev) => ({
        ...prev,
        skillOrders: arrayMove(prev.skillOrders, oldIndex, newIndex),
      }));
    },
    [setAnalysisResult]
  );

  return {
    sensors,
    addSkillOrder,
    removeSkillOrder,
    updateSkillOrder,
    handleDragEnd,
    reorderSkillOrders,
  };
}

export { DndContext, closestCenter };
