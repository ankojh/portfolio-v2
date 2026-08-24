export const profile = {
  name: "Ankit Ojha",
  designation: "Product Manager · Applied AI · Full-Stack Engineer",
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
    body: "I pair product judgment with 8+ years of hands-on engineering to take ambitious ideas from discovery through launch and iteration.",
  },
  {
    id: "positioning",
    eyebrow: "How I work",
    title: "From ambiguity to launch",
    subtitle: "Discovery · Strategy · Shipping",
    body: "I find the real user problem, set a practical direction, align the team, and stay close to execution until the product is in users' hands.",
  },
  {
    id: "startup-ownership",
    eyebrow: "Early-stage experience",
    title: "0-to-1 at Pulley",
    subtitle: "Communications · Valuations · Offer Letters",
    body: "As an early engineer, I worked with product and design from first scope through launch—shipping products used for 1,800+ valuations and thousands of offer letters.",
  },
  {
    id: "operations",
    eyebrow: "Past experience",
    title: "Mochi Health · 2024–2026",
    subtitle: "Clinical Operations · Provider Workflows · Analytics",
    body: "I led engineering and contributed to product discovery for workflows used by nearly 1,000 providers supporting care for 200K+ patients.",
  },
  {
    id: "skills",
    eyebrow: "Where I thrive",
    title: "Comfortable with ambiguity",
    subtitle: "Ownership · Speed · Cross-functional",
    body: "I am comfortable with imperfect information, shifting priorities, customer feedback, and the hands-on work required to turn an early product into a dependable one.",
  },
];
