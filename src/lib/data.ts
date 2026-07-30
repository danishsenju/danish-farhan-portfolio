export const EMAIL = 'danishfarhan.dev@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/danish-farhan-zailan/';
export const GITHUB = 'https://github.com/danishsenju';

export type Project = {
  index: string;
  title: string;
  year: string;
  category: string;
  award?: string;
  description: string;
  stack: string[];
  url: string;
  image: string;
  imageFit?: 'cover' | 'contain';
};

export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'TransitMY',
    year: '2026',
    category: 'Public transport tracker',
    award: '1st place — Kracked Dev Hackathon',
    description:
      'A login-free PWA that folds 4+ Malaysian transit networks into one live map — no sign-up, the link is the app. It decodes the government’s raw GTFS-Realtime protobuf feeds into real vehicle positions, and a 15-second cache with stale-data fallback keeps it usable even when the official feed goes down.',
    stack: [
      'Next.js',
      'TypeScript',
      'GTFS-Realtime',
      'PostGIS',
      'Leaflet',
      'Cloudflare',
    ],
    url: 'https://transitmy.danishsenju11.workers.dev/',
    image: '/images/transitmy.jpg',
    imageFit: 'contain',
  },
  {
    index: '02',
    title: 'KolekDuit',
    year: '2026',
    category: 'Split-bill & payments',
    award: '1st place — Kracked Dev Bounty',
    description:
      'A split-bill PWA where every member gets a personal payment link — no account needed — and their payment claims land on the organiser’s dashboard in real time for one-tap approval. Gemini 2.0 Flash scans receipts into itemised bills behind a 4-model fallback, so the AI never blinks on stage.',
    stack: [
      'Next.js',
      'TypeScript',
      'Supabase Realtime',
      'Gemini 2.0 Flash',
      'Tailwind CSS',
    ],
    url: 'https://kolekduit.vercel.app',
    image: '/images/kolekduit.jpg',
    imageFit: 'contain',
  },
  {
    index: '03',
    title: 'Kaklimah Chess',
    year: '2026',
    category: 'Browser game',
    award: '1st place — Kracked Dev Hackathon',
    description:
      'An original chess-inspired browser game built from scratch in a weekend — AI-driven gameplay, combat mechanics, and real-time audio-visual feedback, all wrapped in Malaysian culture. It beat every other team.',
    stack: ['React', 'Vite', 'GSAP', 'PWA'],
    url: 'https://kaklimahchess.vercel.app/',
    image: '/images/kaklimah-chess.png',
    imageFit: 'contain',
  },
  {
    index: '04',
    title: 'LamanTroka',
    year: '2026',
    category: 'Booking platform',
    award: '1st place — Bounty by Kracked Dev',
    description:
      'An end-to-end wedding hall booking platform with real-time availability that kills scheduling conflicts before they happen. A custom luxury UI system, designed and shipped under a deadline that didn’t care.',
    stack: ['Next.js 14', 'TypeScript', 'Supabase', 'Motion', 'Tailwind CSS'],
    url: 'https://lamantroka.vercel.app/',
    image: '/images/lamantroka.png',
    imageFit: 'contain',
  },
];

export type Role = {
  period: string;
  role: string;
  company: string;
  place: string;
  points: string[];
};

export const ROLES: Role[] = [
  {
    period: 'Aug — Nov 2025',
    role: 'Assistant Operations Engineer',
    company: 'Sophic Automation Sdn Bhd',
    place: 'Bukit Mertajam',
    points: [
      'Processed delivery orders end-to-end in enterprise systems (Milion, eBOM) — invoices, purchase orders, quotations, and the paperwork nobody wants to own.',
      'Handled purchase requests and built bills of materials for procurement workflows.',
      'Ran a historical data reconciliation project, rebuilding 2021–2024 order records the current ERP never carried over.',
    ],
  },
  {
    period: 'Feb — Jul 2025',
    role: 'Web Developer Intern',
    company: 'SAB System Sdn Bhd',
    place: 'Shah Alam',
    points: [
      'Contributed to two live Malaysian government systems — SMPP (prison management) and MMDIS (maritime documentation) — in active public-sector operation.',
      'Built digital form modules for SMPP: inmate documentation (PBSL 1–3), committee recommendation forms, and director-level approval workflows.',
      'Developed certificate management for MMDIS — Certificate of Registry, Wreck Certificate, and pollution liability certificates, validation included.',
      'Shipped to production across both systems through a structured GitLab and GitHub branching workflow (feature → staging → development).',
    ],
  },
];

export const CAPABILITIES: { label: string; items: string[] }[] = [
  {
    label: 'Design',
    items: [
      'UI/UX & interaction design',
      'Design systems & tokens',
      'Motion — easing, springs, restraint',
    ],
  },
  {
    label: 'Engineer',
    items: [
      'React, Next.js App Router',
      'TypeScript strict mode',
      'Laravel, AngularJS, Java',
    ],
  },
  {
    label: 'Ship',
    items: [
      'Supabase, PostgreSQL, Firebase',
      'RLS, SECURITY DEFINER, auth',
      'Vercel, Cloudflare, CI/CD, PWA',
    ],
  },
];
