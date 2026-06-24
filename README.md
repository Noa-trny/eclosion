# ÉCLOSION

**La naissance d'un monde** — une expérience web 3D cinématique où le défilement est le temps.
Du néant à l'aube : une graine germe, une forêt s'éveille sous les lucioles, l'orage éclate, la
caméra plonge dans un océan bioluminescent, émerge au pied d'un volcan, et la cendre laisse
place à la floraison puis au premier lever de soleil.

**100 % procédural** : aucun modèle, aucune texture, aucun fichier audio. Géométrie, matériaux
(bruit/FBM en GLSL), particules et musique (synthèse WebAudio) sont générés par le code.

## Démarrer

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de production
pnpm lint       # eslint (no-explicit-any en erreur)
pnpm typecheck  # tsc strict
```

## Contrôles

| Entrée | Action |
|---|---|
| Molette / tactile / flèches / espace | Avancer dans le récit (le scroll est la timeline) |
| Points à droite | Aller directement à un acte |
| `F` | Basculer exploration libre ↔ récit (retour exact à la progression) |
| ZQSD / WASD + souris (exploration) | Se déplacer / regarder — `Maj` sprint, `Espace` monter, `C` descendre |
| `M` | Couper / activer le son |
| `` ` `` | Éditeur de scène temps réel (leva) |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Three.js + React Three Fiber 9 + drei ·
GSAP 3 + ScrollTrigger (100 % gratuit depuis 2025) · Lenis · zustand 5 · motion (framer-motion) ·
@react-three/postprocessing · leva · Tailwind CSS 4.

## Architecture & choix techniques

### Le contrat de scroll (le cœur du système)

```
wheel/touch → Lenis (lerp 0.09 — le SEUL lissage) → scrollTop
  → gsap.ticker pilote lenis.raf ; lenis "scroll" → ScrollTrigger.update()
  → un ScrollTrigger maître (scrub: true) scrub la timeline GSAP (durée 1 = progress)
      ├─ les tweens mutent uniformProxies (objets plains) + uniforms des matériaux
      └─ onUpdate → écriture transiente dans progressStore
  → R3F lit getState()/uniformProxies dans useFrame  → zéro render React à 60 fps
  → le texte DOM lit UN MotionValue miroir           → styles hors React
  → React ne re-render QUE sur changement d'acte (mount/unmount de scène + aria)
```

Règles issues de ce contrat : jamais de `scrub` numérique avec Lenis (double lissage), jamais de
pinning (canvas fixe + spacer `9 × 100dvh`), timeline maîtresse linéaire (eases uniquement sur
les tweens feuilles), `lagSmoothing(0)`.

### Décisions structurantes

- **WebGL2 + GLSL, pas WebGPURenderer** : l'exigence de shaders GLSL custom est incompatible
  avec TSL/WGSL. La perte du compute est compensée par des particules *stateless* : chaque
  comportement (pluie, lucioles en curl-noise, braises, dérive, scintillement) est une fonction
  fermée de `(seed, uTime)` évaluée en vertex shader — pas de ping-pong FBO, rien à reprendre
  après une perte de contexte. Les buffers sont alloués au tier max ; changer de qualité ne fait
  que déplacer `setDrawRange` (≈100k particules au tier haut, 40k medium, 12k low).
- **Pas de Theatre.js** : la timeline GSAP est le séquenceur, leva l'inspecteur. Les points de
  la caméra (CatmullRom centripète, échantillonnée par longueur d'arc + courbe lookAt séparée +
  piste de FOV) sont éditables en live et exportables (« copier les points »).
- **Un seul sol analytique** : `groundHeight(x, z)` (FBM + bassin océanique + cône volcanique)
  génère l'unique mesh de terrain, contraint la marche en exploration libre, fait rebondir les
  props physiques et borne les boids — ce qu'on voit est exactement ce qu'on touche.
- **Free-roam sans resynchronisation** : entrer en exploration fige Lenis, donc le scrollTop et
  la progression p0 restent exacts. La météo passe `timeline → sim` (chaîne de Markov + cycle
  jour/nuit ~6 min) en écrivant *les mêmes* uniformProxies — un seul chemin d'écriture, aucun
  conflit car la timeline gelée n'écrit plus. Le retour tween la caméra (slerp 1.4 s) pendant
  que les proxies crossfadent vers le snapshot gelé.
- **Audio 100 % synthétisé** : bruit filtré (vent/pluie/océan/grondement), pads à oscillateurs
  désaccordés (un accord par acte), oiseaux en FM, tonnerre retardé par la distance. 8 bus
  d'acte en crossfade equal-power sur la progression ; les racks sources ne tournent que pour
  les actes audibles. Spatialisation HRTF (pool de PannerNodes) + listener synchronisé caméra.
  Contexte créé dans le geste utilisateur (politique autoplay iOS).
- **Qualité adaptative sans réseau** : tiering GPU par heuristique locale (pas de fetch de
  benchmarks), puis `PerformanceMonitor` qui descend DPR → tier avec un plancher (le Low Power
  Mode iOS ne peut pas provoquer de spirale).
- **Post par tier** : Bloom (HalfFloat), DOF et GodRays (lune/soleil) au tier haut, aberration
  chromatique, grain custom, *speed blur* radial piloté par la vélocité de scroll, color grade
  timeline (température/saturation/underwater), ondulation de plongée (distorsion `mainUv`).
- **IA comportementale** : boids CPU (grille de hachage spatiale, 140–240 agents) rendus en
  InstancedMesh — poissons (ondulation de queue en vertex shader) et oiseaux (battement d'ailes) ;
  lucioles en curl-noise GPU. Physique légère maison (Euler semi-implicite + collision
  heightfield + sommeil) pour les capsules de graines.

### Accessibilité & dégradation

- Sans WebGL 2 → redirection vers `/fallback` : le récit complet en HTML/SVG pur (composant
  serveur, fonctionne sans JavaScript).
- `prefers-reduced-motion` → scroll natif (pas de Lenis), particules à ~4 %, ni shake ni
  parallax, son coupé par défaut.
- Annonces `aria-live` à chaque acte, parcours entièrement praticable au clavier.

## Arborescence

```
src/
  app/            pages (+ /fallback accessible)
  components/
    canvas/       Canvas, SceneManager (actes lazy + hystérésis), CameraRig, free-roam, qualité
    3d/scenes/    void · seed · forest · storm · ocean · volcano · bloom · dawn
    3d/materials/ factories ShaderMaterial (eau Gerstner, lave, terrain, ciel, fumée, nuages…)
    3d/shaders/   chunks GLSL (simplex/FBM, curl, gerstner, lighting) + shaders + particules
    dom/          overlay narratif, HUD, écran d'entrée, annonces aria
    editor/       leva + persistance localStorage (la couture anti-leva : bindings.ts)
  timelines/      timeline maîtresse + 8 builders d'acte + chemin caméra + uniformProxies
  audio/          moteur WebAudio, bus, synthèse, spatialisation, scheduler
  lib/            particules GPU, boids, physique, météo/jour-nuit, machine de mode, WebGL
  stores/         progress (transient) · app · quality · weather (zustand 5)
  config/         actes, palettes, monde, particules, audio, qualité, contrôles
  utils/          math, PRNG seedé, bruit CPU, sol analytique, générateurs de géométrie
```
