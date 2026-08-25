--!strict
--[[
	Client entry point. Rojo syncs this folder to
	StarterPlayer.StarterPlayerScripts.Client.

	The client only ever renders what the server told it: the reveal grid, the
	pins, and the UI over both.
]]

local Players = game:GetService("Players")

local AtlasUi = require(script.AtlasUi)
local HazeRenderer = require(script.HazeRenderer)
local Hud = require(script.Hud)
local NamingUi = require(script.NamingUi)
local PinMarkers = require(script.PinMarkers)
local PinState = require(script.PinState)
local RevealState = require(script.RevealState)

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "Mapmakers"
screenGui.ResetOnSpawn = false
screenGui.IgnoreGuiInset = true
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

-- State first: the UI reads from it as soon as the first packet lands.
RevealState.start()
PinState.start()

AtlasUi.build(screenGui)
NamingUi.build(screenGui)
Hud.start(screenGui)

HazeRenderer.start()
PinMarkers.start()
