import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  render,
  children,
  ...props
}: useRender.ComponentProps<"div"> & { value?: number }) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": value,
        className: cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        ),
        children: children ?? (
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        ),
      },
      props
    ),
    render,
  })
}

export { Progress }
