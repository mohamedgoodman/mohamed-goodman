--!strict
--[[
	Naming: pick one adjective and one noun. 144 combinations, no text box —
	the picker is the only way a name can be produced, on either side of the
	wire.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local WordBank = require(Shared:WaitForChild("WordBank"))
local PinState = require(script.Parent.PinState)
local Theme = require(script.Parent.Theme)

local NamingUi = {}

local root: Frame
local preview: TextLabel
local confirmButton: TextButton
local statusLabel: TextLabel

local adjectiveButtons: { TextButton } = {}
local nounButtons: { TextButton } = {}

local currentSite: string? = nil
local adjectiveIndex: number? = nil
local nounIndex: number? = nil
local submitting = false

local function styleButton(button: TextButton, selected: boolean)
	button.BackgroundColor3 = if selected then Theme.Accent else Theme.Ink
	button.BackgroundTransparency = if selected then 0 else 0.25
	button.TextColor3 = if selected then Theme.Ink else Theme.Parchment
end

local function refresh()
	for index, button in adjectiveButtons do
		styleButton(button, index == adjectiveIndex)
	end
	for index, button in nounButtons do
		styleButton(button, index == nounIndex)
	end

	local name = if adjectiveIndex and nounIndex then WordBank.resolve(adjectiveIndex, nounIndex) else nil
	preview.Text = name or "— —"
	confirmButton.Visible = name ~= nil and not submitting
end

local function buildColumn(title: string, words: { string }, xScale: number, into: { TextButton }, onPick: (number) -> ())
	local column = Instance.new("Frame")
	column.BackgroundTransparency = 1
	column.Position = UDim2.new(xScale, 0, 0, 92)
	column.Size = UDim2.new(0.5, -24, 1, -180)
	column.Parent = root

	local heading = Instance.new("TextLabel")
	heading.BackgroundTransparency = 1
	heading.Size = UDim2.new(1, 0, 0, 26)
	heading.Font = Theme.BodyFont
	heading.TextSize = 15
	heading.TextColor3 = Theme.ParchmentDim
	heading.Text = title
	heading.Parent = column

	local list = Instance.new("ScrollingFrame")
	list.BackgroundTransparency = 1
	list.BorderSizePixel = 0
	list.Position = UDim2.fromOffset(0, 30)
	list.Size = UDim2.new(1, 0, 1, -30)
	list.CanvasSize = UDim2.new()
	list.AutomaticCanvasSize = Enum.AutomaticSize.Y
	list.ScrollBarThickness = 4
	list.Parent = column

	local layout = Instance.new("UIListLayout")
	layout.Padding = UDim.new(0, 6)
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Parent = list

	for index, word in words do
		local button = Instance.new("TextButton")
		button.LayoutOrder = index
		button.Size = UDim2.new(1, -8, 0, 34)
		button.Font = Theme.TitleFont
		button.TextSize = 18
		button.Text = word
		button.AutoButtonColor = false
		button.Parent = list

		local corner = Instance.new("UICorner")
		corner.CornerRadius = UDim.new(0, 6)
		corner.Parent = button

		button.Activated:Connect(function()
			onPick(index)
			refresh()
		end)

		into[index] = button
	end
end

local function submit()
	local siteId, adjective, noun = currentSite, adjectiveIndex, nounIndex
	if submitting or not siteId or not adjective or not noun then
		return
	end

	submitting = true
	confirmButton.Visible = false
	statusLabel.Text = "charting..."

	task.spawn(function()
		local ok, reason = PinState.chart(siteId, adjective, noun)
		submitting = false
		if ok then
			NamingUi.close()
		else
			statusLabel.Text = reason or "could not chart this place"
			refresh()
		end
	end)
end

function NamingUi.open(siteId: string)
	currentSite = siteId
	adjectiveIndex = nil
	nounIndex = nil
	submitting = false
	statusLabel.Text = ""
	root.Visible = true
	refresh()
end

function NamingUi.close()
	currentSite = nil
	root.Visible = false
end

function NamingUi.build(screenGui: ScreenGui)
	root = Instance.new("Frame")
	root.Name = "Naming"
	root.AnchorPoint = Vector2.new(0.5, 0.5)
	root.Position = UDim2.fromScale(0.5, 0.5)
	root.Size = UDim2.fromOffset(460, 460)
	root.BackgroundColor3 = Theme.Parchment
	root.Visible = false
	root.Parent = screenGui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = root

	local title = Instance.new("TextLabel")
	title.BackgroundTransparency = 1
	title.Position = UDim2.fromOffset(0, 14)
	title.Size = UDim2.new(1, 0, 0, 26)
	title.Font = Theme.BodyFont
	title.TextSize = 15
	title.TextColor3 = Color3.fromRGB(96, 88, 74)
	title.Text = "Chart this place"
	title.Parent = root

	preview = Instance.new("TextLabel")
	preview.BackgroundTransparency = 1
	preview.Position = UDim2.fromOffset(0, 40)
	preview.Size = UDim2.new(1, 0, 0, 42)
	preview.Font = Theme.TitleFont
	preview.TextSize = 30
	preview.TextColor3 = Theme.Ink
	preview.Text = "— —"
	preview.Parent = root

	buildColumn("adjective", WordBank.Adjectives, 0, adjectiveButtons, function(index)
		adjectiveIndex = index
	end)
	buildColumn("noun", WordBank.Nouns, 0.5, nounButtons, function(index)
		nounIndex = index
	end)

	statusLabel = Instance.new("TextLabel")
	statusLabel.BackgroundTransparency = 1
	statusLabel.AnchorPoint = Vector2.new(0.5, 1)
	statusLabel.Position = UDim2.new(0.5, 0, 1, -60)
	statusLabel.Size = UDim2.new(1, 0, 0, 20)
	statusLabel.Font = Theme.BodyFont
	statusLabel.TextSize = 14
	statusLabel.TextColor3 = Color3.fromRGB(140, 76, 60)
	statusLabel.Text = ""
	statusLabel.Parent = root

	confirmButton = Instance.new("TextButton")
	confirmButton.AnchorPoint = Vector2.new(0.5, 1)
	confirmButton.Position = UDim2.new(0.5, 0, 1, -14)
	confirmButton.Size = UDim2.fromOffset(200, 40)
	confirmButton.BackgroundColor3 = Theme.Accent
	confirmButton.Font = Theme.TitleFont
	confirmButton.TextSize = 20
	confirmButton.TextColor3 = Theme.Ink
	confirmButton.Text = "Name it"
	confirmButton.Visible = false
	confirmButton.Parent = root

	local confirmCorner = Instance.new("UICorner")
	confirmCorner.CornerRadius = UDim.new(0, 8)
	confirmCorner.Parent = confirmButton

	local cancelButton = Instance.new("TextButton")
	cancelButton.AnchorPoint = Vector2.new(1, 0)
	cancelButton.Position = UDim2.new(1, -10, 0, 10)
	cancelButton.Size = UDim2.fromOffset(32, 32)
	cancelButton.BackgroundTransparency = 1
	cancelButton.Font = Theme.BodyFont
	cancelButton.TextSize = 20
	cancelButton.TextColor3 = Color3.fromRGB(96, 88, 74)
	cancelButton.Text = "x"
	cancelButton.Parent = root

	cancelButton.Activated:Connect(NamingUi.close)
	confirmButton.Activated:Connect(submit)

	-- Walking out of range closes the picker; the server would reject it anyway.
	PinState.RangeChanged:Connect(function(siteId)
		if root.Visible and currentSite and siteId ~= currentSite and not submitting then
			NamingUi.close()
		end
	end)
end

return NamingUi
