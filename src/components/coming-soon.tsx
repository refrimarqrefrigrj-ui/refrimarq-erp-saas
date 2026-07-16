import type { LucideIcon } from "lucide-react";

/** Placeholder padrão para módulos ainda não construídos. */
export function ComingSoon({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
        <span className="mt-2 rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Em construção
        </span>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
