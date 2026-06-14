export const profile = {
  name: "Ankit Ojha",
  designation: "AI Product Engineer",
  photoUrl: "/pp.png",
  // Override at build time with VITE_RESUME_URL if the resume is hosted elsewhere.
  resumeUrl: import.meta.env.VITE_RESUME_URL || "/resume.pdf",
  socials: {
    github: "https://github.com/ankojh",
    linkedin: "https://www.linkedin.com/in/ankojh",
    x: "https://x.com/ankojh",
    email: "ankitkumarojha2@gmail.com",
  },
};

export type IntroCard = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  body: string;
  // Only the hero card renders the photo.
  variant?: "hero" | "default";
};

export const introCards: IntroCard[] = [
  {
    id: "hero",
    variant: "hero",
    eyebrow: "Hello, I'm",
    title: profile.name,
    subtitle: profile.designation,
    body: "8+ years building full-stack product systems across startups, healthcare operations, equity workflows, internal platforms, and applied AI.",
  },
  {
    id: "positioning",
    eyebrow: "What I do",
    title: "Product-minded engineer",
    subtitle: "Full-Stack · Product Engineering · Applied AI",
    body: "I am strongest where product judgment matters: turning ambiguous workflows into reliable systems that real teams can use every day.",
  },
  {
    id: "startup-ownership",
    eyebrow: "Startup experience",
    title: "Early engineer at Pulley",
    subtitle: "Valuations · Offer Letters · Workflows",
    body: "At Pulley, I worked in an early-stage environment and led product work across valuations, communications, and the Offer Letter Builder.",
  },
  {
    id: "operations",
    eyebrow: "Operational systems",
    title: "Clinical Operations at Mochi Health",
    subtitle: "Provider Onboarding · Insurance · Scheduling",
    body: "At Mochi Health, I owned internal tools for provider workflows, credentialing, dashboards, and operational accuracy.",
  },
  {
    id: "skills",
    eyebrow: "Work style",
    title: "Reliable teammate",
    subtitle: "Collaboration · Communication · Team Fit",
    body: "I communicate clearly, collaborate closely with product, design, operations, and engineering, and try to be the kind of teammate people enjoy working with.",
  },
];
