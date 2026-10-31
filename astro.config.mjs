// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bdfsaraiva.github.io',
  trailingSlash: 'always',
  // Astro 7 defaults to JSX whitespace rules; keep HTML rules so inline elements keep their spaces.
  compressHTML: true,
  devToolbar: { enabled: false },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', pt: 'pt-PT' } },
    }),
  ],
});
