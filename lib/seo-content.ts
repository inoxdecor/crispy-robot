export const SITE_ORIGIN = "https://www.thebenzzcreations.com";
export const CONTENT_UPDATED = "2026-11-07";
export const PRIMARY_MARKETS = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
] as const;
export const BUSINESS = {
  name: "TheBenzzCreations",
  email: "thebenzzcreationsofficial@gmail.com",
  telephone: "+919899788325",
  location: "New Delhi, India",
  address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressRegion: "Delhi", addressCountry: "IN" },
};

export type Service = {
  slug: string;
  name: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  paragraphs: string[];
  deliverables: string[];
  fit: string;
  faq: [string, string][];
  related: string[];
  projects: string[];
  frontendName: string;
  preview: string;
  frontendDescription: string;
  frontendBullets: string[];
  enquiry: string;
};

export const services: Service[] = [
  {
    slug: "website-development",
    name: "Website Development",
    title: "Website Development Worldwide | TheBenzzCreations",
    description:
      "Custom website development for India, the US, UK, UAE and Canada. Responsive websites and web apps with accessible design, technical SEO and clear enquiry journeys.",
    eyebrow: "Custom websites / Worldwide collaboration",
    intro:
      "A business website should explain your offer, earn attention and make the next step obvious. We design and develop custom websites for businesses worldwide, with a focus on India, the United States, United Kingdom, United Arab Emirates and Canada.",
    paragraphs: [
      "We start with the people using your website: what they need to understand, which questions they bring and how they should contact you. That work shapes the page structure, content hierarchy and navigation before development begins.",
      "The build can include a focused landing page, a multi-page business website, a customer portal or a full-stack web application. React and Next.js are options where they fit; the technical choice follows your content, integrations and maintenance needs.",
      "Responsive layouts, semantic HTML, descriptive metadata, image sizing and sensible loading behaviour are part of the implementation. A CMS, bookings, payments or CRM connection can be scoped when needed. Hosting, domain access, content responsibilities and ongoing support are agreed before launch.",
    ],
    deliverables: [
      "Website structure and user journeys",
      "Custom responsive interface",
      "Frontend and required backend development",
      "Technical SEO and crawlable page content",
      "Forms, CMS or business integrations where scoped",
      "Launch checks and project handover",
    ],
    fit: "Suitable for businesses launching a website, replacing a restrictive template, or connecting their online presence to an enquiry or service workflow. From our New Delhi base, we collaborate remotely and agree review schedules around your team's time zone.",
    faq: [
      [
        "Can you redesign an existing website?",
        "Yes. We review the current content, URLs and integrations, then agree what to retain and what to replace. Important existing URLs can be mapped to appropriate new pages with redirects.",
      ],
      [
        "Is SEO included in website development?",
        "The build can include technical foundations such as crawlable HTML, titles, descriptions, canonical URLs, sitemap and image optimisation. Content strategy and ongoing search work are scoped separately; rankings cannot be guaranteed.",
      ],
      [
        "What determines the cost?",
        "Page count, content preparation, custom functionality, integrations and review requirements determine the quote. We define those requirements before agreeing a price and timeline.",
      ],
    ],
    related: ["ui-ux-design", "ecommerce-development", "digital-marketing"],
    projects: ["nsar-workshop", "swiftpdf", "therapist-website"],
    frontendName: "Web development",
    preview: "web",
    frontendDescription:
      "Fast, credible sites and web apps that turn visitors into enquiries.",
    frontendBullets: [
      "Custom websites",
      "Next.js and React",
      "Full-stack web applications",
    ],
    enquiry: "websites",
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    title: "Mobile App Development Worldwide | TheBenzzCreations",
    description:
      "Android, iOS and React Native app development for India, the US, UK, UAE and Canada. Plan mobile experiences, backend integrations and release requirements.",
    eyebrow: "Android & iOS / Product development",
    intro:
      "Build a mobile experience around a task your customers actually return for. We scope Android, iOS and cross-platform applications for teams worldwide, with remote collaboration across India, the US, UK, UAE and Canada.",
    paragraphs: [
      "A useful app starts with a clear core journey: booking a service, placing an order, managing an account or accessing information on the move. We work through the user roles, screens and data requirements before selecting an approach.",
      "React Native can support a shared codebase for Android and iOS where the required features fit. Device capabilities, offline use, notifications, accessibility and existing systems all affect the implementation. We make those decisions against the agreed product requirements.",
      "The project can include API integration, authentication, an administration interface and a backend. Store submission preparation, account access, third-party services and post-release maintenance are discussed explicitly. A prototype or focused first release can help validate the user journey before a wider build.",
    ],
    deliverables: [
      "Requirements and mobile user journeys",
      "App wireframes and interface design",
      "Android and iOS development as scoped",
      "API, authentication and backend integration",
      "Relevant device and accessibility checks",
      "Release preparation and handover",
    ],
    fit: "For service businesses, internal teams and product owners who need a repeat-use mobile experience. A responsive website may be the better starting point for some ideas; discovery helps decide whether an app is appropriate.",
    faq: [
      [
        "Do you develop for both Android and iOS?",
        "Yes. Android, iOS and cross-platform work can be scoped. The choice depends on the required device features, audience, budget and maintenance plan.",
      ],
      [
        "Can the app connect to our existing software?",
        "We first review your API documentation, authentication and permissions. Suitable systems can be connected; missing APIs or legacy constraints may require additional backend work.",
      ],
      [
        "Are app store accounts included?",
        "Store accounts, platform fees and third-party services are discussed separately. The proposal defines the release support and the access required from your business.",
      ],
    ],
    related: [
      "ui-ux-design",
      "custom-software-development",
      "ai-integration-automation",
    ],
    projects: [],
    frontendName: "Mobile apps",
    preview: "mob",
    frontendDescription:
      "Apps your customers keep on their phone, connected to your back office.",
    frontendBullets: ["Android and iOS", "React Native applications"],
    enquiry: "mobile-apps",
  },
  {
    slug: "custom-software-development",
    name: "Custom Software Development",
    title: "Custom Software Development Worldwide | TheBenzzCreations",
    description:
      "Custom software development for teams worldwide, including India, the US, UK, UAE and Canada. Portals, dashboards and backend systems built around your workflows.",
    eyebrow: "Business software / Connected operations",
    intro:
      "When spreadsheets and disconnected tools create extra work, custom software can bring the process together. We develop business systems for international teams around their roles, information and everyday tasks.",
    paragraphs: [
      "We begin by mapping the workflow: where information enters, who changes it, which approvals are required and what a useful output looks like. That helps distinguish essential functionality from features that can wait.",
      "The scope can cover a CRM, inventory system, booking platform, customer portal, administration dashboard or SaaS product. Backend work can use Java / Spring Boot or Node.js as appropriate, with a web interface and integrations matched to the system requirements.",
      "Permissions, validation, data migration, reporting, error states and operational handover need attention alongside the main screens. We discuss hosting, backup responsibilities and support arrangements so the product has a practical path beyond its first release. Existing systems are reviewed before integration or replacement is promised.",
    ],
    deliverables: [
      "Workflow mapping and requirements",
      "User roles and permission design",
      "Custom interfaces and backend services",
      "Database structure and scoped integrations",
      "Validation, testing and deployment preparation",
      "Documentation and agreed handover",
    ],
    fit: "Useful for teams whose operating process does not fit an off-the-shelf tool. We work remotely with businesses in India, the US, UK, UAE, Canada and beyond to define a realistic scope rather than adding complexity for its own sake.",
    faq: [
      [
        "Can you build a CRM or inventory system?",
        "Yes. Customer records, stock movements, approvals and reporting can be scoped around the way your business operates.",
      ],
      [
        "Will we need to replace all our current tools?",
        "Not necessarily. We review the existing systems first. Connecting a useful tool may be more appropriate than rebuilding it.",
      ],
      [
        "Can development happen in stages?",
        "A phased build can prioritise a core workflow, then add capabilities after review. Milestones and dependencies are agreed in the proposal.",
      ],
    ],
    related: [
      "ai-integration-automation",
      "mobile-app-development",
      "ui-ux-design",
    ],
    projects: [],
    frontendName: "Software engineering",
    preview: "dash",
    frontendDescription:
      "Back ends and internal systems that fit how your business actually runs.",
    frontendBullets: [
      "Java / Spring Boot",
      "Node.js",
      "Business software",
      "SaaS platforms",
      "Admin dashboards",
      "Inventory systems",
      "CRM and internal tools",
    ],
    enquiry: "custom-software",
  },
  {
    slug: "ai-integration-automation",
    name: "AI Integration and Automation",
    title: "AI Integration & Automation Worldwide | TheBenzzCreations",
    description:
      "AI integration and workflow automation for India, the US, UK, UAE and Canada. Connect assistants, document processing and business tools with human review.",
    eyebrow: "Existing models / Practical workflows",
    intro:
      "AI is useful when it solves a defined task inside a working process. We integrate existing models and services into business software, websites and workflows, with clear controls and human review where needed.",
    paragraphs: [
      "We start with the task, the available data and the decisions a person still needs to make. An internal assistant, enquiry summary, document classification flow or drafted response each has different accuracy, permission and review requirements.",
      "The implementation can connect an LLM API, your application, approved knowledge sources and the tools your team already uses. We define what the system can access, how failures are handled and which actions require approval before they run.",
      "Provider costs, data handling, evaluation examples and operational limits are discussed during scoping. Automation should make the next step clearer rather than conceal uncertainty. We do not claim to build proprietary foundation models or guarantee that generated output is correct; the workflow is designed around the actual use case.",
    ],
    deliverables: [
      "Use-case and workflow review",
      "Model/API integration where appropriate",
      "Document or knowledge-source connections",
      "Human approval and fallback paths",
      "Evaluation examples and error handling",
      "Usage, access and maintenance guidance",
    ],
    fit: "For businesses looking to reduce repetitive handoffs or make information easier to use. Discovery and implementation can be carried out remotely worldwide, with data access, provider choices and review responsibilities agreed for your operating context.",
    faq: [
      [
        "Can AI connect to our existing systems?",
        "Often, yes. We review APIs, data access, permissions and provider requirements before proposing an integration.",
      ],
      [
        "Will the system run without human review?",
        "That depends on the task. Drafts, classifications and suggested actions can remain subject to team review, especially when errors have meaningful consequences.",
      ],
      [
        "Are model usage fees included?",
        "API subscriptions and usage charges are third-party costs. The proposal explains the services needed and how costs will be handled.",
      ],
    ],
    related: [
      "custom-software-development",
      "website-development",
      "mobile-app-development",
    ],
    projects: [],
    frontendName: "AI and automation",
    preview: "wf",
    frontendDescription:
      "Less manual work, with people kept in the loop on what matters.",
    frontendBullets: [
      "AI integration",
      "AI-powered applications",
      "LLM-based tools",
      "Workflow automation",
    ],
    enquiry: "ai-automation",
  },
  {
    slug: "ecommerce-development",
    name: "E-Commerce Development",
    title: "E-Commerce Development Worldwide | TheBenzzCreations",
    description:
      "E-commerce website and app development for India, the US, UK, UAE and Canada. Plan product catalogues, checkout, payment integration and order workflows.",
    eyebrow: "Storefront to fulfilment / Connected commerce",
    intro:
      "An online store needs to work for the person placing an order and the team fulfilling it. We design and develop e-commerce websites and apps for businesses worldwide, planning around their target market, currency and fulfilment needs.",
    paragraphs: [
      "Product discovery, variants, availability, cart behaviour and checkout all influence the customer journey. We organise the storefront around your catalogue and the information customers need before buying.",
      "Behind the interface, the scope can include payment gateway integration, customer accounts, inventory views, order management and notifications. Platform selection follows your catalogue, integrations and operating process. Merchant accounts, gateway approval and provider charges remain explicit dependencies.",
      "Mobile layouts, descriptive product content, accessible controls and image loading are planned alongside the core transaction flow. We discuss delivery rules, refunds, tax configuration and responsibility for store policies with your team rather than inventing business rules. Testing covers agreed checkout and failure paths before launch.",
    ],
    deliverables: [
      "Catalogue structure and customer journeys",
      "Responsive storefront interface",
      "Product, cart and checkout development",
      "Scoped payment gateway integration",
      "Order and inventory workflows",
      "Transaction checks and operational handover",
    ],
    fit: "For businesses launching a store, improving an existing checkout or connecting online orders to their internal operation. A catalogue-only site can also be appropriate when purchases are completed through an enquiry.",
    faq: [
      [
        "Can you integrate payments for our target country?",
        "We can scope a suitable provider when its country availability, supported currencies, APIs and your merchant account support the required flow. Approval, settlement terms and fees are handled with the provider.",
      ],
      [
        "Can the store connect to inventory or order software?",
        "We review the existing system's API and data model, then scope stock, order or customer synchronisation where feasible.",
      ],
      [
        "Do you provide product content and store policies?",
        "Content preparation can be discussed, but your business supplies or approves product facts and operating policies. The proposal identifies those responsibilities.",
      ],
    ],
    related: ["website-development", "ui-ux-design", "digital-marketing"],
    projects: [],
    frontendName: "E-commerce",
    preview: "store",
    frontendDescription:
      "Stores and shopping apps with everything needed to sell and fulfil.",
    frontendBullets: [
      "E-commerce websites and apps",
      "Payment gateway integration",
    ],
    enquiry: "ecommerce",
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    title: "UI/UX Design for Global Teams | TheBenzzCreations",
    description:
      "UI/UX design for teams in India, the US, UK, UAE and Canada. Clear website and app journeys, wireframes, prototypes and interfaces ready for development.",
    eyebrow: "User journeys / Interface systems",
    intro:
      "Good interface design helps people understand what they can do and complete the task in front of them. We design website, mobile and software experiences for international audiences, connecting user needs with practical development.",
    paragraphs: [
      "We review the brief, audience, content and existing experience before drawing screens. Navigation, page hierarchy and important states are explored through journeys and wireframes so the main decisions can be discussed early.",
      "Visual design then establishes typography, colour, spacing, components and responsive behaviour. A prototype can help your team review a booking flow, dashboard or checkout before it is implemented. Loading, empty, error and keyboard-focus states are considered alongside the ideal path.",
      "Design handover can include reusable components, interaction notes and feedback during development. When design and engineering are part of the same project, the interface can be refined against the working build. Research and usability sessions are scoped explicitly; we do not imply that untested screens have been validated by customers.",
    ],
    deliverables: [
      "Audience and task review",
      "Information architecture and wireframes",
      "Responsive visual interface design",
      "Reusable components and key states",
      "Interactive prototypes where scoped",
      "Development handover and design review",
    ],
    fit: "For teams launching a digital product, clarifying a confusing interface or preparing a design for implementation. Remote projects across India, the US, UK, UAE and Canada can be planned around a shared review process and agreed feedback windows.",
    faq: [
      [
        "Can you work with our existing developers?",
        "Yes. A design-only scope can include agreed handover files and implementation notes, with review sessions where required.",
      ],
      [
        "Can you redesign a dashboard or mobile app?",
        "Yes. We review the tasks, roles and existing screens, then define the journeys and interface states to improve.",
      ],
      [
        "Does UI/UX design include user testing?",
        "Research and usability testing are included only when specified in the scope. We agree participants, tasks and how findings will inform the design.",
      ],
    ],
    related: [
      "website-development",
      "mobile-app-development",
      "custom-software-development",
    ],
    projects: ["nsar-workshop", "swiftpdf", "therapist-website"],
    frontendName: "Design and brand",
    preview: "brand",
    frontendDescription:
      "Interfaces and identities that look credible and feel clear.",
    frontendBullets: [
      "UI/UX design",
      "Brand identity",
      "Motion graphics",
      "Social media creatives",
      "Product visuals",
      "AI-assisted promotional videos",
    ],
    enquiry: "ui-ux-design",
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    title: "Digital Marketing for Global Businesses | TheBenzzCreations",
    description:
      "Digital marketing for India, the US, UK, UAE and Canada: technical SEO, landing pages, campaign creatives and consent-aware measurement around your goals.",
    eyebrow: "Search, content & measurement / Agreed scope",
    intro:
      "A useful marketing plan connects your offer, content and enquiry journey. We support businesses worldwide with search foundations, landing pages, creative assets and practical measurement tailored to the audiences they want to reach.",
    paragraphs: [
      "We first review the audience, current website, channels and actions that matter to your business. That establishes what to measure and which improvements are worth prioritising before producing more pages or launching campaigns.",
      "Work can include a technical SEO review, service-page content, conversion-focused landing pages, social creatives and launch assets. Metadata, internal linking, crawlability and mobile usability can be addressed together with the development work behind them.",
      "Analytics and lead events help review what is happening, subject to appropriate consent and reliable data. Campaign channels, reporting cadence, advertising budgets and any ongoing optimisation are agreed separately. Search rankings, traffic volumes and sales outcomes depend on factors beyond implementation and are not guaranteed.",
    ],
    deliverables: [
      "Website and channel review",
      "Technical and on-page SEO priorities",
      "Landing page structure and content",
      "Scoped campaign and social creatives",
      "Consent-aware analytics and lead events",
      "Agreed reporting and improvement plan",
    ],
    fit: "For businesses that need a clearer route from discovery to enquiry. We collaborate remotely with teams in India, the US, UK, UAE and Canada, agreeing target audiences, content responsibilities and measurement before work begins.",
    faq: [
      [
        "Can you guarantee a Google ranking?",
        "No. Search performance depends on competition, content, authority and search-engine decisions. We focus on useful content, technical quality and measurable work.",
      ],
      [
        "Is advertising spend included?",
        "Media budgets, platform charges and management scope are discussed separately. The proposal specifies the channels and responsibilities.",
      ],
      [
        "Can you track enquiries without collecting form details in analytics?",
        "Yes. A confirmed submission can trigger a lead event containing a service category and form identifier, without sending names, email addresses, phone numbers or the enquiry message to analytics.",
      ],
    ],
    related: ["website-development", "ecommerce-development", "ui-ux-design"],
    projects: [],
    frontendName: "Growth and support",
    preview: "grow",
    frontendDescription:
      "Getting found, staying fast and keeping everything running.",
    frontendBullets: ["SEO", "Digital marketing", "Maintenance and deployment"],
    enquiry: "seo-support",
  },
];

