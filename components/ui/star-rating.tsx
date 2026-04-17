import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3",
            i < count
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-[10px] text-muted-foreground">
        {count}/5 NCAP
      </span>
    </div>
  );
}
