"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";

export default function TermsOfServicePage() {
  const { t } = useTranslations();
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("terms.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("terms.updated")}</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s1.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {t("terms.s1.body1.before")}
              <strong>{t("terms.s1.body1.bold")}</strong>
              {t("terms.s1.body1.after")}
            </p>
            <p>{t("terms.s1.body2")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s2.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {t("terms.s2.body1.before")}
              <strong>NEXON GAMES</strong> & <strong>YOSTAR</strong>
              {t("terms.s2.body1.after")}
            </p>
            <p>{t("terms.s2.body2")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s3.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t("terms.s3.1")}</li>
              <li>{t("terms.s3.2")}</li>
              <li>{t("terms.s3.3")}</li>
              <li>{t("terms.s3.4")}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s4.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t("terms.s4.intro")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t("terms.s4.1")}</li>
              <li>{t("terms.s4.2")}</li>
              <li>{t("terms.s4.3")}</li>
              <li>{t("terms.s4.4")}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s5.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t("terms.s5.body")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s6.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t("terms.s6.body")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("terms.s7.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("terms.s7.body")}</p>
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
