"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterAvatar } from "@/components/common/character-image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

type VideoTableRow = {
  bossKey: string;
  extreme: string[] | null;
  insane: string[] | null;
  noteKeys?: string[];
};

function extractVideoIdFromUrl(url: string): string {
  const m = url.match(/video-analysis\/([^?]+)/);
  return m ? m[1] : url;
}

const ASSISTANTS = [
  {
    typeKey: "guide.assistant.type.explosive",
    color: "text-red-500",
    characters: [{ id: 10086, nameKey: "guide.char.hinaDress" }],
  },
  {
    typeKey: "guide.assistant.type.piercing",
    color: "text-orange-500",
    characters: [
      { id: 10059, nameKey: "guide.char.mika" },
      { id: 10111, nameKey: "guide.char.neruSchool" },
    ],
  },
  {
    typeKey: "guide.assistant.type.mystic",
    color: "text-purple-500",
    characters: [
      { id: 10033, nameKey: "guide.char.wakamo" },
      { id: 10100, nameKey: "guide.char.shirokoTerror" },
      { id: 10098, nameKey: "guide.char.hoshinoArmed" },
      { id: 10134, nameKey: "guide.char.ariceArmed" },
    ],
  },
  {
    typeKey: "guide.assistant.type.vibration",
    color: "text-blue-500",
    characters: [
      { id: 10074, nameKey: "guide.char.hanakoSwim" },
      { id: 10122, nameKey: "guide.char.mikaSwim" },
    ],
  },
] as const;

const VIDEO_TABLE: VideoTableRow[] = [
  {
    bossKey: "guide.boss.binah",
    extreme: ["https://bluearchive-torment.netlify.app/video-analysis/2NI_MRwoPOY?raid_id=S86-0"],
    insane: ["https://bluearchive-torment.netlify.app/video-analysis/6kJ_cSRr4AE?raid_id=S86-0"],
    noteKeys: ["guide.note.binah.1", "guide.note.binah.2"],
  },
  {
    bossKey: "guide.boss.hieronymus",
    extreme: [
      "https://bluearchive-torment.netlify.app/video-analysis/n1CwzkenlY4?raid_id=3S31-2",
      "https://bluearchive-torment.netlify.app/video-analysis/BU652VOnvsk?raid_id=3S31-3",
      "https://bluearchive-torment.netlify.app/video-analysis/69iFSgj3Vd0?raid_id=3S31-1",
    ],
    insane: null,
    noteKeys: ["guide.note.hieronymus.1"],
  },
  {
    bossKey: "guide.boss.goz",
    extreme: ["https://bluearchive-torment.netlify.app/video-analysis/v5wabaK6VDk?raid_id=S87-0"],
    insane: ["https://bluearchive-torment.netlify.app/video-analysis/yhYZ9NKm2hI?raid_id=S87-0"],
    noteKeys: ["guide.note.goz.1", "guide.note.goz.2"],
  },
  {
    bossKey: "guide.boss.perorodzilla",
    extreme: ["https://bluearchive-torment.netlify.app/video-analysis/St-3KrqOLX8?raid_id=3S32-4"],
    insane: ["https://bluearchive-torment.netlify.app/video-analysis/QXSOk-ITZLk?raid_id=3S32-3"],
    noteKeys: ["guide.note.perorodzilla.1", "guide.note.perorodzilla.2"],
  },
  {
    bossKey: "guide.boss.kaiten",
    extreme: null,
    insane: ["https://bluearchive-torment.netlify.app/video-analysis/ShGrjmNfBmQ?raid_id=S88-0"],
    noteKeys: ["guide.note.kaiten.1"],
  },
];

function VideoLinks({ urls, label }: { urls: string[] | null; label: string }) {
  if (!urls) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {urls.map((url, index) => (
        <Button key={url} asChild size="sm">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("guide_video_click", { video_id: extractVideoIdFromUrl(url) })
            }
          >
            <ExternalLink />
            {label}
            {urls.length > 1 ? ` ${index + 1}` : ""}
          </a>
        </Button>
      ))}
    </div>
  );
}

export default function GuidePage() {
  const { t } = useTranslations();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("guide.title")}</h1>
      <p className="text-muted-foreground">{t("guide.subtitle")}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t("guide.step1.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">{t("guide.step1.level.title")}</h3>
            <p className="text-muted-foreground text-sm">{t("guide.step1.level.desc")}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">{t("guide.step1.assist.title")}</h3>
            <p className="text-muted-foreground text-sm">{t("guide.step1.assist.desc")}</p>
            <div className="space-y-3">
              {ASSISTANTS.map((group) => (
                <div key={group.typeKey} className="flex items-start gap-4">
                  <span className={`text-sm font-semibold w-12 pt-1 shrink-0 ${group.color}`}>
                    {t(group.typeKey)}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {group.characters.map((char) => {
                      const name = t(char.nameKey);
                      return (
                        <div
                          key={char.id}
                          className="flex flex-col items-center gap-1 w-14"
                        >
                          <CharacterAvatar studentId={char.id} name={name} size="md" />
                          <span className="text-[10px] text-center text-muted-foreground leading-tight w-full break-keep">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">{t("guide.step1.gimmick.title")}</h3>
            <p className="text-muted-foreground text-sm">{t("guide.step1.gimmick.desc")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("guide.step2.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{t("guide.step2.intro")}</p>
          <p className="text-muted-foreground text-sm">{t("guide.step2.ref")}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-semibold">{t("guide.step2.table.boss")}</th>
                  <th className="text-center py-2 px-3 font-semibold">{t("guide.step2.table.extreme")}</th>
                  <th className="text-center py-2 px-3 font-semibold">{t("guide.step2.table.insane")}</th>
                  <th className="hidden sm:table-cell text-left py-2 pl-4 font-semibold text-muted-foreground">
                    {t("guide.step2.table.notes")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {VIDEO_TABLE.map((row) => (
                  <tr key={row.bossKey} className="border-b last:border-0 align-top">
                    <td className="py-3 pr-3 font-medium whitespace-nowrap">{t(row.bossKey)}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <VideoLinks urls={row.extreme} label={t("guide.step2.video")} />
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <VideoLinks urls={row.insane} label={t("guide.step2.video")} />
                    </td>
                    <td className="hidden sm:table-cell py-3 pl-4 text-xs text-muted-foreground">
                      {row.noteKeys?.map((nk) => (
                        <p key={nk}>{t(nk)}</p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("guide.step3.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">{t("guide.step3.intro")}</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              {t("guide.step3.line.party.before")}
              <Link
                href="/party"
                target="_blank"
                className="text-[#27a567] underline underline-offset-2 hover:text-[#30c77d] font-semibold"
              >
                {t("guide.step3.line.party.linkParty")}
              </Link>
              {t("guide.step3.line.party.middle")}
              <Link
                href="/video-analysis"
                target="_blank"
                className="text-[#27a567] underline underline-offset-2 hover:text-[#30c77d] font-semibold"
              >
                {t("guide.step3.line.party.linkVideo")}
              </Link>
              {t("guide.step3.line.party.after")}
            </li>
            <li>{t("guide.step3.line.external")}</li>
            <li>{t("guide.step3.line.torment")}</li>
            <li>
              {t("guide.step3.line.lunatic.before")}
              <strong className="text-foreground">{t("guide.step3.line.lunatic.bold")}</strong>
              {t("guide.step3.line.lunatic.after")}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
