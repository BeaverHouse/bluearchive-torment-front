import { VideoAnalysisData } from "@/types/video";
import { getCharacterName, parseCharacterInfo } from "@/utils/character";

export function generateHTML(
  video: VideoAnalysisData,
  studentsMap: Record<string, string>
): string {
  const { analysis_result } = video;

  let html = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <p style="color: #6b7280; margin-bottom: 20px;">총점: ${analysis_result.score.toLocaleString()}</p>

  <!-- YouTube 임베드 -->
  <div style="margin-bottom: 30px;">
    <iframe
      width="100%"
      height="450"
      src="https://www.youtube.com/embed/${video.video_id}"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      style="border-radius: 8px;">
    </iframe>
  </div>

  <h3 style="color: #374151; margin: 30px 0 15px 0;">파티 구성</h3>`;

  analysis_result.partyData.forEach((party, index) => {
    html += `
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <h4 style="color: #111827; margin: 0 0 15px 0;">파티 ${index + 1}</h4>
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">`;

    party.forEach((char) => {
      if (char === 0) {
        html += `<div style="width: 50px; height: 50px;"></div>`;
        return;
      }

      const { code, star, weapon, assist } = parseCharacterInfo(char);
      const name = getCharacterName(code, studentsMap);

      let starWeaponText = "";
      if (star > 0 && weapon === 0) {
        starWeaponText = `${star}성`;
      } else if (star === 5 && weapon > 0) {
        starWeaponText = `전${weapon}`;
      } else if (star > 0 && weapon > 0) {
        starWeaponText = `${star}성 전${weapon}`;
      }

      html += `
        <div style="text-align: center; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${name}</div>
          <div style="font-size: 10px; color: #6b7280;">${starWeaponText}</div>
          ${assist ? '<div style="color: #10b981; font-size: 10px;">조력자</div>' : ""}
        </div>`;
    });

    html += `
    </div>
  </div>`;
  });

  if (analysis_result.skillOrders && analysis_result.skillOrders.length > 0) {
    html += `
  <h3 style="color: #374151; margin: 30px 0 15px 0;">스킬 순서</h3>
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #d1d5db;">
          <th style="text-align: left; padding: 8px; font-size: 12px;">순서</th>
          <th style="text-align: left; padding: 8px; font-size: 12px;">파티</th>
          <th style="text-align: left; padding: 8px; font-size: 12px;">캐릭터</th>
          <th style="text-align: left; padding: 8px; font-size: 12px;">코스트</th>
          <th style="text-align: left; padding: 8px; font-size: 12px;">남은 시간</th>
          <th style="text-align: left; padding: 8px; font-size: 12px;">설명</th>
        </tr>
      </thead>
      <tbody>`;

    analysis_result.skillOrders.forEach((skill, index) => {
      const party = analysis_result.partyData[skill.partyNumber - 1];
      let characterName = "알 수 없음";

      if (party) {
        const characterIndex =
          skill.type === "striker" ? skill.order - 1 : skill.order - 1 + 4;
        const charValue = party[characterIndex];
        if (charValue && charValue > 0) {
          const { code } = parseCharacterInfo(charValue);
          characterName = getCharacterName(code, studentsMap);
        }
      }

      html += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; font-size: 11px;">#${index + 1}</td>
          <td style="padding: 8px; font-size: 11px;">파티 ${skill.partyNumber}</td>
          <td style="padding: 8px; font-size: 11px;">${characterName}</td>
          <td style="padding: 8px; font-size: 11px;">${skill.cost / 10}</td>
          <td style="padding: 8px; font-size: 11px; font-family: monospace;">${skill.remainingTime}</td>
          <td style="padding: 8px; font-size: 11px; color: #6b7280;">${skill.description || "-"}</td>
        </tr>`;
    });

    html += `
      </tbody>
    </table>
  </div>`;
  }

  if (analysis_result.description) {
    html += `
  <h3 style="color: #374151; margin: 30px 0 15px 0;">설명</h3>
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <p style="color: #6b7280; font-size: 14px; white-space: pre-wrap; margin: 0;">${analysis_result.description}</p>
  </div>`;
  }

  html += `
</div>`;

  return html;
}
