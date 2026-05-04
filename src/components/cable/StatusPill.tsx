import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { Status } from "@/lib/cable-calc";
import { cn } from "@/lib/utils";

const styles: Record<Status, string> = {
  PASS: "bg-success/15 text-success border-success/30",
  CHECK: "bg-warning/15 text-warning-foreground border-warning/40 dark:text-warning",
  FAIL: "bg-destructive/15 text-destructive border-destructive/40",
};

const Icon = { PASS: CheckCircle2, CHECK: AlertTriangle, FAIL: XCircle };

export function StatusPill({ status, size = "md" }: { status: Status; size?: "sm" | "md" | "lg" }) {
  const I = Icon[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide",
        styles[status],
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm",
      )}
    >
      <I className={cn(size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} />
      {status}
    </span>
  );
}