export const projects = [
  {
    slug: "nsar-workshop",
    name: "NSAR Workshop",
    title: "NSAR Workshop Website Project | TheBenzzCreations",
    description:
      "Explore the NSAR Workshop website: an institutional event interface organising workshop information, applications and a clear route to essential details.",
    external: "https://www.nsar2026.org/",
    image: "nsar",
    width: 1600,
    height: 704,
    alt: "NSAR Workshop website homepage with its event title, navigation and application information",
    services: ["website-development", "ui-ux-design"],
    summary:
      "An institutional event website bringing workshop information and application details into one public destination.",
    challenge:
      "Visitors need to find the event information, programme and application route without navigating a crowded interface. The website organises those details around a clear public-facing structure.",
    approach:
      "The project uses a readable content hierarchy, direct navigation and a responsive layout for an information-led event website. The preview is taken from the studio's existing published portfolio; the live destination is linked for context.",
  },
  {
    slug: "swiftpdf",
    name: "SwiftPDF",
    title: "SwiftPDF Web Interface Project | TheBenzzCreations",
    description:
      "Explore SwiftPDF, a PDF utility web interface focused on helping visitors discover editing, conversion and compression tools through clear navigation.",
    external: "https://khushalsehrawat.github.io/swiftpdf/",
    image: "swiftpdf",
    width: 1600,
    height: 775,
    alt: "SwiftPDF homepage showing a grid of PDF editing, conversion and compression tools",
    services: ["website-development", "ui-ux-design"],
    summary:
      "A PDF utility interface that makes document tools easy to discover and navigate.",
    challenge:
      "Document tools can feel crowded. Visitors need to recognise their task and find an obvious starting point, whether they want to edit, convert or compress a PDF.",
    approach:
      "The published interface groups familiar document actions into a focused tool layout. This project page describes the interface and does not repeat unverified adoption figures, product availability claims or testimonials from the linked site.",
  },
  {
    slug: "therapist-website",
    name: "Therapist Website",
    title: "Therapist Service Website Project | TheBenzzCreations",
    description:
      "Explore a therapist service website interface designed around clear service information, a calm visual hierarchy and an accessible first enquiry journey.",
    external: "https://khushalsehrawat.github.io/therapist/",
    image: "therapist",
    width: 1600,
    height: 495,
    alt: "Therapist service website homepage with a calm headline, service navigation and enquiry call to action",
    services: ["website-development", "ui-ux-design"],
    summary:
      "A calm service website with a clear introduction and an approachable route to a first enquiry.",
    challenge:
      "A visitor considering a personal service needs practical information without feeling overwhelmed. Content hierarchy and the next step are important parts of that first visit.",
    approach:
      "A gentle visual language introduces the service and supports a clear enquiry path. This is a design and development example, not an endorsement of the practitioner's credentials or any health claims on the linked website.",
  },
];

