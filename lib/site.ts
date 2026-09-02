/**
 * Company facts drawn from the CAC Memorandum of Association for
 * SUEZ TRADING INTERNATIONALE LIMITED (registered Nigeria, May 2018).
 * Contact details are the live company lines published at sueztrading.com.
 */
export const site = {
  legalName: "Suez Trading Internationale Limited",
  name: "Suez Trading",
  shortName: "SUEZ",
  tagline: "General supplies, materials and energy — supplied properly.",
  description:
    "Suez Trading Internationale Limited is a Nigerian general trading and services company supplying building materials, beverages, appliances and general goods, alongside petroleum products, haulage, construction and facility services.",
  incorporated: "2018",
  stampDutyCert: "2018-6355-48277-58720",
  address: {
    line1: "No. 6 I. E Madubuike Close",
    line2: "Jabi",
    city: "Abuja",
    state: "Federal Capital Territory",
    country: "Nigeria",
  },
  phone: "+234 908 007 0070",
  whatsapp: "+2349080070070",
  email: "info@sueztrading.com",
  supportEmail: "support@sueztrading.com",
  hours: "Mon – Fri, 8:00am – 6:00pm · Sat, 9:00am – 3:00pm",
  socials: {
    linkedin: "#",
    instagram: "#",
    x: "#",
    facebook: "#",
  },
} as const;

export type ServiceLine = {
  slug: string;
  index: string;
  name: string;
  short: string;
  summary: string;
  intro: string;
  capabilities: string[];
  outcomes: { label: string; value: string }[];
  icon: string;
};

