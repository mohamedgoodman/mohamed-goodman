--!strict
--[[
	System 1 of 3: Reveal.

	The server holds the truth. Every RevealTick it looks at where each player
	actually is, marks the cells within RevealRadius, and pushes only the newly
	revealed indices to that player. The client renders; it never decides what
	is revealed.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Config = require(ReplicatedStorage.Shared.Config)
local Grid = require(ReplicatedStorage.Shared.Grid)
local Remotes = require(ReplicatedStorage.Shared.Remotes)
local SaveService = require(script.Parent.SaveService)

local revealSync = Remotes.get("RevealSync") :: RemoteEvent
local revealDelta = Remotes.get("RevealDelta") :: RemoteEvent

local RevealService = {}

local function characterPosition(player: Player): Vector3?
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if root and root:IsA("BasePart") then
		return root.Position
	end
	return nil
end

--[[ Marks everything in reach of `position`; returns the new indices. ]]
local function revealAround(profile: SaveService.Profile, position: Vector3): { number }
	local revealed = {}
	Grid.forEachCellInRadius(position.X, position.Z, Config.RevealRadius, function(index)
		if Grid.set(profile.grid, index) then
			table.insert(revealed, index)
		end
	end)
	return revealed
end

local function sweep()
	for _, player in Players:GetPlayers() do
		local profile = SaveService.getProfile(player)
		local position = profile and characterPosition(player)
		if profile and position then
			local revealed = revealAround(profile, position)
			if #revealed > 0 then
				profile.dirty = true
				revealDelta:FireClient(player, revealed)
			end
		end
	end
end

--[[ Sends the whole saved grid once, so the client can draw the haze. ]]
local function syncPlayer(player: Player)
	local profile = SaveService.waitForProfile(player)
	if not profile or not player.Parent then
		return
	end
	revealSync:FireClient(player, Grid.encode(profile.grid))
end

function RevealService.getProgress(player: Player): number
	local profile = SaveService.getProfile(player)
	return if profile then Grid.progress(profile.grid) else 0
end

function RevealService.start()
	Players.PlayerAdded:Connect(function(player)
		task.spawn(syncPlayer, player)
	end)
	for _, player in Players:GetPlayers() do
		task.spawn(syncPlayer, player)
	end

	-- A fixed sweep rather than Heartbeat: 2 Hz is enough for a 16-stud grid at
	-- walk speed 16, and it keeps the per-player cost predictable on mobile.
	task.spawn(function()
		while true do
			task.wait(Config.RevealTick)
			local ok, err = pcall(sweep)
			if not ok then
				warn(`[RevealService] sweep failed: {err}`)
			end
		end
	end)

	if RunService:IsStudio() then
		-- Build order step 2: the % counter in the output before any visuals.
		task.spawn(function()
			while true do
				task.wait(10)
				for _, player in Players:GetPlayers() do
					local progress = RevealService.getProgress(player)
					print(`[Reveal] {player.Name}: {string.format("%.1f", progress * 100)}% charted`)
				end
			end
		end)
	end
end

return RevealService
