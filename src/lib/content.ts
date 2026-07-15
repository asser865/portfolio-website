/**
 * All site copy lives here — one file to edit, no hunting through JSX.
 * Register: confident, minimal. Every line earns its place.
 */

export type CaseStudy = {
  slug: string;
  title: string;
  tag: string;
  year: string;
  role: string;
  summary: string;
  /** "servio" renders the live-composed ServioCover component */
  cover: "servio-home" | "bioattend-board" | "sweetspinner" | "spotify-cover" | "binary-pcb";
  coverAlt: string;
  /** optional supporting shot rendered between the build steps and the outcome */
  detail?: { slug: "spotify-shot" | "bioattend-thumb"; alt: string };
  /** product gallery — real screens with captions, after the build steps */
  gallery?: {
    slug:
      | "servio-marketplace"
      | "servio-ai-finisher"
      | "servio-dashboard"
      | "servio-admin"
      | "bioattend-thumb";
    alt: string;
    caption: string;
    /** aspect ratio of the source, e.g. "16/10" — reserves layout, no CLS */
    aspect: string;
  }[];
  problem: string;
  process: string[];
  outcome: string;
  outcomeStat: { value: string; label: string };
  stack: string[];
  links?: { label: string; url: string }[];
};

export const HERO = {
  label: "Software Engineer · Testing & QA — Cairo",
  // The one-liner under the name. No typing effects, no rotating words.
  statement:
    "Software engineer with a tester's conscience. I build complete platforms — then try my hardest to break them.",
  cta: { label: "Selected work", href: "#work" },
};

export const ABOUT = {
  heading: "Software that survives scrutiny.",
  body: [
    "I'm a Computer Science – Software Engineering graduate (AAST Cairo, final grade Excellent / A+). For my graduation project I designed, built, tested and deployed an AI-powered services marketplace — and owned the web platform end-to-end.",
    "I work across the stack with JavaScript, Node.js, Express and MongoDB, and I pair development with formal QA: manual, API and database testing grounded in ISTQB method. Before software, I built award-winning hardware — fingerprint attendance systems, autonomous robots, custom PCBs. That systems view is the difference between code that runs and software that holds.",
  ],
  stats: [
    { value: "A+", label: "Final grade, B.Sc. CS" },
    { value: "Top 10", label: "Maker Faire NYC" },
    { value: "ISTQB", label: "Testing method" },
    { value: "E2E", label: "Ownership, design → deploy" },
  ],
};

