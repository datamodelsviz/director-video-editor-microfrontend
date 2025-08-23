import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const SleekSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-700/40 group-hover:bg-zinc-600/60 transition-colors duration-200">
      <SliderPrimitive.Range className="absolute h-full bg-white rounded-full transition-all duration-200" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-3 w-3 cursor-pointer rounded-full border-2 border-white bg-zinc-900 shadow-lg transition-all duration-200 hover:scale-110 hover:border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));

SleekSlider.displayName = SliderPrimitive.Root.displayName;

export { SleekSlider };
