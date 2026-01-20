"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">개인정보처리방침</h1>
      <p className="text-muted-foreground mb-8">
        최종 수정일: 2025년 1월 20일
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. 개요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              BA Torment(이하 &quot;서비스&quot;)는 블루 아카이브의 비공식
              팬사이트입니다. 본 개인정보처리방침은 서비스 이용 시 수집되는
              정보와 그 처리 방법에 대해 설명합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. 수집하는 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">
                2.1 자동으로 수집되는 정보
              </h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>방문 기록 및 이용 패턴 (Google Analytics)</li>
                <li>기기 정보 (브라우저 종류, 운영체제 등)</li>
                <li>IP 주소 (익명화 처리)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2.2 사용자가 제공하는 정보</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  A.R.O.N.A 기능 이용 시 입력하는 Gemini API 키 (세션
                  스토리지에 임시 저장, 30분 후 자동 삭제)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. 정보의 이용 목적</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>서비스 제공 및 개선</li>
              <li>이용 통계 분석</li>
              <li>서비스 안정성 유지</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. 제3자 서비스</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>본 서비스는 다음의 제3자 서비스를 이용합니다:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>Google Analytics</strong> - 방문 통계 분석
              </li>
              <li>
                <strong>YouTube API</strong> - 영상 분석 기능
              </li>
              <li>
                <strong>Google AdSense</strong> - 광고 게재
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              각 서비스의 개인정보 처리에 관한 자세한 내용은 해당 서비스의
              개인정보처리방침을 참조해 주세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. 쿠키 사용</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              본 서비스는 사용자 경험 개선 및 통계 분석을 위해 쿠키를
              사용합니다. 브라우저 설정에서 쿠키 사용을 거부할 수 있으나, 일부
              기능이 제한될 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. 정보의 보관 및 삭제</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Gemini API 키: 세션 스토리지에 임시 저장, 30분 후 자동 삭제</li>
              <li>
                분석 데이터: Google Analytics 데이터 보관 정책에 따름
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. 문의</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              개인정보 처리에 관한 문의사항은 아래 이메일로 연락해 주세요:
            </p>
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