export const CAPABILITIES = [
  {
    index: "01",
    title: "Engineering",
    text: "JavaScript & TypeScript, Node.js, Express, MongoDB, REST APIs, Stripe integrations, Python / FastAPI services.",
  },
  {
    index: "02",
    title: "Quality",
    text: "Manual, API and database testing. Automation foundations. ISTQB & ISTQB Agile — quality designed in, not inspected in.",
  },
  {
    index: "03",
    title: "Systems & Design",
    text: "Embedded systems and PCB design shipped to competition standard. UI/UX in Figma, from research to high-fidelity prototype. AI / LLM feature integration.",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "servio",
    title: "Servio",
    tag: "AI services marketplace",
    year: "2026",
    role: "Web platform — owned end-to-end",
    summary:
      "An AI-powered marketplace that connects people with trusted home-maintenance technicians and manages the whole journey: matching, booking, payment, completion.",
    cover: "servio-home",
    coverAlt: "Servio landing page — AI-powered home services platform",
    gallery: [
      {
        slug: "servio-marketplace",
        alt: "Servio service marketplace — searchable catalog of home-maintenance services with categories and pricing",
        caption: "The marketplace — 50 live services, search, categories, real pricing",
        aspect: "16/10",
      },
      {
        slug: "servio-ai-finisher",
        alt: "Servio Room Finisher — AI feature that turns a photo of an unfinished room into a finishing plan",
        caption: "Room Finisher — photo in, AI finishing plan with cost tiers out",
        aspect: "16/10",
      },
      {
        slug: "servio-dashboard",
        alt: "Servio customer dashboard — bookings, upcoming schedule and live statuses",
        caption: "Customer dashboard — live bookings, schedule, technicians",
        aspect: "16/10",
      },
      {
        slug: "servio-admin",
        alt: "Servio admin panel — platform KPIs, revenue trend and booking status analytics",
        caption: "Admin panel — platform KPIs and booking analytics",
        aspect: "16/10",
      },
    ],
    problem:
      "Finding a home-maintenance technician you can trust is a coin flip: no vetting, no guarantees, cash-only payments, zero recourse when a job goes wrong. Servio's premise — make hiring a technician feel as safe as ordering a ride — only works if booking, payment and dispute flows are genuinely dependable.",
    process: [
      "Owned the web application end-to-end within a team of five: planning, architecture, development, testing and deployment.",
      "Built the front end in framework-free JavaScript (ES modules) and the back end on Node.js, Express and MongoDB — JWT auth, booking lifecycle, real-time messaging and a full admin panel.",
      "Integrated Stripe beyond the happy path: payments, refunds, disputes and technician payouts, each with the failure states tested deliberately.",
      "Wired Python/FastAPI AI services into the product: smart technician matching, plus a Room Finisher that turns a photo of an unfinished room into a design render.",
      "Tested what I built — API, database and end-to-end flows — using the same ISTQB discipline I'd apply to someone else's code.",
    ],
    outcome:
      "Delivered as my graduation project and graded Excellent. The platform handles the full service journey — from AI-assisted matching to paid, completed jobs — on infrastructure one person built and can defend line by line.",
    outcomeStat: { value: "Excellent", label: "Graduation grade — full platform delivered" },
    stack: [
      "JavaScript (ES modules)",
      "Node.js",
      "Express",
      "MongoDB",
      "Stripe",
      "Python / FastAPI",
      "JWT",
      "AI integration",
    ],
  },
  {
    slug: "bio-attend",
    title: "Bio Attend",
    tag: "Biometric attendance system",
    year: "2024",
    role: "Embedded systems engineer",
    summary:
      "Fingerprint-based student attendance that made proxy signing physically impossible — real-time, tamper-proof, reported automatically.",
    cover: "bioattend-board",
    coverAlt: "Bio Attend fingerprint sensor grid hardware",
    gallery: [
      {
        slug: "bioattend-thumb",
        alt: "Assembled Bio Attend classroom unit with LCD status display and optical fingerprint sensor",
        caption: "The assembled unit — LCD status readout, optical fingerprint sensor",
        aspect: "338/280",
      },
    ],
    problem:
      "Paper attendance invites proxy signing and eats faculty time. The fix had to be cheap enough to put in every classroom and reliable enough that nobody argues with its records.",
    process: [
      "Designed the classroom unit around a fingerprint sensor and ESP8266 on a custom PCB — designed, fabricated and assembled in-house.",
      "Wrote the firmware in C++ and a Python GUI for faculty; attendance streams into Google Sheets via API, so reports needed zero new infrastructure.",
      "Field-tested against the failure modes that kill biometric systems: misreads, network drops, enrollment edge cases.",
    ],
    outcome:
      "Deployed as a working system with real-time, tamper-proof tracking and automatic reporting — awarded Best Project in college evaluations.",
    outcomeStat: { value: "Best Project", label: "College evaluation award" },
    stack: ["C++", "ESP8266", "Custom PCB", "Python", "Google Sheets API"],
  },
  {
    slug: "sweet-spinner",
    title: "The Sweet Spinner",
    tag: "Autonomous robotics",
    year: "2019",
    role: "Embedded systems engineer",
    summary:
      "A fully autonomous robot that makes and serves cotton candy — start to finish, no human hands. Top 10 at the International Maker Faire, NYC.",
    cover: "sweetspinner",
    coverAlt: "The Sweet Spinner cotton candy robot",
    problem:
      "Cotton candy is a surprisingly hostile automation target: molten sugar, spinning mechanics, timing that shifts with humidity — and it has to perform in public, repeatedly, without an operator.",
    process: [
      "Built the full mechatronic sequence on Arduino in C++: dispensing, spinning, collection and serving as one autonomous cycle.",
      "Tuned motor control and sensor timing through relentless public-demo testing — the machine had to survive an exhibition floor, not a lab bench.",
    ],
    outcome:
      "Selected Top 10 at the International Maker Faire in New York City, earning three merit awards for design and engineering.",
    outcomeStat: { value: "Top 10 + 3 awards", label: "International Maker Faire, NYC" },
    stack: ["C++", "Arduino", "Motor control", "Sensors"],
  },
  {
    slug: "spotify-redesign",
    title: "Spotify Redesign",
    tag: "UI/UX case study",
    year: "2025",
    role: "UI/UX designer",
    summary:
      "A ground-up rework of Spotify's navigation and visual system in Figma — driven by user research, delivered as a high-fidelity interactive prototype.",
    cover: "spotify-cover",
    coverAlt: "Spotify redesign — reimagined player interface",
    detail: {
      slug: "spotify-shot",
      alt: "Spotify redesign — redesigned now-playing screen in the interactive prototype",
    },
    problem:
      "Spotify buries powerful features under inconsistent navigation: the same action lives in different places on different screens, and visual noise competes with the content. The brief I set myself: keep the brand instantly recognizable while making every core journey shorter and more predictable.",
    process: [
      "Ran user research on real listening habits to find where navigation actually breaks down — not where it looks untidy.",
      "Reworked the information architecture first, then the visual system: consistent placement for core actions, a calmer hierarchy around album art.",
      "Built the full high-fidelity prototype in Figma with working navigation flows, so the redesign can be experienced, not just viewed.",
    ],
    outcome:
      "A complete, clickable redesign of the core listening experience — researched, structured and finished to production fidelity in Figma.",
    outcomeStat: { value: "Hi-fi", label: "Interactive prototype — research → delivery" },
    stack: ["Figma", "User research", "Wireframing", "Prototyping"],
    links: [
      {
        label: "View in Figma",
        url: "https://www.figma.com/design/N67proVuoAJgwXpFA05xy7/Spotify_Ui?m=auto&t=T8QN6XnZl5yTOyfe-1",
      },
    ],
  },
  {
    slug: "binary-counter",
    title: "Binary Counter",
    tag: "Electronics",
    year: "2021",
    role: "Hardware — design to assembly",
    summary:
      "A 555-timer pulse counter displaying its running total in binary through LEDs — timing circuits and digital logic made physical on a custom PCB.",
    cover: "binary-pcb",
    coverAlt: "Binary counter custom PCB with LEDs",
    problem:
      "Binary counting is usually taught as an abstraction on a whiteboard. I wanted a physical instrument that makes the concept impossible to misunderstand: press a pulse, watch the bits flip.",
    process: [
      "Designed the circuit around a 555 timer as the pulse source and a CD4040 ripple counter driving the LED display.",
      "Laid out, fabricated and assembled the custom PCB — the same design-for-manufacture discipline I later taught as a PCB instructor.",
    ],
    outcome:
      "A working, durable teaching instrument — and the project that started a lasting habit of building electronics to a finished, manufactured standard rather than breadboard demos.",
    outcomeStat: { value: "Custom PCB", label: "Designed, fabricated, assembled" },
    stack: ["555 timer", "CD4040", "PCB design", "LEDs"],
  },
];

export const EXPERIENCE = [
  {
    period: "2022 — 2026",
    title: "B.Sc. Computer Science — Software Engineering",
    org: "Arab Academy for Science & Technology, Cairo",
    text: "Graduated Excellent (A+). Graduation project: Servio.",
  },
  {
    period: "2025",
    title: "Software Testing Diploma",
    org: "Machinfy Academy",
    text: "ISTQB & ISTQB Agile foundations; hands-on manual, API, database and automation testing.",
  },
  {
    period: "2025",
    title: "UI/UX Design Training",
    org: "National Telecommunication Institute",
    text: "User research, wireframing, high-fidelity prototyping in Figma.",
  },
  {
    period: "2024",
    title: "Front Desk Representative",
    org: "Air Gym, Cairo",
    text: "Client-facing service and sales — “Best Performance” two consecutive months.",
  },
  {
    period: "2020 — 2021",
    title: "Instructor — PCB Design & Fabrication",
    org: "Big Hero Academy, Cairo",
    text: "Taught PCB design, fabrication and assembly; wrote the course material.",
  },
];

export const CONTACT = {
  heading: "Build something that survives testing.",
  sub: "Open to software engineering and QA roles — remote or Cairo.",
};
