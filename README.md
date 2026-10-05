# GIH — Galaxy In Hands

GIH is a live sky app for **iPhone and Android**. Open the camera, point it at the sky, and the app overlays stars, constellations, the Sun, Moon, planets, Earth satellites, and black-hole coordinates on what you are looking at.

Positions are calculated on the phone from your GPS and the current time. No paid API is required.

## Features

- **Live camera sky** — objects stay aligned to azimuth, elevation, and phone tilt
- **Constellation stick figures** that move with the real sky (Orion, Ursa Major, Cassiopeia, Cygnus, Scorpius, and more)
- **Solar system** — Sun, Moon, and planets with magnitude, distance, illumination, and rise/set
- **Satellites / ISS** from [CelesTrak](https://celestrak.org) TLE files and SGP4
- **Named stars** and famous **black holes** (Sagittarius A\*, M87\*, Cygnus X-1, Gaia BH1, …)
- **Object details** with Wikipedia / NASA photos, coordinates, and source links
- **Tonight briefing** — sunrise/sunset, what’s above you, ISS pass, NASA Astronomy Picture of the Day
- Compass calibration using the Sun or Moon

Black holes are not naked-eye objects. The marker is their true direction in the sky, the same way a star catalog works.

## Screens

| Tab | What it does |
| --- | --- |
| Sky | Camera overlay, constellation lines, tap any object |
| Catalog | Searchable live list, sorted by elevation |
| Tonight | Sky briefing for your location |
| Setup | Layers, magnitude limit, compass offset, TLE refresh |

## Run locally

You need [Node.js](https://nodejs.org/) 20+ and [Expo Go](https://expo.dev/go) on a **physical phone**. Camera and compass do not work well in a simulator.

```bash
git clone https://github.com/anuragcs/GIH.git
cd GIH
npm install
npm start
```

Scan the QR code with Expo Go (Android) or the iPhone Camera app. Allow **camera**, **location**, and **motion**.

1. Hold the phone up like a viewfinder.
2. Pan across the sky. Markers lock to where the object actually is.
3. Tap a star, planet, satellite, constellation name, or black hole for photos and details.
4. If the compass is off, open **Setup**, point at the Sun or Moon, and tap calibrate.

Phone and computer must be on the same Wi‑Fi. If the app stays on loading, start with a tunnel:

```bash
npx expo start --tunnel --clear
```

## How positions are computed

| Layer | Data | Method |
| --- | --- | --- |
| Sun, Moon, planets | Bundled [astronomy-engine](https://github.com/cosinekitty/astronomy) | Live azimuth / elevation from GPS + clock |
| Stars | Built-in named-star catalog | Apparent sky position from your location and time |
| Constellations | Stick-figure lines between catalog stars | Same live star positions, drawn on the camera |
| Black holes | Fixed J2000 coordinates | Projected like stars |
| Satellites / ISS | [CelesTrak](https://celestrak.org) TLE + [satellite.js](https://github.com/shashwatak/satellite-js) SGP4 | Look angles, altitude, range, subpoint, speed (cached 6 hours) |
| Photos | Wikipedia / Wikimedia, then [NASA Images](https://images.nasa.gov) | Loaded when you open an object |

## API tokens

**None required.**

| Token | Needed? | Used for |
| --- | --- | --- |
| CelesTrak TLE | No signup | Free orbit files |
| NASA API key | Optional | Picture of the Day on Tonight. Free at [api.nasa.gov](https://api.nasa.gov). Leave blank to use NASA `DEMO_KEY` (rate-limited) |

You do not need N2YO, AstronomyAPI, API-Ninjas, or Aviation Edge. GIH already computes look angles locally.

First launch needs the internet once to download satellite orbits. Stars, planets, constellations, and black holes still work offline after that. Refresh TLEs every few hours for the best ISS accuracy.

## Permissions

- **Camera** — live overlay
- **Location** — horizon math from where you are standing
- **Motion / magnetometer** — heading, pitch, and roll

## Project layout

```
GIH/
  app.json                 Expo app config and permission copy
  package.json             Dependencies and scripts
  src/app/(tabs)/          Sky, Catalog, Tonight, Setup
  src/app/object/          Object detail + photos
  src/components/          Camera HUD, overlays, constellation lines
  src/context/             Live sky catalog
  src/data/                Stars, constellations, black holes
  src/hooks/               Smoothed compass / tilt
  src/services/            Astronomy, SGP4, Wikipedia/NASA, projection
  assets/                  App icons
```

## Scripts

```bash
npm start          # Expo dev server
npm run ios        # Open iOS
npm run android    # Open Android
npm run typecheck  # TypeScript
npm run lint       # Lint
```

Store builds later:

```bash
npx eas-cli build
```

## Accuracy

- Phone camera field of view is estimated (~62°). Ultra-wide lenses will not match perfectly.
- Magnetometers drift near cars, speakers, and metal. Use Sun/Moon calibration.
- TLE + SGP4 is typically a few kilometres for ISS-class objects — a fraction of a degree from the ground.
- Star positions use J2000 coordinates, which is enough for a phone overlay.

## License

See [LICENSE](LICENSE).

---

Built by [Anurag Gupta](https://github.com/anuragcs).