/** The seven operating divisions, mapped from clauses 1–12 of the memorandum. */
export const services: ServiceLine[] = [
  {
    slug: "petroleum-products",
    index: "01",
    name: "Petroleum Products & Supply",
    short: "Petroleum supply",
    icon: "Fuel",
    summary:
      "Bulk and retail supply of AGO, PMS, DPK, LPG and lubricants, backed by our own tanker fleet.",
    intro:
      "We market, trade and distribute refined petroleum products across Nigeria — from a single drum of engine oil to scheduled bulk AGO deliveries that keep plants, sites and generators running without interruption.",
    capabilities: [
      "Automotive Gas Oil (AGO / diesel) bulk and part-load supply",
      "Premium Motor Spirit (PMS) and Dual Purpose Kerosene (DPK)",
      "Liquefied Petroleum Gas (LPG) — cylinders and bulk decanting",
      "Industrial and automotive lubricants, greases and base oils",
      "Petrol filling station operation and dealer supply",
      "Scheduled replenishment contracts with guaranteed lifting windows",
    ],
    outcomes: [
      { label: "Delivery window", value: "24–72 hrs" },
      { label: "Minimum bulk load", value: "5,000 L" },
      { label: "Coverage", value: "Nationwide" },
    ],
  },
  {
    slug: "oil-and-gas-services",
    index: "02",
    name: "Oil & Gas Field Services",
    short: "Oil & gas services",
    icon: "Waves",
    summary:
      "Upstream and midstream support: procurement, drilling support, pipeline and facility maintenance.",
    intro:
      "Suez Trading supports onshore and offshore operators with procurement, equipment and field services across exploration, drilling, refining and distribution infrastructure.",
    capabilities: [
      "Oil field equipment procurement and manufacturers' representation",
      "Onshore and offshore drilling support services",
      "Pipeline, pumping station and filling station construction & maintenance",
      "Refinery and depot maintenance support",
      "Vessel dredging and stock pulling",
      "Petrochemical and gas products trading",
    ],
    outcomes: [
      { label: "Operating since", value: "2018" },
      { label: "Scope", value: "On & offshore" },
      { label: "Compliance", value: "CAC registered" },
    ],
  },
  {
    slug: "haulage-and-logistics",
    index: "03",
    name: "Haulage & Logistics",
    short: "Haulage & logistics",
    icon: "Truck",
    summary:
      "Tanker haulage, general freight and courier movement by road, anywhere in Nigeria.",
    intro:
      "Our transport arm moves petroleum products, building materials, general cargo and documents by road — with tracked movements and drivers who know the routes.",
    capabilities: [
      "Petroleum product haulage by tanker",
      "General cargo and heavy goods freight",
      "Courier and document movement",
      "Distribution runs for manufacturers and distributors",
      "Heavy-duty equipment relocation",
      "Dedicated vehicle hire for project sites",
    ],
    outcomes: [
      { label: "Mode", value: "Road, nationwide" },
      { label: "Tracking", value: "Per movement" },
      { label: "Turnaround", value: "Same-week" },
    ],
  },
  {
    slug: "construction-and-civil-works",
    index: "04",
    name: "Construction & Civil Works",
    short: "Construction",
    icon: "HardHat",
    summary:
      "Roads, bridges, waterways and building works — planning through to handover.",
    intro:
      "We deliver construction services of every description: planning, construction, improvement, erection, repair, alteration, maintenance and demolition of constructed works.",
    capabilities: [
      "Road, highway and bridge construction",
      "Waterway and railway civil works",
      "Building erection, alteration and repair",
      "Erosion control and site remediation",
      "Demolition and site clearance",
      "Project procurement of building materials",
    ],
    outcomes: [
      { label: "Delivery", value: "Turnkey" },
      { label: "Sectors", value: "Public & private" },
      { label: "Materials", value: "Self-supplied" },
    ],
  },
  {
    slug: "general-supplies-and-distribution",
    index: "05",
    name: "General Supplies & Distribution",
    short: "General supplies",
    icon: "PackageSearch",
    summary:
      "Building materials, beverages, appliances and general merchandise — import, stock and distribute.",
    intro:
      "As a general merchant and industrialist we buy, sell, import, export and distribute goods of all kinds: construction materials, beverages, appliances and consumables, supplied on contract or off the shelf.",
    capabilities: [
      "Building materials — cement, rods, roofing, finishes",
      "Beverage distribution and wholesale",
      "Appliances, tools and general merchandise",
      "Import, export and customs coordination",
      "Commission agency and manufacturers' representation",
      "Framework supply contracts for corporates and government",
    ],
    outcomes: [
      { label: "Order online", value: "Yes" },
      { label: "Bulk pricing", value: "On request" },
      { label: "Lead time", value: "48 hrs" },
    ],
  },
  {
    slug: "facility-and-environmental",
    index: "06",
    name: "Facility & Environmental Services",
    short: "Facility & environment",
    icon: "Leaf",
    summary:
      "Waste management, fumigation, landscaping, farming support and ICT/telecom infrastructure.",
    intro:
      "A broad services arm covering waste management, site clean-up, fumigation, horticulture and landscaping, farming, erosion control, plus information technology and telecommunication works.",
    capabilities: [
      "Waste management and site clean-up",
      "Fumigation and pest control",
      "Horticulture, landscaping and grounds maintenance",
      "Farming and agricultural support services",
      "Heavy-duty equipment hire",
      "Information technology and telecommunication installations",
    ],
    outcomes: [
      { label: "Contracts", value: "Monthly / annual" },
      { label: "Response", value: "48 hrs" },
      { label: "Coverage", value: "FCT & beyond" },
    ],
  },
  {
    slug: "fmcg-distribution",
    index: "07",
    name: "FMCG Distribution & Trade",
    short: "FMCG distribution",
    icon: "ShoppingBasket",
    summary:
      "Fast-moving consumer goods — food, drinks, household and personal care — sourced, warehoused and distributed at scale.",
    intro:
      "We buy fast-moving consumer goods direct from manufacturers and importers, hold them in our own warehousing, and move them out to wholesalers, retailers, hospitality and corporate accounts. High-turnover lines need short lead times and honest stock figures, so we run FMCG off the same depot discipline as everything else: what the page says is on the floor is on the floor.",
    capabilities: [
      "Food staples — rice, grains, cooking oils, sugar, flour and pasta",
      "Beverages — water, soft drinks, malt, juices and spirits",
      "Household care — detergents, cleaning agents, paper and disposables",
      "Personal care and toiletries",
      "Manufacturer and brand distributorship across the FCT and beyond",
      "Route-to-market distribution for retail, hospitality and institutional buyers",
    ],
    outcomes: [
      { label: "Order online", value: "Yes" },
      { label: "Restock cycle", value: "Weekly" },
      { label: "Coverage", value: "Nationwide" },
    ],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
