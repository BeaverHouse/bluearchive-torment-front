import { expect, test } from "vitest";
import { AnalysisResult, ReviewWorkspace } from "@/types/video";
import { startingResult } from "./workspace-state";

// Without this, reopening a video after saving an edit would show the worker's pick again, and the
// saved party would look lost.
test("a saved edit opens instead of the worker's pick", () => {
  const edited: AnalysisResult = {
    score: 39648400,
    partyData: [[10098, 0, 0, 0, 0, 0]],
  };
  const ws: ReviewWorkspace = {
    video: {
      video_id: "nOQKn2Paqi0",
      title: "",
      raid_id: "3S38-1",
      data: [
        {
          id: 1,
          video_id: "nOQKn2Paqi0",
          analysis_result: edited,
          analysis_type: "user",
          version: 1,
          created_at: "",
          updated_at: "",
        },
      ],
    },
    proposal: {
      video_id: "nOQKn2Paqi0",
      raid_id: "3S38-1",
      platform: "youtube",
      title: "",
      decision: "confirmed",
      reason: "",
      scores: [],
      score_spans: [],
      rank: 1,
      seen: [],
      proposed: { rank: 1, score: 1, partyData: [[1, 2, 3, 4, 5, 6]] },
      candidates: [],
      frames: [],
    },
    feedback: [],
  };
  expect(startingResult(ws)).toEqual(edited);
});
