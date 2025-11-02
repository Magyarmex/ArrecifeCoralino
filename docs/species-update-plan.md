# Species & NPC Ecosystem Vision

## Overview
This document captures the long-term design vision for the "Full Species and Fish" update of **Arrecife Coralino**. It describes the systemic goals behind the feature set, the user experience we want to deliver, and the guiding rules that every implementation task must respect. It is intentionally future-facing: it documents what the simulation should ultimately feel like, not just what is currently available in the codebase.

## Guiding Principles
1. **Living reef narrative** – Every organism behaves like an autonomous inhabitant with individual history, needs, and relationships. The simulation should feel alive whether the player is idling, exploring, or actively interacting with the environment.
2. **Game-ified realism** – Mechanics draw inspiration from real reef ecology, but they are tuned for clarity, discoverability, and fun. Every abstraction must be readable to players through UI feedback and visible reactions inside the scene.
3. **Transparent systems** – Players can inspect any individual to understand its hunger, energy, age stage, memories, and intentions. Debug tooling mirrors this transparency so designers can reason about balancing changes quickly.
4. **Scalable simulation** – The ecosystem must gracefully support dozens (or hundreds) of unique organisms while keeping performance predictable. Shared registries, deterministic tick updates, and data-oriented layouts are required foundations.

## Ecosystem Pillars
### Individual Identity
- Each organism owns immutable identity data (species, birth seed, sex) and mutable life-state data (caloric mass, fat reserves, stage, hunger, energy, pregnancy).
- Lifecycle stages are derived from age progression over the species lifespan: Baby (0–25%), Juvenile (25–50%), Adult (50–100%), Elderly (>100%).
- Size is computed from caloric mass and density. Visual scaling, UI weight readouts, and nutritional transfer all originate from this single source of truth.

### Metabolic Simulation
- Hunger represents remaining time before starvation (~1 in-game day buffer per species). Daily caloric requirements scale with body size and pregnancy modifiers.
- Energy governs wakefulness. Motile organisms require sleep windows (diurnal/nocturnal) that reset the bar and temporarily reduce hunger drain.
- Excess calories overflow into fat reserves. Reserves increase mass, slow individuals, and are consumed first when food is scarce.
- Nutrients (C, N, P, S, etc.) are tracked per kilocalorie by species. Predator-prey transfers move both calories and nutrients proportionally.

### Behaviour Layer
- Sessile species (coral, kelp-like algae, ball algae) continuously feed, grow, and broadcast spawn while respecting spatial constraints (depth, substrate, light/plankton access).
- Motile species run asynchronous behaviour trees with shared primitives: **Wander**, **Find Food**, **Hunt**, **Flee**, **Find Mate**, **Sleep**. Perception combines vision cones, omnidirectional awareness, and short-lived memory caches.
- Task priorities react to needs: hunger overrides reproduction, fear overrides everything. Tasks expose debug traces so we can profile reasoning per tick.

### Reproduction & Population Dynamics
- Broadcast spawners (coral, algae, jellyfish) deposit egg clouds into water tiles. Eggs track age, species, and counts until hatching.
- Internal fertilizers (fish, turtles, sharks, lobsters, starfish) pair adults, apply caloric costs, and respect gestation durations (⅛ lifespan to carry, additional ⅛ to hatch).
- Newborns spawn with baseline caloric content and minimal nutrient stores, scaling as they feed.

### Habitat & Resources
- Water tiles expose dissolved mineral readouts, plankton density, and egg cloud summaries through the tile info UI.
- Plankton blooms replenish daily, migrate locally when depleted, and tint shallow water visually.
- Organisms derive calories according to diet: plankton feeders tap tile pools, herbivores nibble plant calories, predators absorb entire prey caloric state.

## Featured Species Archetypes
| Species | Role | Diet | Predators | Reproduction | Egg Count | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Ball Coral | Sessile cnidarian | Plankton | Starfish | Broadcast spawn | 5–40 polyps per event | Color fades with depth; competes locally for plankton. |
| Kelp-like Algae | Vertical algae | Sunlight | Turtles | Vegetative spread | 10–25 spores | Occupies exterior shelf (y = 15–19). |
| Ball Algae | Spherical algae | Sunlight | Starfish | Broadcast spores | 40–120 spores | Slower radial growth than kelp strands. |
| Jellyfish | Motile drifter | Plankton | Turtles | Broadcast eggs | 10,000 | Slow swimmers; translucent pink bells. |
| Sea Turtle | Mid-tier omnivore | Kelp, jellyfish | Sharks | Internal eggs | 120 | Flattened sphere shell w/ limbs. |
| Starfish | Benthic predator | Coral, ball algae | Lobsters, parrotfish | Broadcast eggs | 500 | Terrain-bound crawler; uses smell only. |
| Lobster | Benthic omnivore | Starfish, plankton | Sharks | Internal eggs | 50 | Can dash backwards when fleeing. |
| Parrotfish | Reef swimmer | Starfish | Sharks | Internal eggs | 10 | Turquoise gradient body. |
| Reef Shark | Apex predator | Turtles, lobsters, parrotfish | Larger sharks | Internal eggs | 3 | Triple-speed sprint while hunting. |

## Debug & Telemetry Expectations
- Global species registry exposing validated blueprints, nutrient densities, and growth bands.
- Diagnostics logging for registration failures, missing metadata, or over-capacity populations.
- HUD overlays (player-facing) and console inspectors (dev-facing) that surface individual needs, recent decisions, and metabolic deltas.

## Future Implementation Milestones
1. **Data foundation** – Species registry, caloric ↔ mass ↔ size utilities, nutrient density tables, depth/location constraints, egg cloud modelling.
2. **Organism state machine** – Per-individual bars, lifecycle transitions, daily metabolism update loop, sleeping/wake logic.
3. **Behaviour trees** – Modular task graph with perception inputs and reason-debug strings.
4. **Rendering & visuals** – Model selection per species, depth-based coloration, sleeping/mating emoji overlays, egg cloud markers.
5. **UI integration** – Individual inspector panes, tile info additions (plankton, eggs, minerals), debug toggles for telemetry.
6. **Balancing pass** – Tune caloric needs, reproduction rates, predator-prey loops, and performance optimisations.

## Definition of Success
- Players can follow a single organism from birth to death, understanding every major decision through UI feedback and debug tools.
- Reef ecology remains stable but reactive: population booms trigger resource pressure, predators chase real prey, and end-of-life attrition feels natural.
- Developers can extend the ecosystem quickly thanks to documented registries, reusable behaviour primitives, and reliable diagnostics.

