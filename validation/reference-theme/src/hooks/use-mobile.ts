// Viewport-breakpoint hook (D19): the design system's one shared answer to
// "is this a phone-width viewport?", used by components that restructure
// rather than merely restyle at small widths.
import * as React from "react"

/** Tailwind's `md` breakpoint — below it, layouts switch to the phone shape. */
const MOBILE_BREAKPOINT = 768

/**
 * True while the viewport is narrower than the mobile breakpoint. The state
 * starts undefined and the media query is read in an effect, so the FIRST
 * render always reports false — on a phone that is one frame of the desktop
 * layout before it corrects. Components that must not flash should render
 * a layout-neutral placeholder until this settles.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
