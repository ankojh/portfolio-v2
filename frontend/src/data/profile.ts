export const profile = {
  name: "Ankit Ojha",
  designation: "Product · Applied AI · Engineering",
  photoUrl: "/portrait.jpg",
  // Override at build time with VITE_RESUME_URL if the resume is hosted elsewhere.
  resumeUrl: import.meta.env.VITE_RESUME_URL || "/resume.pdf",
  socials: {
    github: "https://github.com/ankojh",
    linkedin: "https://www.linkedin.com/in/ankojh",
    x: "https://x.com/ankojh",
    email: "ankitkumarojha2@gmail.com",
  },
};
