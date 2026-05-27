"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";

export default function PrivacyPolicyPage() {
  const { t } = useTranslations();
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("privacy.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("privacy.updated")}</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s1.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t("privacy.s1.body")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s2.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("privacy.s2.auto.title")}</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("privacy.s2.auto.1")}</li>
                <li>{t("privacy.s2.auto.2")}</li>
                <li>{t("privacy.s2.auto.3")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("privacy.s2.user.title")}</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("privacy.s2.user.1")}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s3.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("privacy.s3.1")}</li>
              <li>{t("privacy.s3.2")}</li>
              <li>{t("privacy.s3.3")}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s4.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t("privacy.s4.intro")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>{t("privacy.s4.ga")}</strong> - {t("privacy.s4.ga.desc")}
              </li>
              <li>
                <strong>{t("privacy.s4.yt")}</strong> - {t("privacy.s4.yt.desc")}
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">{t("privacy.s4.noads")}</p>
            <p className="text-sm text-muted-foreground mt-4">{t("privacy.s4.refer")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s5.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t("privacy.s5.body")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s6.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("privacy.s6.1")}</li>
              <li>{t("privacy.s6.2")}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("privacy.s7.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("privacy.s7.body")}</p>
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
