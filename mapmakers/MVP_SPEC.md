# MAPMAKERS — SMALLEST POSSIBLE VERSION
## MVP Build Spec v1.0

**Design only. Nothing built yet.**

Spec written in English so it can be handed directly to Claude Code / Roblox Studio.

---

## THE ONE QUESTION THIS BUILD ANSWERS

> Does walking into fog and watching land resolve feel good for 15 straight minutes?

If yes → build the full game.
If no → kill it. Nothing else in the design survives a "no."

---

## TWO TIERS

### TIER 0 — "The Feeling Test" (weekend build, ~1–2 days)

The absolute minimum to answer the question above. **Not a game.**

**In:**
- 1 flat-ish island, 600 × 600 studs
- Reveal grid, 16-stud cells (37 × 37 = 1,369 cells)
- Haze visual covering unrevealed cells
- Player walks → cells within 48 studs reveal → soft chime
- A `%` counter in the corner

**Out:** everything else. No saving, no naming, no UI, no art pass, no other players.

**Done when:** 5 testers keep walking after being told they can stop.
**Test on the worst Android phone you can find.** If the Haze effect tanks the framerate there, the whole concept is dead — better to know now than in month six.

---

### TIER 1 — "Smallest Playable Game" (~2–3 weeks)

Only build this if Tier 0 passed.

## WORLD

| Item | Value |
|---|---|
| Island size | 1000 × 1000 studs |
| Reveal cell | 16 × 16 studs |
| Grid | 62 × 62 = 3,844 cells |
| Reveal radius | 48 studs (3 cells) |
| Walk speed | 16 (Roblox default, unchanged) |
| Time to fully chart | ~25–35 min (with terrain slowing straight lines) |
| Pin sites | 6 |
| Vantages | 2 |
| Guild Hut | 1, at spawn |

**Terrain shape matters more than terrain size.** A flat square gets lawnmowered in 7 minutes. Put in:
- 1 ridge running diagonally (blocks sightlines, forces route choice)
- 1 lake (can't cross — forces going around)
- 1 forest patch (slows visual reveal, feels different)
- 2 hills that are the vantages

## THE ONLY 3 SYSTEMS

### 1. Reveal
- Server holds truth: `bitfield[3844]`
- Every ~0.5s, server checks player position → marks cells in radius → fires to client
- **Server-authoritative.** Client never decides what's revealed.
- Client renders Haze as one overlay; hide cells that are revealed

### 2. Pins + Naming
- Walk within 30 studs of a pin site → prompt "Chart this place"
- Naming = pick 1 adjective + 1 noun from a fixed word bank
  - Adjectives (12): Silver, Hollow, Old, Quiet, Bright, Cold, Far, Grey, Long, Deep, Still, Wild
  - Nouns (12): Hollow, Ridge, Water, Stone, Reach, Fall, Bend, Pass, Rise, Mere, Crag, Wood
  - 144 combinations, all pre-reviewed, **zero free text**
- Name renders on a floating marker at the site, with the player's username
- 6 pins = 6 names per player

### 3. Save
- One `DataStore` key per player: `{ v=1, grid=<compressed bitfield>, pins={...} }`
- `UpdateAsync`, retry with backoff, save on `PlayerRemoving` + `BindToClose`
- Payload is ~500 bytes compressed. Not a problem.

## THE ATLAS (minimum UI)

One screen. One button to open it.
- Top-down render of the island showing only revealed cells
- The 6 pin names listed with who named them
- `X% charted`

That's it. No tabs, no menus, no shop.

---

## EXPLICIT CUT LIST

Everything below is in the full design and is **deliberately not in the MVP**:

| Cut | Why it's safe to cut |
|---|---|
| Ink / currency | No economy needed to test the feeling |
| Reach gear (lantern, raft, cold gear, diving bell) | One island = one terrain type |
| The other 4 regions + 2 future regions | Scope killer |
| Renown / leaderboards | Status needs a population first |
| Desire paths | Best feature in the design, most expensive. Comes later. |
| Seasonal re-Haze | Only matters at day 30+ |
| Survey layer (wildlife, weather) | This is the *renewable* layer — needed for retention, not for validation |
| Chart page gifting / trading | Needs more than one player to matter |
| Cross-server shared atlas | `MessagingService` complexity for no MVP benefit |
| Monetization | Zero. Do not build a single Robux product yet. |
| Expedition parties | — |
| Nightwatch / time gating | — |

**Shared atlas is the hardest cut.** It's the strongest feature in the full design (the Grow a Garden lesson). But it's also the one that turns a 2-week build into a 6-week build. Ship solo-only, and only add server-shared state once solo reveal is proven fun.

---

## BUILD ORDER

1. Terrain blockout — 1000×1000, ridge + lake + forest + 2 hills
2. Reveal grid, server-side, no visuals — print `%` to console
3. Haze visual + reveal chime → **stop and playtest for 15 minutes**
4. Pin sites + naming UI
5. DataStore save/load
6. Atlas screen
7. Guild Hut + spawn + the one NPC line: *"Everything past the fog is unmapped. Go stand in it."*
8. Mobile pass — test on the cheapest phone available

Do not skip step 3's playtest. It is the gate.

---

## SUCCESS CRITERIA

Ship to ~20 real players (Roblox friends, Discord, small servers). Measure:

| Metric | Target | Meaning |
|---|---|---|
| Median first session | > 12 min | The loop holds attention |
| % who chart 3+ pins | > 60% | Naming is a real motivator |
| % who return day 2 | > 25% | An incomplete map pulls people back |
| Unprompted "what's past the edge?" | any | The world creates curiosity on its own |

**Do not measure revenue. There is nothing to buy.**

If session length lands under 8 minutes, the problem is the terrain shape, not the mechanic — reshape before rebuilding anything.

---

## ONE-LINE SUMMARY

> One island. Fog. Walk to reveal it. Name 6 places. It saves.
> If that's fun for 15 minutes, the other 90% of the design is worth building.
