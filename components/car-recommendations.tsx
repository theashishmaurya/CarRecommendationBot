"use client";

import { useState } from "react";
import { Users, Zap, Fuel, Settings2, ChevronRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { Car, RecommendCarsInput } from "@/lib/cars";
import { getCarsById } from "@/lib/cars";

interface CarRecommendationsProps {
  input: RecommendCarsInput;
}

const RANK_STYLES = [
  { label: "Top Pick", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800", badge: "bg-amber-400 text-white", dot: "bg-amber-400" },
  { label: "Runner Up", bg: "bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700", badge: "bg-slate-400 text-white", dot: "bg-slate-400" },
  { label: "Also Great", bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800", badge: "bg-orange-400 text-white", dot: "bg-orange-400" },
];

function CarDetailDialog({
  car,
  whyThisOne,
  rank,
  open,
  onClose,
}: {
  car: Car;
  whyThisOne: string;
  rank: number;
  open: boolean;
  onClose: () => void;
}) {
  const style = RANK_STYLES[rank - 1] ?? RANK_STYLES[2];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header gradient */}
        <div
          className="relative h-36 rounded-t-lg flex items-end p-4"
          style={{ background: car.image_placeholder }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
          <div className="relative z-10 flex w-full items-end justify-between">
            <div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
                <span className={`size-1.5 rounded-full bg-white/70`} />
                {style.label}
              </span>
              <h2 className="mt-1 text-xl font-bold text-white">
                {car.make} {car.model}
              </h2>
              <p className="text-sm text-white/80">{car.variant}</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-black/40 backdrop-blur px-3 py-1 text-sm font-bold text-white">
                ₹{car.price_lakh} L
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Tagline */}
          <p className="text-sm italic text-muted-foreground">&ldquo;{car.tagline}&rdquo;</p>

          {/* Why for you */}
          {whyThisOne && (
            <div className="rounded-lg bg-accent/50 px-4 py-3 flex gap-2 items-start">
              <ChevronRight className="size-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{whyThisOne}</p>
            </div>
          )}

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
              <Fuel className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Mileage</p>
                <p className="text-sm font-semibold">{car.mileage_kmpl} kmpl</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Seating</p>
                <p className="text-sm font-semibold">{car.seating} seats</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
              {car.fuel_type === "electric" || car.fuel_type === "hybrid" ? (
                <Zap className="size-4 text-muted-foreground shrink-0" />
              ) : (
                <Fuel className="size-4 text-muted-foreground shrink-0" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Fuel</p>
                <p className="text-sm font-semibold capitalize">{car.fuel_type}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
              <Settings2 className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Transmission</p>
                <p className="text-sm font-semibold uppercase">{car.transmission}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Safety</p>
                <StarRating count={car.safety_stars} />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
              <div className="size-4 shrink-0 flex items-center justify-center text-muted-foreground text-xs font-bold">↑</div>
              <div>
                <p className="text-xs text-muted-foreground">Ground</p>
                <p className="text-sm font-semibold">{car.ground_clearance_mm} mm</p>
              </div>
            </div>
          </div>

          {/* Pros */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Pros</p>
            <div className="flex flex-col gap-1.5">
              {car.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-2">
                  <span className="text-emerald-500 text-sm font-bold mt-0.5">✓</span>
                  <span className="text-sm">{pro}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Watch out for</p>
            <div className="flex flex-col gap-1.5">
              {car.cons.map((con) => (
                <div key={con} className="flex items-start gap-2">
                  <span className="text-orange-400 text-sm font-bold mt-0.5">−</span>
                  <span className="text-sm text-muted-foreground">{con}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {car.use_case_tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs capitalize">
                {tag.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CarRecommendations({ input }: CarRecommendationsProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const cars = getCarsById(input.car_ids);
  const compMap = Object.fromEntries(
    (input.comparisons ?? []).map((c) => [c.car_id, c.why_this_one])
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Overall reasoning */}
      {input.reasoning && (
        <p className="text-xs text-muted-foreground italic px-1">{input.reasoning}</p>
      )}

      {/* 3 compact cards — all visible, no scroll */}
      <div className="grid grid-cols-3 gap-2">
        {cars.map((car, i) => {
          const style = RANK_STYLES[i] ?? RANK_STYLES[2];
          return (
            <button
              key={car.id}
              onClick={() => setSelectedIdx(i)}
              className={`
                relative flex flex-col rounded-xl border overflow-hidden text-left
                transition-all duration-150 hover:shadow-md hover:scale-[1.02]
                active:scale-[0.98] cursor-pointer
                ${style.bg}
              `}
            >
              {/* Mini gradient header */}
              <div
                className="h-14 w-full relative"
                style={{ background: car.image_placeholder }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className={`absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${style.badge}`}>
                  #{i + 1}
                </span>
              </div>

              {/* Card body */}
              <div className="p-2 flex flex-col gap-1 flex-1">
                <p className="text-xs font-bold leading-tight line-clamp-1">
                  {car.make} {car.model}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {car.body_type} · {car.fuel_type}
                </p>
                <p className="text-xs font-semibold text-foreground mt-auto pt-1">
                  ₹{car.price_lakh}L
                </p>
              </div>

              {/* Tap hint */}
              <div className="px-2 pb-2">
                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                  <ChevronRight className="size-2.5" /> details
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail dialogs */}
      {cars.map((car, i) => (
        <CarDetailDialog
          key={car.id}
          car={car}
          whyThisOne={compMap[car.id] ?? ""}
          rank={i + 1}
          open={selectedIdx === i}
          onClose={() => setSelectedIdx(null)}
        />
      ))}
    </div>
  );
}
