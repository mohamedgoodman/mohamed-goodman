--!strict
--[[
	Build order step 1: the terrain blockout.

	Terrain *shape* is what makes the walk take 25-35 minutes instead of 7, so
	the island is not a flat square: one diagonal ridge that blocks sightlines,
	one lake you have to walk around, one forest patch that reveals differently,
	and the two vantage hills.

	This runs at start-up only when the place has no terrain yet. Once you are
	happy with a shape, sculpt it by hand in Studio and set
	Config.GenerateTerrain = false — hand-made terrain is saved in the place
	file and costs nothing at run time.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage.Shared.Config)

local TerrainBuilder = {}

local CELL = Config.CellSize
local HALF = Config.WorldSize / 2
local BEDROCK = -60

local function noise(x: number, z: number, scale: number): number
	return math.noise(x / scale, z / scale, Config.TerrainSeed % 1000)
end

--[[ Distance from the XZ point to the diagonal ridge line (x + z = 0). ]]
local function ridgeDistance(x: number, z: number): number
	return math.abs(x + z) / math.sqrt(2)
end

local function falloff(distance: number, radius: number): number
	if distance >= radius then
		return 0
	end
	local t = 1 - distance / radius
	return t * t * (3 - 2 * t) -- smoothstep
end

--[[ Surface height at a world XZ, in studs above sea level. ]]
local function heightAt(x: number, z: number): number
	local height = 8 + noise(x, z, 240) * 16 + noise(x, z, 70) * 5

	-- Ridge: a long spine across the middle of the island.
	height += falloff(ridgeDistance(x, z), 110) * (46 + noise(x, z, 130) * 12)

	-- The two vantages.
	for _, hill in Config.Vantages do
		local distance = math.sqrt((x - hill.x) ^ 2 + (z - hill.z) ^ 2)
		height += falloff(distance, hill.radius) * hill.height
	end

	-- Lake basin.
	local lake = Config.Lake
	local lakeDistance = math.sqrt((x - lake.x) ^ 2 + (z - lake.z) ^ 2)
	height -= falloff(lakeDistance, lake.radius) * (lake.depth + height)

	-- Coast: everything sinks towards the island edge so the map has an edge
	-- players can stand at and wonder what is past.
	local edge = math.max(math.abs(x), math.abs(z)) / HALF
	if edge > 0.72 then
		local t = (edge - 0.72) / 0.28
		height -= t * t * (height + 30)
	end

	return height
end

local function materialAt(x: number, z: number, height: number): Enum.Material
	if height < Config.SeaLevel + 1.5 then
		return Enum.Material.Sand
	end

	local forest = Config.Forest
	if math.sqrt((x - forest.x) ^ 2 + (z - forest.z) ^ 2) < forest.radius then
		return Enum.Material.LeafyGrass
	end

	if ridgeDistance(x, z) < 45 and height > 40 then
		return Enum.Material.Rock
	end
	if height > 60 then
		return Enum.Material.Slate
	end
	return Enum.Material.Grass
end

local function plantForest(parent: Instance)
	local forest = Config.Forest
	local random = Random.new(Config.TerrainSeed)

	for index = 1, forest.treeCount do
		local angle = random:NextNumber(0, math.pi * 2)
		local distance = math.sqrt(random:NextNumber(0, 1)) * forest.radius * 0.9
		local x = forest.x + math.cos(angle) * distance
		local z = forest.z + math.sin(angle) * distance
		local groundY = heightAt(x, z)
		if groundY <= Config.SeaLevel + 1 then
			continue
		end

		local height = random:NextNumber(14, 22)

		local trunk = Instance.new("Part")
		trunk.Name = `Trunk{index}`
		trunk.Anchored = true
		trunk.Size = Vector3.new(2.4, height, 2.4)
		trunk.Position = Vector3.new(x, groundY + height / 2, z)
		trunk.Color = Color3.fromRGB(86, 66, 48)
		trunk.Material = Enum.Material.Wood
		trunk.Parent = parent

		local canopy = Instance.new("Part")
		canopy.Name = `Canopy{index}`
		canopy.Anchored = true
		canopy.Shape = Enum.PartType.Ball
		canopy.Size = Vector3.new(1, 1, 1) * random:NextNumber(16, 22)
		canopy.Position = Vector3.new(x, groundY + height, z)
		canopy.Color = Color3.fromRGB(58, 92, 58)
		canopy.Material = Enum.Material.Grass
		canopy.Parent = parent
	end
end

local function hasTerrain(): boolean
	local extents = Workspace.Terrain.MaxExtents
	local size = extents.Max - extents.Min
	return size.X > 1 and size.Y > 1 and size.Z > 1
end

function TerrainBuilder.build()
	local terrain = Workspace.Terrain
	local started = os.clock()

	local columns = 0
	for cz = 0, Config.GridSize - 1 do
		for cx = 0, Config.GridSize - 1 do
			local x = (cx + 0.5) * CELL - HALF
			local z = (cz + 0.5) * CELL - HALF
			local height = heightAt(x, z)

			local top = math.max(height, BEDROCK + 4)
			terrain:FillBlock(
				CFrame.new(x, (BEDROCK + top) / 2, z),
				Vector3.new(CELL, top - BEDROCK, CELL),
				materialAt(x, z, height)
			)

			-- Water sits in the lake basin and around the coast, up to sea level.
			if height < Config.SeaLevel then
				terrain:FillBlock(
					CFrame.new(x, (height + Config.SeaLevel) / 2, z),
					Vector3.new(CELL, Config.SeaLevel - height, CELL),
					Enum.Material.Water
				)
			end

			columns += 1
			if columns % 400 == 0 then
				task.wait() -- keep the start-up frame budget sane
			end
		end
	end

	local props = Instance.new("Folder")
	props.Name = "Forest"
	props.Parent = Workspace
	plantForest(props)

	print(`[TerrainBuilder] island built in {string.format("%.1f", os.clock() - started)}s`)
end

function TerrainBuilder.buildIfEmpty()
	if not Config.GenerateTerrain then
		return
	end
	if hasTerrain() then
		return
	end
	TerrainBuilder.build()
end

TerrainBuilder.heightAt = heightAt

return TerrainBuilder