export const homepageFaqs: [string, string][] = [
  [
    "How much does a custom website cost?",
    "It depends on pages, features and integrations, so every project is quoted individually. Share your brief and we’ll reply with a clear estimate.",
  ],
  [
    "Do you develop Android and iOS apps?",
    "Yes, including cross-platform apps built with React Native, connected to an admin panel or your existing systems.",
  ],
  [
    "Can you build custom software for my business?",
    "Yes: internal tools, CRMs, inventory systems, dashboards and the Java / Spring Boot or Node.js back ends behind them.",
  ],
  [
    "Can AI be integrated into existing systems?",
    "Often, yes. We integrate existing AI models and services into your workflows, and we’ll say plainly if it isn’t a good fit.",
  ],
  [
    "Do you build e-commerce websites and apps?",
    "Yes: catalogues, checkout, payment gateway integration, inventory, orders and admin dashboards.",
  ],
  [
    "How long does a project take?",
    "A focused website can take a few weeks. Apps and software take longer. We agree a timeline after discovery.",
  ],
  [
    "Do you help with deployment and maintenance?",
    "Yes. We support deployment and can agree ongoing maintenance, with the scope defined before we start.",
  ],
  [
    "How do we start?",
    "Send the form or message us on WhatsApp. We’ll reply with a short note and a link to book a call.",
  ],
];

