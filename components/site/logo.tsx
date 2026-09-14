import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Suez Trading Internationale lockup — the company's own logo file, not a
 * typeset approximation: the dotted "S" swirl, the SUEZ wordmark in cargo
 * orange and the subsidiary line beneath it.
 *
 * Two exports of the same artwork, because the subsidiary line is near-black
 * and would disappear on the ink header: `-light.png` carries that line lifted
 * to bone for dark grounds, the plain file is the original for light ones.
 */
const ASSET = {
  light: "/brand/suez-trading-light.png", // for dark (ink) backgrounds
  dark: "/brand/suez-trading.png", // for light (bone) backgrounds
} as const;

/** Intrinsic size of the artwork, so Next can reserve the box without a jump. */
const ART = { width: 1100, height: 413 };

export function Logo({
  className,
  tone = "dark",
  /** Rendered height. The width follows the artwork's ratio. */
  size = "h-9 sm:h-11",
}: {
  className?: string;
  /** `light` = light ink on a dark ground; `dark` = dark ink on a light ground. */
  tone?: "dark" | "light";
  size?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Suez Trading Internationale — home"
      className={cn("group inline-flex items-center", className)}
    >
      <Image
        src={tone === "light" ? ASSET.light : ASSET.dark}
        alt="Suez Trading Internationale"
        width={ART.width}
        height={ART.height}
        priority
        className={cn("w-auto", size)}
      />
    </Link>
  );
}
