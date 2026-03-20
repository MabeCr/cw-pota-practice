# CW POTA Practice
## Background Info - What is CW POTA Practice?
This application will help aspiring CW POTA activators learn to navigate pileups, logging, and the various obstacles that CW operators face in the field. While it is not an exact 1-to-1 representation of completing a CW POTA activation, the goal is to help get people comfortable enough and prove to themselves they have the skills that are necessary before heading out to their local park.

## Roadmap
Development of this project will happen in a few different stages:
1. Application UI Components Developed
2. Minimal AI Functionality Implemented
3. CW Functionality Integrated Into Chat Page
4. "Smarter" AI Logic Integrated

## Features
Features of the CW POTA Practice app include:
1. Logging QSOs - Callsign, RSTs, State (with error handling)
2. Configurable CW keying parameters
3. Simple AI logic to facilitate QSOs

## Stretch Goals
Stretch Goals for after the features listed above are completed:
- Pileups and AI logic to support them
- Frequencies tied to your location's propagation conditions
- Fading bands, QRM, and QRN
- POTA.app spot list integration
- AI spotting of the user, leading to more callers
- "Gamification"
  - Statistics for "Parks" you've activated
  - Badges for certain amount of contacts at one park, a certain number in a single session, or for collecting different amounts of states.
- Better UI

<br>

---
# Development Information
## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
