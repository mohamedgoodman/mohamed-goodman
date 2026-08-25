--!strict
--[[
	The haze: what unrevealed land looks like from inside it.

	Only cells near the player are drawn, from a part pool, so the on-screen
	count is bounded by Config.HazeRenderCellRadius no matter how big the
	island gets. That bound is the mobile budget from the spec's Tier 0 — if
	the framerate on a cheap Android phone is bad, lower it before anything else.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Grid = require(Shared:WaitForChild("Grid"))
local RevealState = require(script.Parent.RevealState)

local HazeRenderer = {}

local folder: Folder
local pool: { Part } = {}
local active: { [number]: Part } = {}

local function newHazePart(): Part
	local haze = Instance.new("Part")
	haze.Name = "Haze"
	haze.Anchored = true
	haze.CanCollide = false
	haze.CanQuery = false
	haze.CanTouch = false
	haze.CastShadow = false
	haze.Size = Vector3.new(Config.CellSize, Config.HazeHeight, Config.CellSize)
	haze.Color = Config.HazeColor
	haze.Material = Enum.Material.SmoothPlastic
	haze.Transparency = Config.HazeTransparency
	return haze
end

local function acquire(): Part
	local haze = table.remove(pool)
	if not haze then
		haze = newHazePart()
	end
	haze.Transparency = Config.HazeTransparency
	haze.Parent = folder
	return haze
end

local function release(haze: Part)
	haze.Parent = nil
	table.insert(pool, haze)
end

--[[ Fades a cell out where the player can see it happen, then reclaims it. ]]
local function dissolve(index: number)
	local haze = active[index]
	if not haze then
		return
	end
	active[index] = nil

	local tween = TweenService:Create(
		haze,
		TweenInfo.new(Config.HazeFadeSeconds, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Transparency = 1 }
	)
	tween.Completed:Connect(function()
		release(haze)
	end)
	tween:Play()
end

--[[ Adds/removes haze so exactly the nearby unrevealed cells are drawn. ]]
local function refresh(position: Vector3)
	local originX, originZ = Grid.clampToCell(position.X, position.Z)

	local radius = Config.HazeRenderCellRadius
	local wanted: { [number]: true } = {}

	for cz = originZ - radius, originZ + radius do
		if cz >= 0 and cz < Config.GridSize then
			for cx = originX - radius, originX + radius do
				if cx >= 0 and cx < Config.GridSize then
					local index = Grid.toIndex(cx, cz)
					if not RevealState.isRevealed(index) then
						wanted[index] = true
						if not active[index] then
							local haze = acquire()
							local x, z = Grid.cellCenter(cx, cz)
							haze.Position = Vector3.new(x, Config.HazeCenterY, z)
							active[index] = haze
						end
					end
				end
			end
		end
	end

	-- Cells that fell out of range: reclaim without the fade, they are far away.
	for index, haze in active do
		if not wanted[index] then
			active[index] = nil
			release(haze)
		end
	end
end

function HazeRenderer.start()
	folder = Instance.new("Folder")
	folder.Name = "Haze"
	folder.Parent = Workspace

	RevealState.Changed:Connect(function(indices)
		if #indices == 0 then
			-- Full resync: drop everything and rebuild on the next tick.
			for index, haze in active do
				active[index] = nil
				release(haze)
			end
			return
		end
		for _, index in indices do
			dissolve(index)
		end
	end)

	-- 5 Hz is plenty: the player moves 16 studs/s and cells are 16 studs wide.
	local accumulated = 0
	RunService.Heartbeat:Connect(function(deltaTime)
		accumulated += deltaTime
		if accumulated < 0.2 then
			return
		end
		accumulated = 0

		local camera = Workspace.CurrentCamera
		if camera then
			refresh(camera.CFrame.Position)
		end
	end)
end

return HazeRenderer
