--!strict
--[[
	One DataStore key per player: { v = 1, grid = <base64 bitfield>, pins = {...} }.

	Everything a session owns lives in the profile this service hands out; the
	reveal and pin services mutate it and call `markDirty`. Writes go through
	UpdateAsync with backoff, on PlayerRemoving, on an autosave loop, and on
	BindToClose.

	When DataStores are unavailable (Studio without API access, a service
	outage) the profile still exists in memory, so the game stays playable and
	only persistence is lost.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Config = require(ReplicatedStorage.Shared.Config)
local Grid = require(ReplicatedStorage.Shared.Grid)

export type Pin = {
	adjective: number,
	noun: number,
	name: string,
	by: string,
}

export type Profile = {
	version: number,
	grid: buffer,
	pins: { [string]: Pin },
	dirty: boolean,
	loaded: boolean,
}

local SaveService = {}

local store: DataStore? = nil
local profiles: { [Player]: Profile } = {}
local loadedSignal = Instance.new("BindableEvent")

local function keyFor(player: Player): string
	return Config.DataStoreKeyPrefix .. player.UserId
end

local function newProfile(): Profile
	return {
		version = Config.ProfileVersion,
		grid = Grid.newBitfield(),
		pins = {},
		dirty = false,
		loaded = false,
	}
end

--[[ Profile -> the plain table that goes in the DataStore. ]]
local function serialise(profile: Profile): { [string]: any }
	local pins = {}
	for siteId, pin in profile.pins do
		pins[siteId] = { adjective = pin.adjective, noun = pin.noun, name = pin.name, by = pin.by }
	end
	return { v = Config.ProfileVersion, grid = Grid.encode(profile.grid), pins = pins }
end

--[[ Stored table -> profile. Anything unrecognised decays to a fresh profile. ]]
local function deserialise(stored: any): Profile
	local profile = newProfile()
	if type(stored) ~= "table" or stored.v ~= Config.ProfileVersion then
		return profile
	end

	profile.grid = Grid.decode(stored.grid)
	if type(stored.pins) == "table" then
		for siteId, pin in stored.pins do
			if type(siteId) == "string" and type(pin) == "table" and type(pin.name) == "string" then
				profile.pins[siteId] = {
					adjective = tonumber(pin.adjective) or 0,
					noun = tonumber(pin.noun) or 0,
					name = pin.name,
					by = tostring(pin.by),
				}
			end
		end
	end
	return profile
end

--[[
	Runs `attempt` until it succeeds or the retry budget runs out, backing off
	1s, 2s, 4s, ... Returns success plus the attempt's value.
]]
local function withBackoff(label: string, attempt: () -> any): (boolean, any)
	local delaySeconds = Config.SaveRetryBaseSeconds
	for tries = 1, Config.SaveRetries do
		local ok, result = pcall(attempt)
		if ok then
			return true, result
		end
		if tries == Config.SaveRetries then
			warn(`[SaveService] {label} failed after {tries} attempts: {result}`)
			return false, result
		end
		task.wait(delaySeconds)
		delaySeconds *= 2
	end
	return false, nil
end

local function load(player: Player)
	local profile = newProfile()
	profiles[player] = profile

	if store then
		local ok, stored = withBackoff(`load {player.Name}`, function()
			return (store :: DataStore):GetAsync(keyFor(player))
		end)
		if ok and stored ~= nil and player.Parent then
			profiles[player] = deserialise(stored)
			profile = profiles[player]
		end
	end

	profile.loaded = true
	loadedSignal:Fire(player)
end

local function save(player: Player): boolean
	local profile = profiles[player]
	if not store or not profile or not profile.loaded or not profile.dirty then
		return false
	end

	local payload = serialise(profile)
	local ok = withBackoff(`save {player.Name}`, function()
		return (store :: DataStore):UpdateAsync(keyFor(player), function(existing): any?
			-- Last write wins: this server is the only one holding the session.
			if type(existing) == "table" and existing.v ~= nil and existing.v > Config.ProfileVersion then
				return nil -- a newer schema exists; don't clobber it
			end
			return payload
		end)
	end)

	if ok then
		profile.dirty = false
	end
	return ok
end

-- ── API ──────────────────────────────────────────────────────────────────────

function SaveService.getProfile(player: Player): Profile?
	local profile = profiles[player]
	if profile and profile.loaded then
		return profile
	end
	return nil
end

--[[ Yields until the player's profile is loaded. Returns nil if they leave. ]]
function SaveService.waitForProfile(player: Player): Profile?
	local profile = SaveService.getProfile(player)
	if profile then
		return profile
	end

	while player.Parent do
		local loadedPlayer = loadedSignal.Event:Wait()
		if loadedPlayer == player then
			return SaveService.getProfile(player)
		end
	end
	return nil
end

function SaveService.markDirty(player: Player)
	local profile = profiles[player]
	if profile then
		profile.dirty = true
	end
end

function SaveService.start()
	local ok, result = pcall(function()
		return DataStoreService:GetDataStore(Config.DataStoreName)
	end)
	if ok then
		store = result
	else
		warn(`[SaveService] DataStores unavailable, running without persistence: {result}`)
	end

	Players.PlayerAdded:Connect(load)
	for _, player in Players:GetPlayers() do
		if not profiles[player] then
			task.spawn(load, player)
		end
	end

	Players.PlayerRemoving:Connect(function(player)
		save(player)
		profiles[player] = nil
	end)

	task.spawn(function()
		while true do
			task.wait(Config.AutosaveSeconds)
			for player in profiles do
				task.spawn(save, player)
			end
		end
	end)

	game:BindToClose(function()
		if RunService:IsStudio() then
			return
		end
		local pending = 0
		for player in profiles do
			pending += 1
			task.spawn(function()
				save(player)
				pending -= 1
			end)
		end
		while pending > 0 do
			task.wait(0.1)
		end
	end)
end

return SaveService
