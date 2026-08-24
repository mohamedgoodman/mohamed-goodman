"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { GOAL_LIST } from "@/content/goals";
import { IMMERSION_LIST } from "@/content/immersion";
import { LEVEL_META } from "@/lib/learning/levels";
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

const MINUTE_LABEL: Record<DailyMinutes, string> = {
  10: "Enough for a real session. The minimum that still works.",
  20: "The sweet spot for most people.",
  30: "Noticeable progress within a month.",
  45: "Serious pace — expect fast improvement.",
  60: "Intensive. Best if you have a deadline.",
};

/** Six quick items used only when the learner picks "I don't know". */
const PLACEMENT = [
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
];

type Step = 0 | 1 | 2 | 3 | 4;

export function OnboardingWizard({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState<LearningGoalId | null>(null);
  const [level, setLevel] = useState<SelfReportedLevel | null>(null);
  const [minutes, setMinutes] = useState<DailyMinutes | null>(null);
  const [destination, setDestination] = useState<DestinationId | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(PLACEMENT.map(() => null));
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
          (answers.filter((a, i) => a === PLACEMENT[i]?.answer).length / PLACEMENT.length) * 100,
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
        setError(data.error ?? "Could not save your answers.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
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
          Step {position + 1} of {steps.length}
        </p>
      </div>

      <div key={step} className="animate-in-up">
        {step === 0 ? (
          <StepShell
            title={`Welcome, ${name.split(" ")[0]}.`}
            question="What is your main reason for learning English?"
            hint="This decides your vocabulary, your situations and the accent you train against. You can change it later."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {GOAL_LIST.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={goal === option.id}
                  title={option.label}
                  description={option.blurb}
                  icon={GOAL_ICONS[option.id]}
                  onClick={() => setGoal(option.id)}
                />
              ))}
            </div>
          </StepShell>
        ) : null}

        {step === 1 ? (
          <StepShell
            question="What level do you think you are?"
            hint="An honest guess is fine. The app measures your real level from your sessions and adjusts."
          >
            <div className="grid gap-3">
              {LEVELS.map((id) => (
                <OptionCard
                  key={id}
                  selected={level === id}
                  title={`${LEVEL_META[id].label} · ${LEVEL_META[id].cefr}`}
                  description={LEVEL_META[id].blurb}
                  onClick={() => setLevel(id)}
                />
              ))}
              <OptionCard
                selected={level === "unknown"}
                title="I don't know"
                description="Answer six quick questions and we'll place you."
                onClick={() => setLevel("unknown")}
              />
            </div>
          </StepShell>
        ) : null}

        {step === 2 ? (
          <StepShell
            question="Six quick questions"
            hint="No time limit, no score shown to anyone. This only sets your starting point."
          >
            <div className="space-y-5">
              {PLACEMENT.map((item, index) => (
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
                          "rounded-xl border px-3.5 py-3 text-left text-sm transition-all duration-250",
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
            question="Where do you want to sound at home?"
            hint="Optional. Immersion Mode adapts expressions, accent notes and cultural context to one environment."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {IMMERSION_LIST.map((pack) => (
                <OptionCard
                  key={pack.id}
                  selected={destination === pack.id}
                  title={pack.country}
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
            question="How much time can you practise every day?"
            hint="Pick the amount you can hit on a bad day. Consistency matters more than length."
          >
            <div className="grid gap-3">
              {DAILY_MINUTES.map((value) => (
                <OptionCard
                  key={value}
                  selected={minutes === value}
                  title={value === 60 ? "60+ minutes" : `${value} minutes`}
                  description={MINUTE_LABEL[value]}
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
          <ArrowLeft className="size-4" />
          Back
        </Button>
        {step === 4 ? (
          <Button size="lg" onClick={finish} disabled={!canContinue} loading={saving}>
            <Check className="size-4" />
            Build my plan
          </Button>
        ) : (
          <Button size="lg" onClick={next} disabled={!canContinue}>
            Continue
            <ArrowRight className="size-4" />
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
