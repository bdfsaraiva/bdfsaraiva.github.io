import type { Localized } from '../i18n/ui';

export type NavKey = 'home' | 'publications' | 'work' | 'teaching';

export interface LinkItem {
  label: Localized;
  url: string;
}

export interface Profile {
  name: string;
  role: Localized;
  affiliation: Localized;
  bio: Localized[];
  email?: { user: string; domain: string };
  photo?: string;
  links: {
    scholar?: string;
    orcid?: string;
    github?: string;
    linkedin?: string;
    institutional?: string;
  };
  interests: Localized[];
  featured?: { title: string; meta: Localized; url?: string; path?: string }[];
}

export type PubType = 'journal' | 'conference' | 'software' | 'preprint' | 'chapter' | 'book' | 'report' | 'other';

export interface PubAuthor {
  name: string;
  me: boolean;
}

export interface Publication {
  id: string;
  title: string;
  year: number;
  date?: string;
  type: PubType;
  venue?: string;
  authors: PubAuthor[];
  doi?: string;
  links: Partial<Record<'doi' | 'pdf' | 'preprint' | 'code' | 'slides' | 'data' | 'url', string>>;
  citations: number;
  abstract?: string;
  bibtex?: string;
  /** Short qualifier set by hand, e.g. "Extended abstract". */
  note?: Localized;
  /** Distinction set by hand, e.g. "Best Poster Award". */
  award?: Localized;
}

export interface PublicationsData {
  updatedAt: string | null;
  items: Publication[];
}

export interface SoftwareItem {
  id: string;
  name: string;
  tagline: Localized;
  description: Localized;
  repo?: string;
  tags?: string[];
  links?: LinkItem[];
}

export interface ProjectItem {
  id: string;
  name: string;
  fullName?: Localized;
  role: Localized;
  period: string;
  funder?: Localized;
  description: Localized;
  links?: LinkItem[];
}

export interface ServiceItem {
  year: number;
  role: Localized;
  event: Localized;
  place?: Localized;
  url?: string;
}

export interface Projects {
  software: SoftwareItem[];
  projects: ProjectItem[];
  service: ServiceItem[];
}

export type CourseLevel = 'bsc' | 'msc' | 'postgrad';

export interface Course {
  id: string;
  name: Localized;
  institution: string;
  level: CourseLevel;
  /** Programme names or acronyms, e.g. ["LEI", "LIG"]. */
  programmes?: string[];
  /** First year taught. */
  from: number;
  /** Last year taught; omit while still teaching it (the course is then shown as current). */
  to?: number;
  role?: Localized;
  /** URL of the course syllabus; without it the button is shown as "available soon". */
  syllabus?: string;
}

export interface Hobbies {
  intro: Localized;
  football: {
    position: Localized;
    text: Localized;
    profileUrl?: string;
    /** Senior official matches and how many of them were Taça de Portugal (cup) games. */
    stats?: { games: number; cupGames: number };
    /** Which division the league matches were played in. */
    league?: Localized;
    /** Senior seasons, oldest first. */
    seasons: { season: string; club: string }[];
    /** Youth clubs, oldest first. */
    youth?: string[];
  };
  cycling: { text: Localized; photo?: string };
  padel: {
    text: Localized;
    /** Year started playing. */
    since?: number;
    /** Clubs represented in the Liga de Clubes, oldest first; `current` marks the present club. */
    leagueClubs?: { name: string; current?: boolean }[];
    photo?: string;
  };
}

export interface RepoStats {
  stars: number;
  language: string | null;
  pushedAt: string | null;
  url: string;
}

export interface GithubData {
  updatedAt: string | null;
  repos: Record<string, RepoStats>;
}

export interface StravaTotals {
  count: number;
  distanceKm: number;
  elevationM: number;
  movingHours: number;
}

export interface StravaData {
  updatedAt: string | null;
  stats: null | {
    year: number;
    ytd: StravaTotals;
    all: StravaTotals;
    longestRideKm: number;
    biggestClimbM: number;
  };
}