export const corePages = [
  {
    path: "/",
    key: "home",
    title: "Website & App Development Worldwide | TheBenzzCreations",
    description:
      "Custom websites, mobile apps, software, AI and digital design for businesses worldwide. Working remotely with India, the US, UK, UAE and Canada.",
  },
  {
    path: "/services",
    key: "services",
    title: "Digital Services for Global Businesses | TheBenzzCreations",
    description:
      "Explore web and app development, software, AI, e-commerce, UI/UX and digital marketing for businesses in India, the US, UK, UAE, Canada and worldwide.",
  },
  {
    path: "/work",
    key: "work",
    title: "Website & UI Portfolio | TheBenzzCreations",
    description:
      "Explore NSAR Workshop, SwiftPDF and a therapist website: published website and interface projects from TheBenzzCreations, New Delhi.",
  },
  {
    path: "/privacy",
    key: "privacy",
    title: "Privacy & Analytics Choices | TheBenzzCreations",
    description:
      "How TheBenzzCreations handles project enquiries, optional analytics, consent preferences and information you share with our New Delhi studio.",
  },
];

export const informationPages = [
  { path: "/about", key: "about", title: "About Our Digital Studio | TheBenzzCreations", description: "Meet TheBenzzCreations, an independent digital studio in New Delhi building websites, apps, software and digital experiences for businesses worldwide." },
  { path: "/contact", key: "contact", title: "Contact Our Digital Studio | TheBenzzCreations", description: "Contact TheBenzzCreations in New Delhi by email or telephone to discuss your website, app, software, design or automation project and next steps." },
  { path: "/terms", key: "terms", title: "Website Terms of Use | TheBenzzCreations", description: "Read the website terms for TheBenzzCreations, including portfolio information, external links, project enquiries and how individual proposals define project scope." },
];

export const publicPages = [
  ...informationPages,
  ...corePages,
  ...services.map((service) => ({
    path: `/services/${service.slug}`,
    key: service.slug,
    title: service.title,
    description: service.description,
  })),
  ...projects.map((project) => ({
    path: `/work/${project.slug}`,
    key: project.slug,
    title: project.title,
    description: project.description,
  })),
];
