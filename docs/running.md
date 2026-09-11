# Running and serving the app

How to install, develop, build and deploy the simulator. Every command and figure below
was verified on this project (Node v24.15.0, npm 11.12.1, Vite 6.4.3).

## Prerequisites

Vite 6 requires **Node 18 or newer**. Nothing else is needed — there is no backend, no
database and no environment file. The app is a fully static single-page build.

## Install dependencies

```bash
npm ci
```

`npm ci` installs exactly what `package-lock.json` pins, which is what you want for a
reproducible setup and in CI. Use `npm install` only when you intend to update versions.

## Development server

```bash
npm run dev
```

Serves at **http://localhost:5180**.

Two things differ from stock Vite here, both set in `vite.config.ts`:

- the port is pinned to `5180`, not Vite's default `5173`;
- `open: false`, so no browser is launched for you — open the URL yourself.

Edits under `src/` hot-reload without a full refresh.

## Type checking

The dev server transpiles TypeScript but does **not** type-check it, so type errors stay
invisible until you build. To check on demand:

```bash
npm run typecheck
```

## Production build

```bash
npm run build
```

Runs `tsc -b && vite build`, so type errors fail the build before Vite runs. Output goes
to `dist/`. A clean build currently produces:

| File | Size | Gzipped |
| --- | --- | --- |
| `index.html` | 1.07 kB | 0.56 kB |
| `assets/index-*.css` | 14.43 kB | 3.93 kB |
| `assets/index-*.js` | 257.66 kB | 80.00 kB |

## Preview the production build

```bash
npm run preview
```

Serves the built `dist/` at **http://localhost:4173** — Vite's preview default, since the
script passes no port of its own. To choose a port, note the extra `--` that forwards the
flag past npm to Vite:

```bash
npm run preview -- --port 5181
```

Preview serves the real build output, so it is the right way to confirm a change survives
minification and the production React build.

## Serving `dist/` anywhere

`vite.config.ts` sets `base: './'`, so the build emits **relative** asset URLs. This is
the detail worth knowing: `dist/` is portable to any subdirectory of any domain with no
rebuild and no config change — a subpath like `/tools/scale/` works as-is.

Any static file server will do:

```bash
npx serve dist
```

**Do not open `dist/index.html` by double-clicking it.** The entry point is a
`<script type="module">`, and browsers refuse to load ES modules over `file://` because of
CORS — you get a blank page with a console error. It must be served over HTTP.

## Reaching it from another device

```bash
npm run dev -- --host
```

Vite then prints a `Network:` URL usable from a phone or another machine on the same LAN.
The same flag works with `npm run preview`.

## Deploying to GitHub Pages

Because `base` is already `'./'`, the build works unchanged at a project-pages subpath
such as `https://svi-ra.github.io/beam-scale-simulator/`. The usual `base: '/repo-name/'`
edit that this normally requires is **not** needed here.

A deploy workflow only has to run `npm ci && npm run build` and publish `dist/`.

## Editor / Claude Code preview

`.claude/launch.json` defines two named servers so the in-app browser can start them
directly:

| Name | Command | Port |
| --- | --- | --- |
| `beam-scale` | `npm run dev` | 5180 |
| `beam-scale-preview` | `npm run preview -- --port 5181` | 5181 |

## Troubleshooting

**The printed port is not the one you expected.** If the port is taken, Vite silently
moves to the next free one — read the URL it prints. Add `--strictPort` to fail loudly
instead.

**The build output looks stale.** `tsc -b` caches its state in `tsconfig.tsbuildinfo`
(git-ignored). Delete that file and `dist/`, then rebuild.

**The typography looks wrong.** `index.html` loads Carrois Gothic SC, Inter, IBM Plex Mono
and Roboto Condensed from Google Fonts, so the intended lettering needs network access.
Offline, the app falls back to system faces and the beam graduations lose their character.
