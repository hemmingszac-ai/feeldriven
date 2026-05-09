type PillListProps = {
  items: string[]
  emptyMessage?: string
}

export function PillList({ items, emptyMessage }: PillListProps) {
  if (items.length === 0 && emptyMessage) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex h-7 items-center rounded-lg bg-secondary px-2.5 text-xs font-medium text-secondary-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
