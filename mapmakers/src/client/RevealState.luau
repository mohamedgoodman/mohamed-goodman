--!strict
--[[
	The client's mirror of the server's grid: what the haze renderer and the
	atlas draw from. It is a cache, never a source of truth — every bit in here
	arrived from the server.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Grid = require(Shared:WaitForChild("Grid"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local revealSync = Remotes.get("RevealSync") :: RemoteEvent
local revealDelta = Remotes.get("RevealDelta") :: RemoteEvent

local RevealState = {}

local bits = Grid.newBitfield()
local revealedCount = 0

local changed = Instance.new("BindableEvent")
--[[ Fires with the array of newly revealed indices ({} on a full resync). ]]
RevealState.Changed = changed.Event

function RevealState.isRevealed(index: number): boolean
	return Grid.isSet(bits, index)
end

function RevealState.getProgress(): number
	return revealedCount / Config.CellCount
end

function RevealState.getBits(): buffer
	return bits
end

function RevealState.start()
	revealSync.OnClientEvent:Connect(function(encoded)
		bits = Grid.decode(encoded)
		revealedCount = Grid.count(bits)
		changed:Fire({})
	end)

	revealDelta.OnClientEvent:Connect(function(indices)
		if type(indices) ~= "table" then
			return
		end
		local applied = {}
		for _, index in indices do
			if Grid.set(bits, index) then
				revealedCount += 1
				table.insert(applied, index)
			end
		end
		if #applied > 0 then
			changed:Fire(applied)
		end
	end)
end

return RevealState
