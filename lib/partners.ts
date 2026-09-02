/**
 * Regulators, manufacturers and group companies carried over from the
 * previous sueztrading.com. The artwork is colour-on-white, which is why the
 * marquee on the home page sits on a light band rather than the ink.
 */
export type Partner = {
  name: string;
  logo: string;
  /** Short note used as the accessible label, so the strip is not seven bare logos. */
  kind: string;
};

export const partners: Partner[] = [
  { name: "NMDPRA", logo: "/partners/nmdpra.jpg", kind: "Regulator" },
  { name: "NUPRC", logo: "/partners/nuprc.jpg", kind: "Regulator" },
  { name: "Rotarex", logo: "/partners/rotarex.jpg", kind: "Manufacturer" },
  { name: "NPSC", logo: "/partners/npsc.jpg", kind: "Partner" },
  { name: "Ashfar", logo: "/partners/ashfar.jpg", kind: "Partner" },
  { name: "Suez Electric", logo: "/partners/suezelectric.jpg", kind: "Group company" },
  { name: "Suez Gas", logo: "/partners/suezgas.jpg", kind: "Group company" },
];
