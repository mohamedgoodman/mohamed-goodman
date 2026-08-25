--!strict
--[[
	The atlas: one screen, one button. A top-down render of the cells this
	player has charted, the six pin names, and the percentage.

	The map is redrawn only when the atlas opens, and horizontal runs of charted
	cells collapse into a single Frame — a fully charted island costs 62 frames
	instead of 3,844.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Grid = require(Shared:WaitForChild("Grid"))
local PinState = require(script.Parent.PinState)
local RevealState = require(script.Parent.RevealState)
local Theme = require(script.Parent.Theme)

local MAP_PIXELS = 420

local AtlasUi = {}

local root: Frame
local mapFrame: Frame
local pinList: ScrollingFrame
local progressLabel: TextLabel

local function drawMap()
	mapFrame:ClearAllChildren()

	local cellPixels = MAP_PIXELS / Config.GridSize

	for cz = 0, Config.GridSize - 1 do
		local runStart: number? = nil

		for cx = 0, Config.GridSize do -- one past the edge closes the last run
			local charted = cx < Config.GridSize and RevealState.isRevealed(Grid.toIndex(cx, cz))

			if charted and not runStart then
				runStart = cx
			elseif not charted and runStart then
				local run = Instance.new("Frame")
				run.BorderSizePixel = 0
				run.BackgroundColor3 = Theme.Charted
				run.Position = UDim2.fromOffset(math.floor(runStart * cellPixels), math.floor(cz * cellPixels))
				run.Size = UDim2.fromOffset(math.ceil((cx - runStart) * cellPixels), math.ceil(cellPixels))
				run.Parent = mapFrame
				runStart = nil
			end
		end
	end

	for _, pin in PinState.getPins() do
		if pin.name then
			local cx, cz = Grid.worldToCell(pin.position.X, pin.position.Z)
			if cx and cz then
				local dot = Instance.new("Frame")
				dot.BorderSizePixel = 0
				dot.BackgroundColor3 = Theme.Accent
				dot.AnchorPoint = Vector2.new(0.5, 0.5)
				dot.Position = UDim2.fromOffset(
					math.floor((cx + 0.5) * cellPixels),
					math.floor((cz + 0.5) * cellPixels)
				)
				dot.Size = UDim2.fromOffset(8, 8)
				dot.ZIndex = 2
				dot.Parent = mapFrame

				local corner = Instance.new("UICorner")
				corner.CornerRadius = UDim.new(1, 0)
				corner.Parent = dot
			end
		end
	end
end

local function drawPins()
	for _, child in pinList:GetChildren() do
		if child:IsA("TextLabel") then
			child:Destroy()
		end
	end

	for index, pin in PinState.getPins() do
		local label = Instance.new("TextLabel")
		label.LayoutOrder = index
		label.BackgroundTransparency = 1
		label.Size = UDim2.new(1, -8, 0, 30)
		label.Font = Theme.TitleFont
		label.TextSize = 17
		label.TextXAlignment = Enum.TextXAlignment.Left
		label.RichText = true

		if pin.name then
			label.TextColor3 = Theme.Ink
			label.Text = `{pin.name}  <font size="13" color="#6a6254">— {pin.by}</font>`
		else
			label.TextColor3 = Color3.fromRGB(150, 142, 126)
			label.Text = "unnamed"
		end
		label.Parent = pinList
	end
end

local function redraw()
	progressLabel.Text =
		`{string.format("%.1f", RevealState.getProgress() * 100)}% charted  ·  {PinState.countCharted()}/{#Config.PinSites} named`
	drawMap()
	drawPins()
end

function AtlasUi.toggle()
	root.Visible = not root.Visible
	if root.Visible then
		redraw()
	end
end

function AtlasUi.build(screenGui: ScreenGui)
	root = Instance.new("Frame")
	root.Name = "Atlas"
	root.AnchorPoint = Vector2.new(0.5, 0.5)
	root.Position = UDim2.fromScale(0.5, 0.5)
	root.Size = UDim2.fromOffset(760, 500)
	root.BackgroundColor3 = Theme.Parchment
	root.Visible = false
	root.Parent = screenGui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = root

	local title = Instance.new("TextLabel")
	title.BackgroundTransparency = 1
	title.Position = UDim2.fromOffset(24, 14)
	title.Size = UDim2.fromOffset(300, 30)
	title.Font = Theme.TitleFont
	title.TextSize = 24
	title.TextXAlignment = Enum.TextXAlignment.Left
	title.TextColor3 = Theme.Ink
	title.Text = "Atlas"
	title.Parent = root

	progressLabel = Instance.new("TextLabel")
	progressLabel.BackgroundTransparency = 1
	progressLabel.Position = UDim2.fromOffset(24, 44)
	progressLabel.Size = UDim2.fromOffset(400, 22)
	progressLabel.Font = Theme.BodyFont
	progressLabel.TextSize = 15
	progressLabel.TextXAlignment = Enum.TextXAlignment.Left
	progressLabel.TextColor3 = Color3.fromRGB(96, 88, 74)
	progressLabel.Text = ""
	progressLabel.Parent = root

	local mapBackground = Instance.new("Frame")
	mapBackground.Position = UDim2.fromOffset(24, 72)
	mapBackground.Size = UDim2.fromOffset(MAP_PIXELS, MAP_PIXELS)
	mapBackground.BackgroundColor3 = Theme.Uncharted
	mapBackground.BorderSizePixel = 0
	mapBackground.ClipsDescendants = true
	mapBackground.Parent = root

	mapFrame = Instance.new("Frame")
	mapFrame.BackgroundTransparency = 1
	mapFrame.Size = UDim2.fromScale(1, 1)
	mapFrame.Parent = mapBackground

	local pinHeading = Instance.new("TextLabel")
	pinHeading.BackgroundTransparency = 1
	pinHeading.Position = UDim2.fromOffset(470, 72)
	pinHeading.Size = UDim2.fromOffset(260, 22)
	pinHeading.Font = Theme.BodyFont
	pinHeading.TextSize = 15
	pinHeading.TextXAlignment = Enum.TextXAlignment.Left
	pinHeading.TextColor3 = Color3.fromRGB(96, 88, 74)
	pinHeading.Text = "places you have named"
	pinHeading.Parent = root

	pinList = Instance.new("ScrollingFrame")
	pinList.BackgroundTransparency = 1
	pinList.BorderSizePixel = 0
	pinList.Position = UDim2.fromOffset(470, 98)
	pinList.Size = UDim2.fromOffset(266, MAP_PIXELS - 26)
	pinList.CanvasSize = UDim2.new()
	pinList.AutomaticCanvasSize = Enum.AutomaticSize.Y
	pinList.ScrollBarThickness = 4
	pinList.Parent = root

	local layout = Instance.new("UIListLayout")
	layout.Padding = UDim.new(0, 4)
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Parent = pinList

	local closeButton = Instance.new("TextButton")
	closeButton.AnchorPoint = Vector2.new(1, 0)
	closeButton.Position = UDim2.new(1, -10, 0, 10)
	closeButton.Size = UDim2.fromOffset(32, 32)
	closeButton.BackgroundTransparency = 1
	closeButton.Font = Theme.BodyFont
	closeButton.TextSize = 20
	closeButton.TextColor3 = Color3.fromRGB(96, 88, 74)
	closeButton.Text = "x"
	closeButton.Parent = root

	closeButton.Activated:Connect(function()
		root.Visible = false
	end)
end

return AtlasUi
