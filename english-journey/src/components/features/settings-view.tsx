"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, MessageCircleQuestion, Send } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { OptionCard } from "@/components/ui/option-card";
import { GOAL_LIST } from "@/content/goals";
import { useI18n } from "@/i18n/provider";
import { LOCALES, LOCALE_META } from "@/i18n/config";
import { IMMERSION_LIST } from "@/content/immersion";
import { LEVEL_META } from "@/lib/learning/levels";
import { DAILY_MINUTES, LEVELS } from "@/types";
import type { DailyMinutes, DestinationId, LearningGoalId, LevelId } from "@/types";

export function SettingsView() {
  const { state, refresh } = useAppState();
  const { t, fmt, locale, setLocale } = useI18n();
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(patch: Record<string, unknown>, key: string) {
    setSaving(key);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      await refresh();
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t.settings.title}</h1>
        <p className="mt-2 text-muted">{t.settings.subtitle}</p>
      </div>

      <Card>
        <CardHeader title={t.settings.account} subtitle={state.user.email} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{state.user.name}</p>
            <p className="text-sm text-muted">
              {fmt(t.settings.memberSince, {
                date: new Date(state.user.createdAt).toLocaleDateString(
                  locale === "ar" ? "ar-MA" : "en-GB",
                ),
              })}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" />
            {t.nav.signOut}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title={t.settings.language} subtitle={t.settings.languageHint} />
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <Button
              key={code}
              variant={locale === code ? "primary" : "outline"}
              onClick={() => setLocale(code)}
            >
              <span className="text-base">{LOCALE_META[code].flag}</span>
              {LOCALE_META[code].nativeLabel}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.settings.goal}
          subtitle={t.settings.goalHint}
          action={
            saved === "goal" ? (
              <Badge tone="success">
                <Check className="size-3.5" />
                {t.common.saved}
              </Badge>
            ) : null
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {GOAL_LIST.map((goal) => (
            <OptionCard
              key={goal.id}
              selected={state.profile.goal === goal.id}
              title={t.content.goals[goal.id].label}
              description={t.content.goals[goal.id].blurb}
              onClick={() => save({ goal: goal.id as LearningGoalId }, "goal")}
            />
          ))}
        </div>
        {saving === "goal" ? <p className="mt-3 text-sm text-muted">{t.common.loading}</p> : null}
      </Card>

      <Card>
        <CardHeader
          title={t.settings.dailyTime}
          subtitle={t.settings.dailyTimeHint}
          action={
            saved === "time" ? (
              <Badge tone="success">
                <Check className="size-3.5" />
                {t.common.saved}
              </Badge>
            ) : null
          }
        />
        <div className="flex flex-wrap gap-2">
          {DAILY_MINUTES.map((minutes) => (
            <Button
              key={minutes}
              variant={state.profile.dailyMinutes === minutes ? "primary" : "outline"}
              onClick={() => save({ dailyMinutes: minutes as DailyMinutes }, "time")}
            >
              {minutes === 60 ? `60+ ${t.common.minutes}` : `${minutes} ${t.common.minutes}`}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.settings.level}
          subtitle={t.settings.levelHint}
          action={
            saved === "level" ? (
              <Badge tone="success">
                <Check className="size-3.5" />
                {t.common.saved}
              </Badge>
            ) : null
          }
        />
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <Button
              key={level}
              variant={state.profile.level === level ? "primary" : "outline"}
              onClick={() => save({ level: level as LevelId }, "level")}
            >
              {t.content.levels[level].label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.settings.destination}
          subtitle={t.settings.destinationHint}
          action={
            saved === "destination" ? (
              <Badge tone="success">
                <Check className="size-3.5" />
                {t.common.saved}
              </Badge>
            ) : null
          }
        />
        <div className="flex flex-wrap gap-2">
          {IMMERSION_LIST.map((pack) => (
            <Button
              key={pack.id}
              variant={state.profile.destination === pack.id ? "primary" : "outline"}
              onClick={() =>
                save(
                  { destination: (state.profile.destination === pack.id ? null : pack.id) as DestinationId | null },
                  "destination",
                )
              }
            >
              {pack.flag} {t.content.destinations[pack.id]}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title={t.settings.appearance} subtitle={t.settings.appearanceHint} />
        <ThemeToggle />
      </Card>

      <CoachPanel />
    </div>
  );
}

/**
 * Ask-the-coach box. It calls the server-side AI service, which uses a real
 * model when one is configured and the built-in engine otherwise — the API key
 * never reaches the browser.
 */
function CoachPanel() {
  const { t } = useI18n();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [live, setLive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (question.trim().length < 3) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await response.json()) as { answer?: string; live?: boolean; error?: string };
      setAnswer(data.answer ?? data.error ?? "No answer.");
      setLive(data.live ?? false);
    } catch {
      setAnswer(t.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title={t.settings.coach}
        subtitle={t.settings.coachHint}
        action={
          live === null ? null : (
            <Badge tone={live ? "success" : "neutral"}>
              {live ? t.settings.aiProvider : t.settings.offlineEngine}
            </Badge>
          )
        }
      />
      <form onSubmit={ask} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t.settings.coachPlaceholder}
          aria-label={t.settings.coach}
        />
        <Button type="submit" loading={loading}>
          <Send className="size-4" />
          {t.settings.ask}
        </Button>
      </form>
      {answer ? (
        <div className="animate-in-up mt-4 flex gap-3 rounded-xl bg-surface-2/60 p-4">
          <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-on-brand" />
          <p className="text-sm whitespace-pre-line">{answer}</p>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Configure <code className="rounded bg-surface-2 px-1">AI_PROVIDER</code> and{" "}
        <code className="rounded bg-surface-2 px-1">AI_API_KEY</code> on the server to route this
        through a real model. Without them the built-in engine answers.
      </p>
    </Card>
  );
}
