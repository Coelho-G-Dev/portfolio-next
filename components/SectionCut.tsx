type Props = {
  label: string;
  color: "lime" | "lavender" | "cream";
  side?: "left" | "right";
};

const colorClass: Record<Props["color"], string> = {
  lime: "border-lime text-lime",
  lavender: "border-lavender text-lavender",
  cream: "border-cream text-cream",
};

export default function SectionCut({ label, color, side = "right" }: Props) {
  const sideClass = side === "right" ? "right-10 md:right-24" : "left-10 md:left-24";
  return (
    <div className={`absolute -top-16 ${sideClass} hidden md:block pointer-events-none z-10`} aria-hidden="true">
      <span
        className={`flex items-center gap-2 font-mono text-[11px] tracking-widest lowercase mb-3 ${colorClass[color].split(" ")[1]}`}
      >
        {label} <span>◇</span>
      </span>
      <div className={`w-24 h-24 border rotate-45 ${colorClass[color].split(" ")[0]}`} />
    </div>
  );
}
