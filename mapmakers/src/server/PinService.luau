--!strict
--[[
	System 2 of 3: Pins + naming.

	Six sites. Walk within PinPromptRadius of one you haven't charted and the
	client offers the naming picker; it sends back two word-bank indices and
	nothing else — there is no free text anywhere in the path.

	Markers are drawn client-side from PinsSync, because in the MVP each player
	names their own copy of the world.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = require(ReplicatedStorage.Shared.Remotes)
local SaveService = require(script.Parent.SaveService)
local WordBank = require(ReplicatedStorage.Shared.WordBank)

local pinsSync = Remotes.get("PinsSync") :: RemoteEvent
local pinInRange = Remotes.get("PinInRange") :: RemoteEvent
local chartPin = Remotes.get("ChartPin") :: RemoteFunction

local PinService = {}

type Site = { id: string, position: Vector3 }

local sites: { Site } = {}
local sitesById: { [string]: Site } = {}
local promptedSite: { [Player]: string? } = {}

--[[ Drops each configured XZ onto the terrain so sites sit on the ground. ]]
local function resolveSites()
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Exclude
	params.FilterDescendantsInstances = {}
	params.IgnoreWater = false

	for _, site in Config.PinSites do
		local from = Vector3.new(site.x, 600, site.z)
		local hit = Workspace:Raycast(from, Vector3.new(0, -1200, 0), params)
		local y = if hit then hit.Position.Y else Config.SeaLevel
		local resolved: Site = { id = site.id, position = Vector3.new(site.x, y, site.z) }
		table.insert(sites, resolved)
		sitesById[site.id] = resolved
	end
end

--[[ The payload the client draws markers and the atlas list from. ]]
local function buildPayload(player: Player): { any }
	local profile = SaveService.getProfile(player)
	local payload = {}
	for _, site in sites do
		local pin = profile and profile.pins[site.id]
		table.insert(payload, {
			id = site.id,
			position = site.position,
			name = pin and pin.name or nil,
			by = pin and pin.by or nil,
		})
	end
	return payload
end

local function push(player: Player)
	if player.Parent then
		pinsSync:FireClient(player, buildPayload(player))
	end
end

local function characterPosition(player: Player): Vector3?
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	if root and root:IsA("BasePart") then
		return root.Position
	end
	return nil
end

local function nearestUnchartedSite(player: Player): string?
	local profile = SaveService.getProfile(player)
	local position = profile and characterPosition(player)
	if not profile or not position then
		return nil
	end

	local bestId: string? = nil
	local bestDistance = Config.PinPromptRadius
	for _, site in sites do
		if not profile.pins[site.id] then
			local distance = (site.position - position).Magnitude
			if distance <= bestDistance then
				bestId, bestDistance = site.id, distance
			end
		end
	end
	return bestId
end

local function sweep()
	for _, player in Players:GetPlayers() do
		local siteId = nearestUnchartedSite(player)
		if promptedSite[player] ~= siteId then
			promptedSite[player] = siteId
			pinInRange:FireClient(player, siteId)
		end
	end
end

local function isWordIndex(value: any): boolean
	return type(value) == "number" and value == math.floor(value) and value >= 1
end

--[[
	Client -> server. Every argument is treated as hostile: the site must exist,
	be unnamed, and be in range right now, and the indices must be real word-bank
	entries.
]]
local function onChartPin(player: Player, siteId: any, adjectiveIndex: any, nounIndex: any): (boolean, string?)
	local profile = SaveService.getProfile(player)
	if not profile then
		return false, "still loading"
	end
	if type(siteId) ~= "string" or not sitesById[siteId] then
		return false, "no such place"
	end
	if profile.pins[siteId] then
		return false, "already charted"
	end
	if not isWordIndex(adjectiveIndex) or not isWordIndex(nounIndex) then
		return false, "bad name"
	end

	local name = WordBank.resolve(adjectiveIndex, nounIndex)
	if not name then
		return false, "bad name"
	end

	local position = characterPosition(player)
	if not position or (sitesById[siteId].position - position).Magnitude > Config.PinPromptRadius then
		return false, "too far away"
	end

	profile.pins[siteId] = {
		adjective = adjectiveIndex,
		noun = nounIndex,
		name = name,
		by = player.Name,
	}
	SaveService.markDirty(player)

	promptedSite[player] = nil
	push(player)
	pinInRange:FireClient(player, nearestUnchartedSite(player))
	return true, nil
end

function PinService.start()
	resolveSites()

	chartPin.OnServerInvoke = function(player, siteId, adjectiveIndex, nounIndex)
		local ok, reason = onChartPin(player, siteId, adjectiveIndex, nounIndex)
		return ok, reason
	end

	Players.PlayerAdded:Connect(function(player)
		task.spawn(function()
			if SaveService.waitForProfile(player) then
				push(player)
			end
		end)
	end)
	for _, player in Players:GetPlayers() do
		task.spawn(push, player)
	end

	Players.PlayerRemoving:Connect(function(player)
		promptedSite[player] = nil
	end)

	task.spawn(function()
		while true do
			task.wait(Config.RevealTick)
			local ok, err = pcall(sweep)
			if not ok then
				warn(`[PinService] sweep failed: {err}`)
			end
		end
	end)
end

return PinService
