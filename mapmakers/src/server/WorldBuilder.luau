--!strict
--[[
	Build order step 7: spawn, the Guild Hut, and the one NPC line.

	Deliberately crude geometry — the MVP question is about walking into fog,
	not about art. Replace this with a real model whenever you like; nothing
	else reads from it.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage.Shared.Config)

local WorldBuilder = {}

local function groundY(x: number, z: number): number
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = {}
	params.IgnoreWater = true

	local hit = Workspace:Raycast(Vector3.new(x, 600, z), Vector3.new(0, -1200, 0), params)
	return if hit then hit.Position.Y else Config.SeaLevel
end

local function part(name: string, size: Vector3, position: Vector3, color: Color3, parent: Instance): Part
	local instance = Instance.new("Part")
	instance.Name = name
	instance.Anchored = true
	instance.Size = size
	instance.Position = position
	instance.Color = color
	instance.Material = Enum.Material.WoodPlanks
	instance.Parent = parent
	return instance
end

local function buildHut(origin: Vector3): Model
	local hut = Instance.new("Model")
	hut.Name = "GuildHut"

	local wood = Color3.fromRGB(120, 92, 64)
	local floor = part("Floor", Vector3.new(26, 1, 26), origin + Vector3.new(0, 0.5, 0), wood, hut)

	for _, corner in { Vector2.new(1, 1), Vector2.new(1, -1), Vector2.new(-1, 1), Vector2.new(-1, -1) } do
		part(
			"Pillar",
			Vector3.new(1.6, 12, 1.6),
			origin + Vector3.new(corner.X * 11, 7, corner.Y * 11),
			wood,
			hut
		)
	end

	local roof = part("Roof", Vector3.new(30, 1, 30), origin + Vector3.new(0, 13.5, 0), Color3.fromRGB(92, 64, 48), hut)
	roof.Material = Enum.Material.Slate

	hut.PrimaryPart = floor
	hut.Parent = Workspace

	-- The only line of dialogue in the MVP.
	local sign = part("Sign", Vector3.new(10, 0.4, 3), origin + Vector3.new(0, 8, -11), wood, hut)

	local billboard = Instance.new("BillboardGui")
	billboard.Name = "GuildLine"
	billboard.Size = UDim2.fromScale(16, 4)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, 4, 0)
	billboard.MaxDistance = 120
	billboard.AlwaysOnTop = true
	billboard.Parent = sign

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.Font = Enum.Font.Merriweather
	label.TextScaled = true
	label.TextColor3 = Color3.fromRGB(245, 240, 230)
	label.TextStrokeTransparency = 0.4
	label.Text = Config.GuildHutLine
	label.Parent = billboard

	return hut
end

function WorldBuilder.build()
	if Workspace:FindFirstChild("GuildHut") then
		return
	end

	local y = groundY(Config.Spawn.x, Config.Spawn.z)
	local origin = Vector3.new(Config.Spawn.x, y, Config.Spawn.z)
	buildHut(origin)

	local existingSpawn = Workspace:FindFirstChildOfClass("SpawnLocation")
	if existingSpawn then
		existingSpawn.CFrame = CFrame.new(origin + Vector3.new(0, 4, 14))
		return
	end

	local spawnLocation = Instance.new("SpawnLocation")
	spawnLocation.Name = "GuildSpawn"
	spawnLocation.Anchored = true
	spawnLocation.Size = Vector3.new(12, 1, 12)
	spawnLocation.CFrame = CFrame.new(origin + Vector3.new(0, 4, 14))
	spawnLocation.Color = Color3.fromRGB(200, 190, 170)
	spawnLocation.Material = Enum.Material.Slate
	spawnLocation.Parent = Workspace
end

return WorldBuilder
