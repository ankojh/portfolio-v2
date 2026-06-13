// Placeholder profile content for the intro card stack. Replace the copy here
// (and public/profile-placeholder.svg / public/resume.pdf) with real content.

export const profile = {
  name: "Ankit Ojha",
  designation: "Software Engineer",
  photoUrl: "/profile-placeholder.svg",
  // Override at build time with VITE_RESUME_URL if the resume is hosted elsewhere.
  resumeUrl: import.meta.env.VITE_RESUME_URL || "/resume.pdf",
  socials: {
    github: "https://github.com/ankojh",
    // Placeholder handles — swap in the real profile URLs.
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
    body: "Placeholder intro — a one-line hook about who you are and what you build. Tap the card to keep going.",
  },
  {
    id: "about",
    eyebrow: "About",
    title: "What I do",
    body: "Placeholder summary — a couple of sentences on your focus areas, the kind of problems you enjoy, and the value you bring to a team.",
  },
  {
    id: "experience-1",
    eyebrow: "Experience",
    title: "Senior Engineer · Company",
    subtitle: "2022 — Present",
    body: "Placeholder experience — what you owned, the impact you had, and a metric or two. Swap in a real role and highlights.",
  },
  {
    id: "experience-2",
    eyebrow: "Experience",
    title: "Engineer · Previous Company",
    subtitle: "2019 — 2022",
    body: "Placeholder experience — a second role with a notable project, the stack you used, and the outcome you drove.",
  },
  {
    id: "skills",
    eyebrow: "Toolbox",
    title: "How I build",
    subtitle: "TypeScript · React · Python · Postgres",
    body: "Placeholder skills — your core stack and strengths. Next up: ask me anything about my work in the chat.",
  },
];
