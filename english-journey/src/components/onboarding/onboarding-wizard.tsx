"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { GOAL_LIST } from "@/content/goals";
import { IMMERSION_LIST } from "@/content/immersion";
import { LEVEL_META } from "@/lib/learning/levels";
import { useI18n } from "@/i18n/provider";
import { GoalIllustration } from "@/components/visual/illustrations";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { cn } from "@/lib/utils";
import { DAILY_MINUTES, LEVELS } from "@/types";
import type { DailyMinutes, DestinationId, LearningGoalId, SelfReportedLevel } from "@/types";

const GOAL_ICONS: Record<LearningGoalId, string> = {
  work: "💼",
  studying: "🎓",
  travel: "✈️",
  immigration: "🏡",
  business: "📈",
  friends: "🫱",
  media: "🎬",
  general: "🌍",
};

interface PlacementItem {
  prompt: string;
  options: string[];
  answer: number;
}

/**
 * Six quick items used only when the learner picks "I don't know".
 *
 * The question is asked in the learner's language; the English being tested
 * stays in English, because that is the thing being measured.
 */
const PLACEMENT: Record<"en" | "ar", PlacementItem[]> = {
  en: [
    {
      prompt: "Choose the natural sentence:",
      options: ["I am agree with you.", "I agree with you.", "I am agreeing you."],
      answer: 1,
    },
    {
      prompt: "“Can I run something by you?” means…",
      options: ["Can I go running with you?", "Can I get your opinion on something?", "Can I pass you?"],
      answer: 1,
    },
    {
      prompt: "Complete: “I've been here ___ three years.”",
      options: ["since", "for", "during"],
      answer: 1,
    },
    {
      prompt: "Someone says “I'm good” after you offer coffee. They mean…",
      options: ["Yes, please", "No, thank you", "I feel healthy"],
      answer: 1,
    },
    {
      prompt: "Which is the most diplomatic disagreement?",
      options: ["You're wrong.", "I see your point, but my concern is the cost.", "That makes no sense."],
      answer: 1,
    },
    {
      prompt: "“Let's park that for now” means…",
      options: ["Let's stop the car", "Let's postpone that topic", "Let's cancel the project"],
      answer: 1,
    },
  ],
  ar: [
    {
      prompt: "ختار الجملة الطبيعية:",
      options: ["I am agree with you.", "I agree with you.", "I am agreeing you."],
      answer: 1,
    },
    {
      prompt: "«Can I run something by you?» كتعني…",
      options: ["واش نجري معاك؟", "واش ناخد رأيك فشي حاجة؟", "واش نفوتك؟"],
      answer: 1,
    },
    {
      prompt: "كمل: «I've been here ___ three years.»",
      options: ["since", "for", "during"],
      answer: 1,
    },
    {
      prompt: "شي حد قال ليك «I'm good» من بعد ما عرضتي عليه قهوة. كيقصد…",
      options: ["إيه، من فضلك", "لا، شكرا", "كنحس براسي بصحتي"],
      answer: 1,
    },
    {
      prompt: "أشمن وحدة هي الاعتراض الأكثر دبلوماسية؟",
      options: [
        "You're wrong.",
        "I see your point, but my concern is the cost.",
        "That makes no sense.",
      ],
      answer: 1,
    },
    {
      prompt: "«Let's park that for now» كتعني…",
      options: ["نوقفو الطوموبيل", "نأجلو هاد الموضوع", "نلغيو المشروع"],
      answer: 1,
    },
  ],
};

type Step = 0 | 1 | 2 | 3 | 4;

