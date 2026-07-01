// Central registry of engineering modules migrated from the legacy standalone
// HTML calculators. Each entry maps a URL slug to the embedded asset and its
// presentation metadata. This is the single source of truth for the sidebar,
// the /modules index, and the /modules/[slug] dynamic route.
//
// To add a native React module later, add an entry with `component: true` and
// render it directly instead of via <ModuleFrame>.

export interface ModuleDefinition {
  slug: string;
  title: string;
  description: string;
  category: "Techno-Economics" | "Pipeline Sizing";
  // Path (under /public) to the self-contained legacy HTML calculator.
  htmlPath: string;
  icon: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    slug: "gas-power-lcoe",
    title: "Gas Power LCOE Calculator",
    description:
      "Levelized cost of electricity for gas engines and turbines on H₂, NH₃, natural gas, and blends — CapEx/OpEx breakdown, N+1 redundancy, Excel export.",
    category: "Techno-Economics",
    htmlPath: "/modules/gas-power-lcoe.html",
    icon: "bolt",
  },
  {
    slug: "multigas-converter",
    title: "Multi-Fuel Energy Equivalency",
    description:
      "Energy and mass balance converter across multiple fuels — normalize between mass, volume, and energy units.",
    category: "Techno-Economics",
    htmlPath: "/modules/multigas-converter.html",
    icon: "swap",
  },
  {
    slug: "pipeline-sizing",
    title: "H2 & NH3 Pipeline Sizing Calculator",
    description:
      "General-purpose pipeline hydraulic sizing — pressure drop, velocity, and diameter selection for hydrogen and ammonia.",
    category: "Pipeline Sizing",
    htmlPath: "/modules/pipeline-sizing.html",
    icon: "pipe",
  },
];

export function getModule(slug: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.slug === slug);
}
