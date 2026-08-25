--!strict
--[[
	The floating marker over a charted place: the name the player chose, and
	their username under it.
]]

local Workspace = game:GetService("Workspace")

local PinState = require(script.Parent.PinState)

local PinMarkers = {}

local folder: Folder

local function buildMarker(pin: PinState.Pin): Part
	local anchor = Instance.new("Part")
	anchor.Name = pin.id
	anchor.Anchored = true
	anchor.CanCollide = false
	anchor.CanQuery = false
	anchor.CanTouch = false
	anchor.Transparency = 1
	anchor.Size = Vector3.one
	anchor.Position = pin.position + Vector3.new(0, 8, 0)

	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.fromScale(14, 4)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, 3, 0)
	billboard.MaxDistance = 400
	billboard.AlwaysOnTop = true
	billboard.Parent = anchor

	local name = Instance.new("TextLabel")
	name.BackgroundTransparency = 1
	name.Size = UDim2.fromScale(1, 0.62)
	name.Font = Enum.Font.Merriweather
	name.TextScaled = true
	name.TextColor3 = Color3.fromRGB(248, 244, 232)
	name.TextStrokeTransparency = 0.35
	name.Text = pin.name or ""
	name.Parent = billboard

	local author = Instance.new("TextLabel")
	author.BackgroundTransparency = 1
	author.Position = UDim2.fromScale(0, 0.62)
	author.Size = UDim2.fromScale(1, 0.38)
	author.Font = Enum.Font.Gotham
	author.TextScaled = true
	author.TextColor3 = Color3.fromRGB(196, 190, 176)
	author.TextStrokeTransparency = 0.6
	author.Text = `named by {pin.by or "?"}`
	author.Parent = billboard

	return anchor
end

local function rebuild()
	folder:ClearAllChildren()
	for _, pin in PinState.getPins() do
		if pin.name then
			buildMarker(pin).Parent = folder
		end
	end
end

function PinMarkers.start()
	folder = Instance.new("Folder")
	folder.Name = "PinMarkers"
	folder.Parent = Workspace

	PinState.Changed:Connect(rebuild)
	rebuild()
end

return PinMarkers
