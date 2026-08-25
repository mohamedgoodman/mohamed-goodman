# MAPMAKERS — MVP

> One island. Fog. Walk to reveal it. Name 6 places. It saves.

Roblox source for the MVP described in [MVP_SPEC.md](./MVP_SPEC.md), synced into
Roblox Studio with [Rojo](https://rojo.space). Everything here is Tier 1 of the
spec — the three systems, the atlas, the blockout, and nothing on the cut list.

## Open it in Studio

```bash
rokit install            # installs the pinned rojo/stylua/selene (or: aftman install)
rojo serve               # then in Studio: Plugins > Rojo > Connect
```

In Studio, create a new baseplate place, connect the Rojo plugin, and press
Play. On the first run the server builds the island (~10s), drops the Guild Hut
at spawn, and you can walk into the haze.

To get a place file instead of a live session: `rojo build -o mapmakers.rbxlx`,
then open that file. Built place files are gitignored — source is the truth.

## What is in here

```
src/shared/     Config · Grid · WordBank · Remotes   (both sides read these)
src/server/     the truth: reveal, pins, save, and the world blockout
src/client/     rendering only: haze, markers, HUD, naming picker, atlas
```

| System | Where | Notes |
| --- | --- | --- |
| Reveal | `server/RevealService.luau` | Server sweeps every 0.5s, marks cells within 48 studs, sends only the new indices. The client never decides what is revealed. |
| Haze | `client/HazeRenderer.luau` | Pooled parts, drawn only for cells near the player, so the on-screen count is bounded (`Config.HazeRenderCellRadius`). |
| Pins + naming | `server/PinService.luau`, `client/NamingUi.luau` | 6 sites, 12 adjectives x 12 nouns, indices over the wire, zero free text. The server re-checks range, ownership and word indices on every request. |
| Save | `server/SaveService.luau` | One key per player: `{ v=1, grid=<base64 bitfield>, pins={...} }`, ~650 bytes. `UpdateAsync` with backoff, on leave, on autosave, and on `BindToClose`. |
| Atlas | `client/AtlasUi.luau` | One screen, one button: charted cells, the 6 names, `X% charted`. |
| Blockout | `server/TerrainBuilder.luau` | Ridge, lake, forest, two vantages — generated once if the place has no terrain. |

## The gate

Build order step 3 in the spec: **stop and playtest for 15 minutes** before
building anything else. Two things to do before that playtest:

1. Set `Config.ChimeSoundId` to a chime asset id. It ships empty (no invented
   asset ids), and the reveal is silent without it — the chime is half of what
   is being tested.
2. Run it on the worst Android phone you can find. If the haze tanks the
   framerate, lower `Config.HazeRenderCellRadius` before changing anything else.

The `%` counter also prints to the server output every 10s in Studio, which is
the spec's "step 2: no visuals, print `%` to console".

## Tuning

Everything the spec puts a number on lives in `src/shared/Config.luau` — island
grid, reveal radius and tick, pin sites, prompt range, haze budget, save
cadence. Terrain shape is `TerrainBuilder.heightAt`; if a session runs short,
the spec says reshape the terrain rather than rebuild the mechanic.

Sculpting terrain by hand in Studio instead? Set `Config.GenerateTerrain = false`
— hand-made terrain lives in the place file and costs nothing at start-up.

## Deliberately not here

Ink, gear, other regions, renown, desire paths, re-Haze, survey layer, gifting,
the cross-server shared atlas, and monetization. All of it is on the spec's cut
list. The shared atlas is the one that hurts; it stays cut until solo reveal is
proven fun.

## Notes on the code

- Server-authoritative throughout: the client renders state, it never asserts it.
- Every remote is declared in `shared/Remotes.luau`; nothing touches
  `ReplicatedStorage` directly.
- `shared/Grid.luau` owns all cell maths and the bitfield, so cell indexing has
  exactly one definition.
- Without DataStore access (Studio with API services off) the game still runs;
  only persistence is lost.
