interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: { message?: string };
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-rose-600">{error.message}</p>}
    </div>
  );
}

export const inputClassName =
  "touch-target w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30";

export const selectClassName =
  "touch-target w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30";

export const textareaClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base leading-relaxed text-zinc-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30";

export const buttonPrimaryClassName =
  "touch-target w-full rounded-xl bg-rose-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors active:bg-rose-700 disabled:cursor-not-allowed disabled:bg-zinc-300";

export const buttonSecondaryClassName =
  "touch-target w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base font-semibold text-zinc-700 transition-colors active:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400";

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 sm:text-lg">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
