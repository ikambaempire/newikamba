// Centralized portfolio source for Work grid, Case Studies, ProjectDetail and homepage strip.
import creativeFilmmaker from "@/assets/creative-filmmaker.webp";
import creativeCamera from "@/assets/creative-camera.webp";

export interface PortfolioProject {
  slug: string;
  title: string;
  client: string;
  category: string;        // Documentary / Campaign / Photography ...
  year: string;
  services: string[];
  cover: string;
  hero?: string;
  excerpt: string;
  challenge: string;
  approach: string;
  outcome: string;
  metrics?: { label: string; value: string }[];
  gallery?: string[];
  featured?: boolean;       // appears on homepage
  span?: "wide" | "tall" | "normal"; // grid hint
}

const u = (p: string) => `https://images.unsplash.com/${p}?auto=format&fit=crop&w=1600&q=80`;

export const PROJECTS: PortfolioProject[] = [
  {
    slug: "youth-entrepreneurship-east-africa",
    title: "Youth Entrepreneurship in East Africa",
    client: "International Development Foundation",
    category: "Documentary",
    year: "2025",
    services: ["Documentary", "Editing", "Distribution"],
    cover: u("photo-1485846234645-a62644f84728"),
    excerpt: "A 20-minute documentary on how young entrepreneurs are reshaping economies across Rwanda, Kenya and Uganda.",
    challenge: "Tell a regional story across three countries while keeping production governance tight and on a fixed grant timeline.",
    approach: "A single production system with structured pre-interviews, shared shot lists, and centralized rushes review across all three crews.",
    outcome: "Featured at 3 international development conferences. 45K+ views across platforms. Used in two follow-on funding pitches.",
    metrics: [{ label: "Views", value: "45K+" }, { label: "Festivals", value: "3" }, { label: "Countries", value: "3" }],
    featured: true,
    span: "wide",
  },
  {
    slug: "climate-action-kigali-2025",
    title: "Climate Action — Kigali 2025",
    client: "Environmental NGO Coalition",
    category: "Impact Campaign",
    year: "2025",
    services: ["Campaign", "Event Coverage", "Social"],
    cover: u("photo-1540575467063-178a50c2df87"),
    excerpt: "Multi-format campaign content for a regional climate conference — event visuals, social graphics, and recap video.",
    challenge: "80+ assets across 4 countries with no unified production system and a 6-day delivery window after the event.",
    approach: "Centralized brief intake, daily delivery sprints, and multi-format export pipelines mapped to each platform.",
    outcome: "All 12 priority assets delivered on day 2. Campaign reached 200K+ across digital platforms.",
    metrics: [{ label: "Reach", value: "200K+" }, { label: "Assets", value: "80+" }, { label: "Markets", value: "4" }],
    featured: true,
    span: "tall",
  },
  {
    slug: "education-access-rural",
    title: "Education Access in Rural Communities",
    client: "STEM Education Initiative",
    category: "Photography",
    year: "2024",
    services: ["Photography", "Photo direction"],
    cover: u("photo-1606761568499-6d2451b23c66"),
    excerpt: "Photographic documentation of education programs reaching underserved communities.",
    challenge: "Capture authentic classroom moments without disrupting learning, in remote sites with no power or storage.",
    approach: "Two-person crews, mirrorless silent shooting, daily offline backup workflow, and consent-first portrait protocol.",
    outcome: "Photography featured in the annual report and donor communications. Three images licensed by UNICEF Rwanda.",
    featured: true,
    span: "normal",
  },
  {
    slug: "financial-inclusion-community",
    title: "Financial Inclusion — A Community Perspective",
    client: "Regional Financial Institution",
    category: "Documentary",
    year: "2024",
    services: ["Documentary", "Stakeholder comms"],
    cover: creativeFilmmaker,
    excerpt: "Short documentary highlighting community banking programs and their impact on local families and small businesses.",
    challenge: "Disjointed process with 5+ vendors and no central coordination across regional offices.",
    approach: "Single production governance framework with structured approval chains and one source-of-truth archive.",
    outcome: "Delivered 3 weeks early. Zero revision overruns. Used in investor presentations and annual stakeholder communications.",
    metrics: [{ label: "Early", value: "3 wks" }, { label: "Revisions", value: "0 overruns" }],
    span: "normal",
  },
  {
    slug: "health-workers-frontlines",
    title: "Health Workers on the Frontlines",
    client: "Healthcare NGO Coalition",
    category: "Campaign Storytelling",
    year: "2024",
    services: ["Video series", "Advocacy"],
    cover: creativeCamera,
    excerpt: "Video series featuring rural-clinic health workers — challenges, resilience, and the impact of international programs.",
    challenge: "Multiple stakeholders, unclear approval chains, and missed deadlines across past production attempts.",
    approach: "Structured 4-step production system with documented approval protocols and one editorial owner per episode.",
    outcome: "8 videos produced and archived within the governance framework. Used across fundraising and advocacy.",
    metrics: [{ label: "Episodes", value: "8" }, { label: "On time", value: "100%" }],
    span: "wide",
  },
  {
    slug: "real-estate-portfolio",
    title: "Real Estate Development Portfolio",
    client: "Property Development Company",
    category: "Photography",
    year: "2024",
    services: ["Architectural", "Lifestyle"],
    cover: creativeFilmmaker,
    excerpt: "Architectural and lifestyle photography for a premium real estate portfolio.",
    challenge: "Capture properties, communities, and the vision behind a multi-phase development on one short visit window.",
    approach: "Pre-scouted shot list per site, twilight & daylight windows planned to the minute, drone coverage where permitted.",
    outcome: "Photography integrated into marketing materials and online listings. Used by sales team in property tours.",
    span: "normal",
  },
];

export const featuredProjects = () => PROJECTS.filter(p => p.featured);
export const findProject = (slug: string) => PROJECTS.find(p => p.slug === slug);
export const adjacentProjects = (slug: string) => {
  const i = PROJECTS.findIndex(p => p.slug === slug);
  return { prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next: PROJECTS[(i + 1) % PROJECTS.length] };
};
