--!strict
--[[
	MAPMAKERS — tunable values shared by server and client.

	Numbers here come straight from MVP_SPEC.md (Tier 1). Change them here, not
	inline in the services.
]]

local Config = {
	-- ── World ────────────────────────────────────────────────────────────────
	-- 62 x 62 cells of 16 studs = 992 studs across, the spec's "1000 x 1000".
	GridSize = 62,
	CellSize = 16,

	-- ── Reveal ───────────────────────────────────────────────────────────────
	RevealRadius = 48, -- studs; 3 cells
	RevealTick = 0.5, -- seconds between server sweeps

	-- ── Pins ─────────────────────────────────────────────────────────────────
	PinPromptRadius = 30, -- studs

	-- Six pin sites, in world XZ. Y is resolved by raycasting onto the terrain
	-- at start-up, so these stay correct if the blockout is reshaped.
	PinSites = {
		{ id = "ridge_north", x = -120, z = -300 },
		{ id = "lake_shore", x = 250, z = -140 },
		{ id = "forest_heart", x = -300, z = 210 },
		{ id = "vantage_east", x = 330, z = 300 },
		{ id = "vantage_west", x = -330, z = -60 },
		{ id = "far_reach", x = 60, z = 420 },
	},

	-- ── Terrain blockout ─────────────────────────────────────────────────────
	GenerateTerrain = true, -- build the island at start-up if the place is empty
	TerrainSeed = 20260825,
	SeaLevel = 0,
	Vantages = { -- the two hills
		{ x = 330, z = 300, radius = 110, height = 78 },
		{ x = -330, z = -60, radius = 95, height = 64 },
	},
	Lake = { x = 250, z = -140, radius = 150, depth = 26 },
	Forest = { x = -300, z = 210, radius = 170, treeCount = 44 },
	Spawn = { x = 180, z = 200 }, -- flat ground off the ridge; the Guild Hut sits here
	GuildHutLine = "Everything past the fog is unmapped. Go stand in it.",

	-- ── Haze ─────────────────────────────────────────────────────────────────
	-- The haze is drawn as pooled parts, but only for cells near the player.
	-- 10 cells => at most 21 x 21 = 441 parts on screen. Raise it only after
	-- testing on the worst Android phone you can find (spec, Tier 0).
	HazeRenderCellRadius = 10,
	HazeHeight = 260,
	HazeCenterY = 70,
	HazeColor = Color3.fromRGB(216, 224, 235),
	HazeTransparency = 0.2,
	HazeFadeSeconds = 0.45,

	-- ── Feedback ─────────────────────────────────────────────────────────────
	-- Paste a chime asset id here (e.g. "rbxassetid://1234567890"). Left empty
	-- the reveal is silent — the chime is part of the Tier 0 feeling test, so
	-- set it before the 15-minute playtest.
	ChimeSoundId = "",
	ChimeVolume = 0.35,
	ChimeMinInterval = 0.25, -- seconds; keeps a sweep of cells to one chime

	-- ── Save ─────────────────────────────────────────────────────────────────
	DataStoreName = "MapmakersMVP",
	DataStoreKeyPrefix = "player_",
	SaveRetries = 4,
	SaveRetryBaseSeconds = 1,
	AutosaveSeconds = 120,
	ProfileVersion = 1,
}

Config.WorldSize = Config.GridSize * Config.CellSize
Config.CellCount = Config.GridSize * Config.GridSize

return table.freeze(Config)
