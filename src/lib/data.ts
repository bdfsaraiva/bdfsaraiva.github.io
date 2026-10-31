import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

import profileRaw from '../data/profile.yaml?raw';
import projectsRaw from '../data/projects.yaml?raw';
import coursesRaw from '../data/courses.yaml?raw';
import hobbiesRaw from '../data/hobbies.yaml?raw';
import publicationsJson from '../data/generated/publications.json';
import githubJson from '../data/generated/github.json';
import stravaJson from '../data/generated/strava.json';

import type {
  Course,
  GithubData,
  Hobbies,
  Profile,
  Projects,
  Publication,
  PublicationsData,
  StravaData,
} from './types';

export const profile = parse(profileRaw) as Profile;
export const hobbies = parse(hobbiesRaw) as Hobbies;

const parsedProjects = (parse(projectsRaw) ?? {}) as Partial<Projects>;
export const projects: Projects = {
  software: parsedProjects.software ?? [],
  projects: parsedProjects.projects ?? [],
  service: (parsedProjects.service ?? []).toSorted((a, b) => b.year - a.year),
};

export const publications: PublicationsData = {
  updatedAt: (publicationsJson as Partial<PublicationsData>).updatedAt ?? null,
  items: (publicationsJson as Partial<PublicationsData>).items ?? [],
};
export const github: GithubData = {
  updatedAt: (githubJson as Partial<GithubData>).updatedAt ?? null,
  repos: (githubJson as Partial<GithubData>).repos ?? {},
};
export const strava = stravaJson as StravaData;

/** A course without an end year is still being taught. */
export const isCurrentCourse = (course: Course) => course.to == null;

/** Current courses first (newest first), then past ones by the year they ended. */
export const courses = ((parse(coursesRaw) as Course[] | null) ?? []).toSorted(
  (a, b) => (b.to ?? Infinity) - (a.to ?? Infinity) || b.from - a.from,
);

/** True when `public/<path>` exists at build time (e.g. the CV or a photo). */
export function publicFileExists(path: string | undefined): boolean {
  if (!path) return false;
  return existsSync(join(process.cwd(), 'public', path.replace(/^\/+/, '')));
}

export function groupByYear(items: Publication[]): [number, Publication[]][] {
  const groups = new Map<number, Publication[]>();
  for (const item of items) {
    const list = groups.get(item.year) ?? [];
    list.push(item);
    groups.set(item.year, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b - a);
}
