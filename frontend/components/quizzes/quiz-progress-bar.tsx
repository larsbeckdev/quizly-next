type QuizProgressBarProps = {
  current: number
  total: number
}

export function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100)

  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">
        Frage <span className="font-semibold text-foreground">{current}</span>{" "}
        von {total}
      </p>
      <div
        role="progressbar"
        aria-label="Fortschritt"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-transform duration-300 ease-out"
          style={{ width: "100%", transform: `translateX(${percent - 100}%)` }}
        />
      </div>
    </div>
  )
}
