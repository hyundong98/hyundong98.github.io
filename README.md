# Hyundong Jin — Personal Academic Website

This repository contains the source code for my personal academic website, built with [Astro](https://astro.build/) and deployed with GitHub Pages.

## Website

Visit the site here:

https://hyundong98.github.io/

## Tech Stack

- Astro
- HTML / CSS / TypeScript
- GitHub Pages
- GitHub Actions

## Local Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The site is deployed to GitHub Pages using GitHub Actions.

When changes are pushed to the `main` branch, the site is automatically built and deployed.

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .vscode/
├── public/
│   ├── icons/
│   ├── images/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── data/
│   │   ├── cv.json
│   │   ├── examples.bib
│   │   ├── news.json
│   │   ├── profile.json
│   │   ├── publications.bib
│   │   ├── researchInterests.json
│   │   └── venueAliases.json
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── cv.astro
│   │   ├── index.astro
│   │   └── publications.astro
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       ├── bibtex.ts
│       ├── git.ts
│       ├── news.ts
│       └── publications.ts
├── .gitignore
├── astro.config.mjs
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Notes

This website includes information about my research, CV, publications, and projects.