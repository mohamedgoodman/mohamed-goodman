--!strict
--[[
	Client-side mirror of the six pin sites and the names this player gave them.
	The naming UI, the markers, and the atlas list all read from here.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Remotes = require(Shared:WaitForChild("Remotes"))

local pinsSync = Remotes.get("PinsSync") :: RemoteEvent
local pinInRange = Remotes.get("PinInRange") :: RemoteEvent
local chartPin = Remotes.get("ChartPin") :: RemoteFunction

export type Pin = { id: string, position: Vector3, name: string?, by: string? }

local PinState = {}

local pins: { Pin } = {}
local inRange: string? = nil

local pinsChanged = Instance.new("BindableEvent")
local rangeChanged = Instance.new("BindableEvent")

PinState.Changed = pinsChanged.Event
--[[ Fires with the site id the player can chart right now, or nil. ]]
PinState.RangeChanged = rangeChanged.Event

function PinState.getPins(): { Pin }
	return pins
end

function PinState.getInRange(): string?
	return inRange
end

function PinState.countCharted(): number
	local total = 0
	for _, pin in pins do
		if pin.name then
			total += 1
		end
	end
	return total
end

--[[ Asks the server to chart the in-range site. Returns ok plus a reason. ]]
function PinState.chart(siteId: string, adjectiveIndex: number, nounIndex: number): (boolean, string?)
	local ok, accepted, reason = pcall(function()
		return chartPin:InvokeServer(siteId, adjectiveIndex, nounIndex)
	end)
	if not ok then
		return false, "lost connection"
	end
	return accepted == true, reason
end

function PinState.start()
	pinsSync.OnClientEvent:Connect(function(payload)
		if type(payload) ~= "table" then
			return
		end
		pins = payload
		pinsChanged:Fire(pins)
	end)

	pinInRange.OnClientEvent:Connect(function(siteId)
		inRange = if type(siteId) == "string" then siteId else nil
		rangeChanged:Fire(inRange)
	end)
end

return PinState
