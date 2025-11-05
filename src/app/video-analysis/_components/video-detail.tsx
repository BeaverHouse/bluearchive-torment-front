"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Edit3, Copy, Check } from "lucide-react";
import { YouTubeEmbed } from "@/components/features/video/youtube-embed";
import PartyCard from "@/components/features/raid/party-card";
import { VideoAnalysisData } from "@/types/video";
import Link from "next/link";
import { getStudentsMap, getCharacterName } from "@/utils/character";

interface VideoDetailProps {
  videos: VideoAnalysisData[];
  currentVideo: VideoAnalysisData;
  onVideoChange: (video: VideoAnalysisData) => void;
  raidId: string | null;
}

export function VideoDetail({
  videos,
  currentVideo,
  onVideoChange,
  raidId,
}: VideoDetailProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(currentVideo.id.toString());

  const studentsMap = getStudentsMap();

  // 사용자 분석을 먼저, AI 분석을 나중에 정렬
  const sortedVideos = [...videos].sort((a, b) => {
    if (a.analysis_type !== "ai" && b.analysis_type === "ai") return -1;
    if (a.analysis_type === "ai" && b.analysis_type !== "ai") return 1;
    return 0;
  });
  const handleStartEdit = () => {
    // raid_id가 없으면 목록으로 이동
    if (!raidId) {
      window.location.href = "/video-analysis";
      return;
    }

    // 새로운 편집 페이지로 이동 (상태 전달)
    const editData = {
      videos: videos,
      currentVideo: currentVideo,
      activeTab: activeTab,
    };

    // sessionStorage에 데이터 임시 저장
    sessionStorage.setItem("editVideoData", JSON.stringify(editData));

    // raid_id와 함께 편집 페이지로 이동
    window.location.href = `/video-analysis/${currentVideo.video_id}/edit?raid_id=${raidId}`;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const selectedVideo = videos.find((v) => v.id.toString() === value);
    if (selectedVideo) {
      onVideoChange(selectedVideo);
    }
  };

  // 새로운 데이터 구조에서는 스킬 순서 관련 함수 제거 (skillOrders가 빈 배열)

  const generateHTML = (video: VideoAnalysisData) => {
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

        const code = Math.floor(char / 1000);
        const star = Math.floor((char % 1000) / 100);
        const weapon = Math.floor((char % 100) / 10);
        const assist = char % 10;
        const name = getCharacterName(code, studentsMap);

        // 성급과 무기 표시 개선
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
          ${
            assist
              ? '<div style="color: #10b981; font-size: 10px;">조력자</div>'
              : ""
          }
        </div>`;
      });

      html += `
    </div>
  </div>`;
    });

    // 스킬 순서 추가
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
            const code = Math.floor(charValue / 1000);
            characterName = getCharacterName(code, studentsMap);
          }
        }

        html += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; font-size: 11px;">#${index + 1}</td>
          <td style="padding: 8px; font-size: 11px;">파티 ${
            skill.partyNumber
          }</td>
          <td style="padding: 8px; font-size: 11px;">${characterName}</td>
          <td style="padding: 8px; font-size: 11px;">${skill.cost / 10}</td>
          <td style="padding: 8px; font-size: 11px; font-family: monospace;">${
            skill.remainingTime
          }</td>
          <td style="padding: 8px; font-size: 11px; color: #6b7280;">${
            skill.description || "-"
          }</td>
        </tr>`;
      });

      html += `
      </tbody>
    </table>
  </div>`;
    }

    // 설명 추가
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
  };

  const copyToClipboard = async (video: VideoAnalysisData) => {
    try {
      const html = generateHTML(video);
      await navigator.clipboard.writeText(html);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* 뒤로가기 버튼 */}
      <div className="flex items-center">
        <Link href="/video-analysis">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      {/* YouTube 임베드 */}
      <YouTubeEmbed
        videoId={currentVideo.video_id}
        title={`Video ${currentVideo.id}`}
      />

      {/* 탭 레이아웃 */}
      {videos.length > 1 ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList>
              {sortedVideos.map((video) => {
                if (video.analysis_type === "ai") {
                  return (
                    <TabsTrigger key={video.id} value={video.id.toString()}>
                      AI 분석
                    </TabsTrigger>
                  );
                } else {
                  return (
                    <TabsTrigger key={video.id} value={video.id.toString()}>
                      사용자 분석 v{video.version}
                    </TabsTrigger>
                  );
                }
              })}
            </TabsList>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentVideo)}
                disabled={copiedId === currentVideo.id}
              >
                {copiedId === currentVideo.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedId === currentVideo.id ? "복사됨" : "HTML 복사"}
              </Button>
              <Button onClick={handleStartEdit} size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                편집
              </Button>
            </div>
          </div>

          {sortedVideos.map((video) => (
            <TabsContent key={video.id} value={video.id.toString()}>
              {/* AI 분석 결과 */}
              {
                <div className="space-y-6 min-w-0">
                  <PartyCard
                    rank={-1}
                    value={video.analysis_result.score}
                    valueSuffix="점"
                    parties={video.analysis_result.partyData}
                  />

                  {/* 스킬 순서 표시 */}
                  {video.analysis_result.skillOrders &&
                    video.analysis_result.skillOrders.length > 0 && (
                      <div
                        className="bg-card border rounded-lg p-4"
                        style={{ width: "0", minWidth: "100%" }}
                      >
                        <h4 className="text-lg font-semibold mb-4">
                          스킬 순서
                        </h4>
                        <div className="overflow-x-auto">
                          <table
                            className="border-collapse"
                            style={{ width: "max-content", margin: "0 auto" }}
                          >
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                                  순서
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                                  파티
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                                  캐릭터
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                                  코스트
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                                  남은 시간
                                </th>
                                <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                                  설명
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {video.analysis_result.skillOrders.map(
                                (skill, index) => {
                                  // 해당 파티에서 캐릭터 찾기
                                  const party =
                                    video.analysis_result.partyData[
                                      skill.partyNumber - 1
                                    ];
                                  let characterName = "알 수 없음";
                                  let characterCode = 0;

                                  if (party) {
                                    const characterIndex =
                                      skill.type === "striker"
                                        ? skill.order - 1
                                        : skill.order - 1 + 4;
                                    const charValue = party[characterIndex];
                                    if (charValue && charValue > 0) {
                                      characterCode = Math.floor(
                                        charValue / 1000
                                      );
                                      characterName = getCharacterName(
                                        characterCode,
                                        studentsMap
                                      );
                                    }
                                  }

                                  return (
                                    <tr
                                      key={index}
                                      className="border-b hover:bg-muted/50"
                                    >
                                      <td className="py-2 px-3 text-sm font-medium whitespace-nowrap">
                                        #{index + 1}
                                      </td>
                                      <td className="py-2 px-3 text-sm whitespace-nowrap">
                                        파티 {skill.partyNumber}
                                      </td>
                                      <td className="py-2 px-3 text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                          {characterCode > 0 && (
                                            <Image
                                              src={`${
                                                process.env
                                                  .NEXT_PUBLIC_CDN_URL || ""
                                              }/batorment/character/${characterCode}.webp`}
                                              alt={characterName}
                                              width={24}
                                              height={24}
                                              className="object-cover rounded flex-shrink-0"
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.src = "/empty.webp";
                                              }}
                                            />
                                          )}
                                          <span className="truncate">
                                            {characterName}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 text-sm whitespace-nowrap">
                                        {skill.cost / 10}
                                      </td>
                                      <td className="py-2 px-3 text-sm font-mono whitespace-nowrap">
                                        {skill.remainingTime}
                                      </td>
                                      <td className="py-2 px-3 text-sm text-muted-foreground">
                                        <div className="max-w-[200px] truncate">
                                          {skill.description || "-"}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* 설명 표시 */}
                  {video.analysis_result.description && (
                    <div className="bg-card border rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3">설명</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {video.analysis_result.description}
                      </p>
                    </div>
                  )}
                </div>
              }
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(currentVideo)}
              disabled={copiedId === currentVideo.id}
            >
              {copiedId === currentVideo.id ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copiedId === currentVideo.id ? "복사됨" : "HTML 복사"}
            </Button>
            <Button onClick={handleStartEdit} size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              편집
            </Button>
          </div>

          {/* AI 분석 결과 */}
          {
            <div className="space-y-6 min-w-0">
              <PartyCard
                rank={-1}
                value={currentVideo.analysis_result.score}
                valueSuffix="점"
                parties={currentVideo.analysis_result.partyData}
              />

              {/* 스킬 순서 표시 */}
              {currentVideo.analysis_result.skillOrders &&
                currentVideo.analysis_result.skillOrders.length > 0 && (
                  <div
                    className="bg-card border rounded-lg p-4"
                    style={{ width: "0", minWidth: "100%" }}
                  >
                    <h4 className="text-lg font-semibold mb-4">스킬 순서</h4>
                    <div className="overflow-x-auto">
                      <table
                        className="border-collapse"
                        style={{ width: "max-content", margin: "0 auto" }}
                      >
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                              순서
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                              파티
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                              캐릭터
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                              코스트
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                              남은 시간
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                              설명
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentVideo.analysis_result.skillOrders.map(
                            (skill, index) => {
                              // 해당 파티에서 캐릭터 찾기
                              const party =
                                currentVideo.analysis_result.partyData[
                                  skill.partyNumber - 1
                                ];
                              let characterName = "알 수 없음";
                              let characterCode = 0;

                              if (party) {
                                const characterIndex =
                                  skill.type === "striker"
                                    ? skill.order - 1
                                    : skill.order - 1 + 4;
                                const charValue = party[characterIndex];
                                if (charValue && charValue > 0) {
                                  characterCode = Math.floor(charValue / 1000);
                                  characterName =
                                    getCharacterName(characterCode);
                                }
                              }

                              return (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-muted/50"
                                >
                                  <td className="py-2 px-3 text-sm font-medium whitespace-nowrap">
                                    #{index + 1}
                                  </td>
                                  <td className="py-2 px-3 text-sm whitespace-nowrap">
                                    파티 {skill.partyNumber}
                                  </td>
                                  <td className="py-2 px-3 text-sm">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {characterCode > 0 && (
                                        <Image
                                          src={`${
                                            process.env.NEXT_PUBLIC_CDN_URL ||
                                            ""
                                          }/batorment/character/${characterCode}.webp`}
                                          alt={characterName}
                                          width={24}
                                          height={24}
                                          className="object-cover rounded flex-shrink-0"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.src = "/empty.webp";
                                          }}
                                        />
                                      )}
                                      <span className="truncate">
                                        {characterName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-sm whitespace-nowrap">
                                    {skill.cost / 10}
                                  </td>
                                  <td className="py-2 px-3 text-sm font-mono whitespace-nowrap">
                                    {skill.remainingTime}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-muted-foreground">
                                    <div className="max-w-[200px] truncate">
                                      {skill.description || "-"}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* 설명 표시 */}
              {currentVideo.analysis_result.description && (
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3">설명</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {currentVideo.analysis_result.description}
                  </p>
                </div>
              )}
            </div>
          }
        </div>
      )}
    </div>
  );
}