export function OnboardingWizard({ name }: { name: string }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const placement = PLACEMENT[locale];
  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState<LearningGoalId | null>(null);
  const [level, setLevel] = useState<SelfReportedLevel | null>(null);
  const [minutes, setMinutes] = useState<DailyMinutes | null>(null);
  const [destination, setDestination] = useState<DestinationId | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => PLACEMENT.en.map(() => null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsPlacement = level === "unknown";
  const steps: Step[] = needsPlacement ? [0, 1, 2, 3, 4] : [0, 1, 3, 4];
  const position = steps.indexOf(step);

  const canContinue =
    (step === 0 && goal !== null) ||
    (step === 1 && level !== null) ||
    (step === 2 && answers.every((a) => a !== null)) ||
    step === 3 ||
    (step === 4 && minutes !== null);

  function next() {
    const target = steps[position + 1];
    if (target !== undefined) setStep(target);
  }

  function back() {
    const target = steps[position - 1];
    if (target !== undefined) setStep(target);
  }

  async function finish() {
    if (!goal || !level || !minutes) return;
    setSaving(true);
    setError(null);
    const placementScore = needsPlacement
      ? Math.round(
          (answers.filter((a, i) => a === placement[i]?.answer).length / placement.length) * 100,
        )
      : null;
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          goal,
          selfReportedLevel: level,
          dailyMinutes: minutes,
          destination,
          placementScore,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? t.onboarding.saveError);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-10 sm:py-16">
      <div className="mb-8">
        <div className="flex items-center gap-2" aria-hidden>
          {steps.map((s, index) => (
            <span
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                index <= position
                  ? "[background:var(--grad-progress)] shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                  : "bg-surface-3",
              )}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          {t.onboarding.step} {position + 1} {t.common.of} {steps.length}
        </p>
      </div>

      <div key={step} className="animate-in-up">
        {step === 0 ? (
          <StepShell
            title={`${t.onboarding.welcome}، ${name.split(" ")[0]}`}
            question={t.onboarding.goalQuestion}
            hint={t.onboarding.goalHint}
          >
            <GoalIllustration className="mb-6 w-full max-w-xs opacity-90" />
            <div className="grid gap-3 sm:grid-cols-2">
              {GOAL_LIST.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={goal === option.id}
                  title={t.content.goals[option.id].label}
                  description={t.content.goals[option.id].blurb}
                  icon={GOAL_ICONS[option.id]}
                  onClick={() => setGoal(option.id)}
                />
              ))}
            </div>
          </StepShell>
        ) : null}

        {step === 1 ? (
          <StepShell
            question={t.onboarding.levelQuestion}
            hint={t.onboarding.levelHint}
          >
            <div className="grid gap-3">
              {LEVELS.map((id) => (
                <OptionCard
                  key={id}
                  selected={level === id}
                  title={`${t.content.levels[id].label} · ${LEVEL_META[id].cefr}`}
                  description={t.content.levels[id].blurb}
                  onClick={() => setLevel(id)}
                />
              ))}
              <OptionCard
                selected={level === "unknown"}
                title={t.onboarding.dontKnow}
                description={t.onboarding.dontKnowHint}
                onClick={() => setLevel("unknown")}
              />
            </div>
          </StepShell>
        ) : null}

        {step === 2 ? (
          <StepShell
            question={t.onboarding.placementQuestion}
            hint={t.onboarding.placementHint}
          >
            <div className="space-y-5">
              {placement.map((item, index) => (
                <div key={item.prompt} className="card p-4 sm:p-5">
                  <p className="font-medium">{item.prompt}</p>
                  <div className="mt-3 grid gap-2">
                    {item.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) =>
                            prev.map((a, i) => (i === index ? optionIndex : a)),
                          )
                        }
                        className={cn(
                          "rounded-xl border px-3.5 py-3 text-start text-sm transition-all duration-250",
                          answers[index] === optionIndex
                            ? "border-purple/60 bg-brand-soft shadow-[0_4px_16px_rgba(124,58,237,0.25)]"
                            : "border-border-strong bg-surface-2/50 hover:-translate-y-0.5 hover:border-purple/40",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </StepShell>
        ) : null}

        {step === 3 ? (
          <StepShell
            question={t.onboarding.destinationQuestion}
            hint={t.onboarding.destinationHint}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {IMMERSION_LIST.map((pack) => (
                <OptionCard
                  key={pack.id}
                  selected={destination === pack.id}
                  title={t.content.destinations[pack.id]}
                  description={pack.blurb}
                  icon={pack.flag}
                  onClick={() => setDestination(destination === pack.id ? null : pack.id)}
                />
              ))}
            </div>
          </StepShell>
        ) : null}

        {step === 4 ? (
          <StepShell
            question={t.onboarding.timeQuestion}
            hint={t.onboarding.timeHint}
          >
            <div className="grid gap-3">
              {DAILY_MINUTES.map((value) => (
                <OptionCard
                  key={value}
                  selected={minutes === value}
                  title={value === 60 ? `60+ ${t.common.minutesLong}` : `${value} ${t.common.minutesLong}`}
                  description={t.onboarding.minuteLabels[value]}
                  onClick={() => setMinutes(value)}
                />
              ))}
            </div>
          </StepShell>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-on-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={position === 0}>
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t.common.back}
        </Button>
        {step === 4 ? (
          <Button size="lg" onClick={finish} disabled={!canContinue} loading={saving}>
            <Check className="size-4" />
            {t.onboarding.buildPlan}
          </Button>
        ) : (
          <Button size="lg" onClick={next} disabled={!canContinue}>
            {t.common.continue}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StepShell({
  title,
  question,
  hint,
  children,
}: {
  title?: string;
  question: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title ? <p className="text-sm font-medium text-on-brand">{title}</p> : null}
      <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{question}</h1>
      <p className="mt-2 mb-6 text-muted">{hint}</p>
      {children}
    </div>
  );
}
