import { buildVideoEmbedUrl, platformFromVideoId, VideoAnalysisData, VideoPlatform } from "@/types/video";
import { getCharacterName, parseCharacterInfo } from "@/utils/character";

export function generateHTML(
  video: VideoAnalysisData,
  studentsMap: Record<string, string>,
  t?: (key: string) => string,
  platform?: VideoPlatform
): string {
  const tr = t ?? ((k: string) => k);
  const { analysis_result } = video;
  const videoPlatform = platform ?? platformFromVideoId(video.video_id);

  let html = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <p style="color: #6b7280; margin-bottom: 20px;">${tr("videoAnalysis.html.totalScore")}: ${analysis_result.score.toLocaleString()}</p>

  <div style="margin-bottom: 30px;">
    <iframe
      width="100%"
      height="450"
      src="${buildVideoEmbedUrl(videoPlatform, video.video_id)}"
      title="Video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      style="border-radius: 8px;">
    </iframe>
  </div>

  <h3 style="color: #374151; margin: 30px 0 15px 0;">${tr("videoAnalysis.html.partyComposition")}</h3>`;

  analysis_result.partyData.forEach((party, index) => {
    html += `
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <h4 style="color: #111827; margin: 0 0 15px 0;">${tr("videoAnalysis.html.partyN").replace("{n}", String(index + 1))}</h4>
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">`;

    party.forEach((char) => {
      if (char === 0) {
        html += `<div style="width: 50px; height: 50px;"></div>`;
        return;
      }

      const { code, star, weapon, assist } = parseCharacterInfo(char)!;
      const name = getCharacterName(code, studentsMap);

      let starWeaponText = "";
      if (star > 0 && weapon === 0) {
        starWeaponText = tr("videoAnalysis.html.starN").replace("{n}", String(star));
      } else if (star === 5 && weapon > 0) {
        starWeaponText = tr("videoAnalysis.html.weaponN").replace("{n}", String(weapon));
      } else if (star > 0 && weapon > 0) {
        starWeaponText = tr("videoAnalysis.html.starWeapon")
          .replace("{star}", String(star))
          .replace("{weapon}", String(weapon));
      }

      html += `
        <div style="text-align: center; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${name}</div>
          <div style="font-size: 10px; color: #6b7280;">${starWeaponText}</div>
          ${assist ? `<div style="color: #10b981; font-size: 10px;">${tr("videoAnalysis.html.assist")}</div>` : ""}
        </div>`;
    });

    html += `
    </div>
  </div>`;
  });

  if (analysis_result.description) {
    html += `
  <h3 style="color: #374151; margin: 30px 0 15px 0;">${tr("videoAnalysis.detail.description")}</h3>
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <p style="color: #6b7280; font-size: 14px; white-space: pre-wrap; margin: 0;">${analysis_result.description}</p>
  </div>`;
  }

  html += `
</div>`;

  return html;
}
