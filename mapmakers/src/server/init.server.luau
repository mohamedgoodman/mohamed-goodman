--!strict
--[[
	Server entry point. Rojo syncs this folder to ServerScriptService.Server, so
	this script runs once at start-up.

	Order matters: the world exists before pin sites are raycast onto it, and
	profiles load before anything writes to them.
]]

local PinService = require(script.PinService)
local RevealService = require(script.RevealService)
local SaveService = require(script.SaveService)
local TerrainBuilder = require(script.TerrainBuilder)
local WorldBuilder = require(script.WorldBuilder)

TerrainBuilder.buildIfEmpty()
WorldBuilder.build()

SaveService.start()
RevealService.start()
PinService.start()

print("[MAPMAKERS] server ready")
