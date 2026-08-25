--!strict
--[[
	Every instance that crosses the client/server boundary is declared here. The
	server creates them on first use, the client waits for them; nothing else
	touches ReplicatedStorage directly.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local FOLDER_NAME = "Remotes"

local REMOTES: { [string]: string } = {
	-- Server -> client, once on join: the whole saved grid, base64 encoded.
	RevealSync = "RemoteEvent",
	-- Server -> client, every sweep: the cell indices revealed this tick.
	RevealDelta = "RemoteEvent",
	-- Server -> client: the full pin list (positions, names, who named them).
	PinsSync = "RemoteEvent",
	-- Server -> client: the nearest unnamed pin site in range, or nil.
	PinInRange = "RemoteEvent",
	-- Client -> server: "chart this place as <adjective> <noun>". Returns
	-- true, or false plus a reason.
	ChartPin = "RemoteFunction",
}

local Remotes = {}

local function getFolder(): Instance
	if not RunService:IsServer() then
		return ReplicatedStorage:WaitForChild(FOLDER_NAME)
	end

	local folder = ReplicatedStorage:FindFirstChild(FOLDER_NAME)
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = FOLDER_NAME
		folder.Parent = ReplicatedStorage
	end
	return folder
end

function Remotes.get(name: string): Instance
	local className = REMOTES[name]
	assert(className, `no remote named "{name}" is declared in Remotes.luau`)

	local folder = getFolder()
	if not RunService:IsServer() then
		return folder:WaitForChild(name)
	end

	local remote = folder:FindFirstChild(name)
	if not remote then
		remote = Instance.new(className)
		remote.Name = name
		remote.Parent = folder
	end
	return remote
end

return Remotes
