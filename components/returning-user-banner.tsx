"use client";

import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ReturningUserBannerProps {
  intentSummary: string;
  onContinue: () => void;
  onStartFresh: () => void;
}

export function ReturningUserBanner({
  intentSummary,
  onContinue,
  onStartFresh,
}: ReturningUserBannerProps) {
  return (
    <div
      className="
        relative w-full overflow-hidden rounded-xl border border-amber-200/70
        bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50
        px-4 py-3.5 shadow-sm
        dark:border-amber-800/40
        dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40
      "
    >
      {/* Decorative background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-300/20 blur-2xl dark:bg-amber-600/15"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Icon + text */}
        <div className="flex items-start gap-2.5 sm:items-center">
          <span
            className="
              flex size-8 shrink-0 items-center justify-center rounded-full
              bg-amber-100 text-amber-600
              dark:bg-amber-900/60 dark:text-amber-400
            "
            aria-hidden
          >
            <Sparkles className="size-4" />
          </span>

          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Welcome back!
            </p>
            <p className="text-sm text-foreground/80 dark:text-foreground/70">
              Last time you were looking for:{" "}
              <span className="font-medium text-foreground">{intentSummary}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 pl-10 sm:pl-0">
          <Button
            size="sm"
            onClick={onContinue}
            className="
              bg-amber-500 text-white hover:bg-amber-600
              dark:bg-amber-600 dark:hover:bg-amber-700
            "
          >
            Continue where I left off
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onStartFresh}
            className="
              gap-1.5 text-amber-700 hover:bg-amber-100 hover:text-amber-900
              dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-300
            "
          >
            <RotateCcw className="size-3.5" />
            Start fresh
          </Button>
        </div>
      </div>
    </div>
  );
}
