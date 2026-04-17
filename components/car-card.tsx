"use client";

import { ChevronRight, Fuel, Gauge, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import type { Car } from "@/lib/cars";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: Car;
  whyThisOne: string;
  rank: number;
}

const RANK_CONFIG = {
  1: {
    label: "Pick #1",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
    dot: "bg-amber-400",
  },
  2: {
    label: "Pick #2",
    badgeClass:
      "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/60 dark:text-slate-300 dark:border-slate-500",
    dot: "bg-slate-400",
  },
  3: {
    label: "Pick #3",
    badgeClass:
      "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700",
    dot: "bg-orange-400",
  },
} as const;

const FUEL_ICON: Record<Car["fuel_type"], React.ReactNode> = {
  petrol: <Fuel className="size-3" />,
  diesel: <Fuel className="size-3" />,
  electric: <Zap className="size-3" />,
  hybrid: <Zap className="size-3" />,
  cng: <Fuel className="size-3" />,
};

const TRANSMISSION_LABEL: Record<Car["transmission"], string> = {
  manual: "MT",
  automatic: "AT",
  amt: "AMT",
};

export function CarCard({ car, whyThisOne, rank }: CarCardProps) {
  const rankConfig = RANK_CONFIG[rank as 1 | 2 | 3] ?? RANK_CONFIG[3];

  return (
    <Card className="w-full overflow-hidden shadow-md ring-1 ring-foreground/8 transition-shadow hover:shadow-lg">
      {/* Hero image header */}
      <div
        className="relative h-[120px] w-full rounded-t-xl"
        style={{ background: car.image_placeholder }}
      >
        {/* Subtle scrim so badges are legible over any gradient/color */}
        <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-black/20 via-transparent to-black/30" />

        {/* Rank badge — top left */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm",
            rankConfig.badgeClass
          )}
        >
          <span className={cn("size-1.5 rounded-full", rankConfig.dot)} />
          {rankConfig.label}
        </span>

        {/* Price badge — top right */}
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full border border-white/30 bg-black/50 px-2.5 py-0.5 text-[12px] font-bold text-white backdrop-blur-sm">
          ₹{car.price_lakh.toFixed(1)} L
        </span>
      </div>

      <CardHeader className="gap-0.5 pb-0 pt-3">
        {/* Make + Model */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-bold leading-tight tracking-tight text-foreground">
            {car.make} {car.model}
          </h3>
          <StarRating count={car.safety_stars} />
        </div>

        {/* Variant */}
        <p className="text-xs font-medium text-muted-foreground">{car.variant}</p>

        {/* Tagline */}
        <p className="mt-1 text-xs italic text-muted-foreground/80">
          &ldquo;{car.tagline}&rdquo;
        </p>
      </CardHeader>

      <CardContent className="mt-3 flex flex-col gap-3">
        {/* Why this one */}
        <div className="flex items-start gap-1.5 rounded-lg bg-muted/60 px-3 py-2">
          <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-foreground/80">
            {whyThisOne}
          </p>
        </div>

        {/* Key specs row */}
        <div className="grid grid-cols-4 divide-x divide-border rounded-lg border border-border bg-muted/30 text-center text-[11px]">
          <div className="flex flex-col items-center gap-1 px-2 py-2">
            <Gauge className="size-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {car.mileage_kmpl}
            </span>
            <span className="text-muted-foreground">km/l</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-2 py-2">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{car.seating}</span>
            <span className="text-muted-foreground">seats</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-2 py-2">
            {FUEL_ICON[car.fuel_type]}
            <span className="font-semibold capitalize text-foreground">
              {car.fuel_type}
            </span>
            <span className="text-muted-foreground">fuel</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-2 py-2">
            <span className="text-[10px] font-bold text-muted-foreground">⚙</span>
            <span className="font-semibold text-foreground">
              {TRANSMISSION_LABEL[car.transmission]}
            </span>
            <span className="text-muted-foreground">trans</span>
          </div>
        </div>

        {/* Pros */}
        <div className="flex flex-wrap gap-1.5">
          {car.pros.slice(0, 3).map((pro) => (
            <Badge
              key={pro}
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
            >
              ✓ {pro}
            </Badge>
          ))}
        </div>
      </CardContent>

      {/* Use-case tags footer */}
      <CardFooter className="flex flex-wrap gap-1.5">
        {car.use_case_tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
