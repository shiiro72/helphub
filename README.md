# HelpHub

## Quick start

Install dependencies:

```bash
npm install
```

Run the Next.js app:

```bash
npm run dev
```

Open the app at [http://localhost:3000](http://localhost:3000).

Run Storybook:

```bash
npm run storybook
```

## Project structure

- `src/components` — reusable components
- `src/stories` — Storybook stories for components
- `public/locales` — Translation files (English and Romanian)

## Internationalization (i18n)

HelpHub supports English and Romanian.

### Features:
- **Language Switcher:** Users can change the interface language via the switcher in the navigation bar.
- **Auto-Translate:** Post content can be automatically translated using the MyMemory API.

### Configuration:
- Configuration is managed in `next-i18next.config.js`.
- Translation strings are located in `public/locales/{en,ro}/common.json`.
