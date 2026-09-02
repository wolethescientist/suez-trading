import Image from "next/image";
import { partners } from "@/lib/partners";

/**
 * The partner strip, carried over from the old site but rebuilt as a
 * continuous marquee rather than a click-through carousel — nobody clicks
 * through logos, and a slow drift reads as movement without demanding
 * attention.
 *
 * Two identical tracks slide in lockstep so the loop never shows a seam. The
 * band is bone rather than ink because the logos are colour-on-white and would
 * otherwise sit in seven bright boxes on a dark ground.
 */
export function Partners() {
  return (
    <section className="border-b border-bone-line bg-bone py-16 lg:py-20">
      <div className="container-page">
        <p className="eyebrow text-center text-cargo">Our partners</p>
        <h2 className="mx-auto mt-4 max-w-xl text-center text-[1.5rem] leading-tight text-ink sm:text-[1.75rem]">
          Regulators, manufacturers and group companies we work alongside
        </h2>
      </div>

      {/* Full-bleed so logos drift off the edges rather than stopping short of
          the container gutter. The mask fades them out instead of clipping. */}
      <div
        className="group mt-12 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-label="Partners and regulators"
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 animate-marquee items-center gap-5 pr-5 group-hover:[animation-play-state:paused]"
          >
            {partners.map((partner) => (
              <li
                key={`${copy}-${partner.name}`}
                className="flex h-24 w-64 flex-none items-center justify-center rounded-sm border border-bone-line bg-white px-7 sm:w-72"
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} — ${partner.kind}`}
                  width={400}
                  height={126}
                  className="h-auto max-h-16 w-full object-contain"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
