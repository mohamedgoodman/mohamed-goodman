--!strict
--[[
	The whole heads-up display: the `%` counter, the reveal chime, the "chart
	this place" prompt, and the button that opens the atlas.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local AtlasUi = require(script.Parent.AtlasUi)
local NamingUi = require(script.Parent.NamingUi)
local PinState = require(script.Parent.PinState)
local RevealState = require(script.Parent.RevealState)
local Theme = require(script.Parent.Theme)

local Hud = {}

local progressLabel: TextLabel
local promptButton: TextButton
local chime: Sound?
local lastChimeAt = 0

local function playChime()
	if not chime then
		return
	end
	local now = os.clock()
	if now - lastChimeAt < Config.ChimeMinInterval then
		return
	end
	lastChimeAt = now
	chime:Play()
end

local function updateProgress()
	progressLabel.Text = `{string.format("%.1f", RevealState.getProgress() * 100)}% charted`
end

local function updatePrompt()
	promptButton.Visible = PinState.getInRange() ~= nil
end

function Hud.start(screenGui: ScreenGui)
	if Config.ChimeSoundId ~= "" then
		local sound = Instance.new("Sound")
		sound.SoundId = Config.ChimeSoundId
		sound.Volume = Config.ChimeVolume
		sound.Parent = SoundService
		chime = sound
	end

	progressLabel = Instance.new("TextLabel")
	progressLabel.Name = "Progress"
	progressLabel.AnchorPoint = Vector2.new(1, 0)
	progressLabel.Position = UDim2.new(1, -16, 0, 16)
	progressLabel.Size = UDim2.fromOffset(190, 40)
	progressLabel.BackgroundColor3 = Theme.Ink
	progressLabel.BackgroundTransparency = 0.35
	progressLabel.Font = Theme.TitleFont
	progressLabel.TextSize = 20
	progressLabel.TextColor3 = Theme.Parchment
	progressLabel.Text = "0.0% charted"
	progressLabel.Parent = screenGui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 8)
	corner.Parent = progressLabel

	local atlasButton = Instance.new("TextButton")
	atlasButton.Name = "OpenAtlas"
	atlasButton.AnchorPoint = Vector2.new(1, 0)
	atlasButton.Position = UDim2.new(1, -16, 0, 64)
	atlasButton.Size = UDim2.fromOffset(190, 40)
	atlasButton.BackgroundColor3 = Theme.Ink
	atlasButton.BackgroundTransparency = 0.35
	atlasButton.Font = Theme.BodyFont
	atlasButton.TextSize = 18
	atlasButton.TextColor3 = Theme.Parchment
	atlasButton.Text = "Atlas"
	atlasButton.Parent = screenGui

	local atlasCorner = Instance.new("UICorner")
	atlasCorner.CornerRadius = UDim.new(0, 8)
	atlasCorner.Parent = atlasButton

	promptButton = Instance.new("TextButton")
	promptButton.Name = "ChartPrompt"
	promptButton.AnchorPoint = Vector2.new(0.5, 1)
	promptButton.Position = UDim2.new(0.5, 0, 1, -48)
	promptButton.Size = UDim2.fromOffset(260, 52)
	promptButton.BackgroundColor3 = Theme.Accent
	promptButton.Font = Theme.TitleFont
	promptButton.TextSize = 22
	promptButton.TextColor3 = Theme.Ink
	promptButton.Text = "Chart this place"
	promptButton.Visible = false
	promptButton.Parent = screenGui

	local promptCorner = Instance.new("UICorner")
	promptCorner.CornerRadius = UDim.new(0, 10)
	promptCorner.Parent = promptButton

	atlasButton.Activated:Connect(function()
		AtlasUi.toggle()
	end)

	promptButton.Activated:Connect(function()
		local siteId = PinState.getInRange()
		if siteId then
			NamingUi.open(siteId)
		end
	end)

	RevealState.Changed:Connect(function(indices)
		updateProgress()
		if #indices > 0 then
			playChime()
		end
	end)

	PinState.RangeChanged:Connect(updatePrompt)
	PinState.Changed:Connect(updatePrompt)

	updateProgress()
	updatePrompt()
end

return Hud
