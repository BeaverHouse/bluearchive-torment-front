"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">이용약관</h1>
      <p className="text-muted-foreground mb-8">
        최종 수정일: 2025년 1월 20일
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. 서비스 소개</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              BA Torment(이하 &quot;서비스&quot;)는 블루 아카이브 게임의
              <strong> 비공식 팬사이트</strong>입니다. 본 서비스는 NEXON GAMES
              및 YOSTAR와 공식적인 제휴 관계가 없습니다.
            </p>
            <p>
              서비스는 총력전 파티 검색, 영상 분석, 점수 계산기, AI 검색 등의
              기능을 제공합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. 저작권 및 지식재산권</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              블루 아카이브의 모든 캐릭터, 이미지, 로고 및 관련 콘텐츠의
              저작권은 <strong>NEXON GAMES</strong> 및 <strong>YOSTAR</strong>에
              있습니다.
            </p>
            <p>
              본 서비스에서 제공하는 분석 기능, 계산식, UI 등 독자적으로 개발된
              콘텐츠의 저작권은 서비스 운영자에게 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. 면책조항</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                본 서비스에서 제공하는 정보(파티 구성, 점수 계산 등)의 정확성을
                보장하지 않습니다.
              </li>
              <li>
                게임 데이터는 커뮤니티에서 수집/분석한 것으로, 실제 게임과 다를
                수 있습니다.
              </li>
              <li>
                서비스 이용으로 인해 발생하는 손해에 대해 책임지지 않습니다.
              </li>
              <li>
                서비스는 사전 공지 없이 변경되거나 중단될 수 있습니다.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. 이용 규칙</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>다음 행위는 금지됩니다:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>서비스에 대한 무단 크롤링 또는 자동화된 접근</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>타인의 권리를 침해하는 행위</li>
              <li>기타 관련 법령에 위반되는 행위</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. 광고</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              본 서비스는 운영 비용 충당을 위해 Google AdSense를 통한 광고를
              게재할 수 있습니다. 광고 수익은 서버 운영 및 서비스 개선에
              사용됩니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. 약관 변경</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내
              공지합니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을
              중단해야 합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. 문의</CardTitle>
          </CardHeader>
          <CardContent>
            <p>서비스 이용에 관한 문의사항은 아래 이메일로 연락해 주세요:</p>
            <p className="mt-2">
              <a
                href="mailto:haulrest@gmail.com"
                className="text-primary hover:underline"
              >
                haulrest@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
