--!strict
--[[
	Cell maths and the revealed-cell bitfield.

	The grid is centred on the origin: cell (0, 0) is the far -X/-Z corner, cell
	(GridSize-1, GridSize-1) the far +X/+Z one. Indices are 1-based so they can
	be used as Luau array keys.

	The bitfield is a `buffer` of ceil(CellCount / 8) bytes — 481 bytes for the
	MVP grid, ~650 as base64. That is the whole save payload.
]]

local Config = require(script.Parent.Config)

local GRID = Config.GridSize
local CELL = Config.CellSize
local HALF_WORLD = Config.WorldSize / 2
local BYTE_COUNT = math.ceil(Config.CellCount / 8)

local Grid = {}

Grid.ByteCount = BYTE_COUNT

-- ── Coordinates ──────────────────────────────────────────────────────────────

--[[ World XZ -> cell XZ. Returns nil when the position is off the island. ]]
function Grid.worldToCell(x: number, z: number): (number?, number?)
	local cx = math.floor((x + HALF_WORLD) / CELL)
	local cz = math.floor((z + HALF_WORLD) / CELL)
	if cx < 0 or cz < 0 or cx >= GRID or cz >= GRID then
		return nil, nil
	end
	return cx, cz
end

function Grid.toIndex(cx: number, cz: number): number
	return cz * GRID + cx + 1
end

function Grid.fromIndex(index: number): (number, number)
	local zeroBased = index - 1
	return zeroBased % GRID, math.floor(zeroBased / GRID)
end

--[[ Centre of a cell in world space, on the XZ plane. ]]
function Grid.cellCenter(cx: number, cz: number): (number, number)
	return (cx + 0.5) * CELL - HALF_WORLD, (cz + 0.5) * CELL - HALF_WORLD
end

--[[
	Nearest in-bounds cell to a world position. Unlike `worldToCell` this never
	returns nil: standing in the water off the coast still maps to the cell you
	are next to, so the sweep and the haze keep working at the shoreline.
]]
function Grid.clampToCell(x: number, z: number): (number, number)
	local cx = math.clamp(math.floor((x + HALF_WORLD) / CELL), 0, GRID - 1)
	local cz = math.clamp(math.floor((z + HALF_WORLD) / CELL), 0, GRID - 1)
	return cx, cz
end

--[[
	Calls `visit(index, cx, cz)` for every cell whose centre is within `radius`
	studs of the world position. Used by the reveal sweep and the haze renderer.
]]
function Grid.forEachCellInRadius(x: number, z: number, radius: number, visit: (number, number, number) -> ())
	local cellRadius = math.ceil(radius / CELL)
	local originX, originZ = Grid.clampToCell(x, z)

	local radiusSquared = radius * radius
	for cz = originZ - cellRadius, originZ + cellRadius do
		if cz >= 0 and cz < GRID then
			for cx = originX - cellRadius, originX + cellRadius do
				if cx >= 0 and cx < GRID then
					local centerX, centerZ = Grid.cellCenter(cx, cz)
					local dx, dz = centerX - x, centerZ - z
					if dx * dx + dz * dz <= radiusSquared then
						visit(Grid.toIndex(cx, cz), cx, cz)
					end
				end
			end
		end
	end
end

-- ── Bitfield ─────────────────────────────────────────────────────────────────

function Grid.newBitfield(): buffer
	return buffer.create(BYTE_COUNT)
end

function Grid.isSet(bits: buffer, index: number): boolean
	local zeroBased = index - 1
	local byte = buffer.readu8(bits, zeroBased // 8)
	return bit32.band(byte, bit32.lshift(1, zeroBased % 8)) ~= 0
end

--[[ Sets a bit. Returns true when the bit was not already set. ]]
function Grid.set(bits: buffer, index: number): boolean
	local zeroBased = index - 1
	local offset = zeroBased // 8
	local mask = bit32.lshift(1, zeroBased % 8)
	local byte = buffer.readu8(bits, offset)
	if bit32.band(byte, mask) ~= 0 then
		return false
	end
	buffer.writeu8(bits, offset, bit32.bor(byte, mask))
	return true
end

function Grid.count(bits: buffer): number
	local total = 0
	for offset = 0, BYTE_COUNT - 1 do
		local byte = buffer.readu8(bits, offset)
		while byte ~= 0 do
			total += bit32.band(byte, 1)
			byte = bit32.rshift(byte, 1)
		end
	end
	return total
end

--[[ Charted fraction, 0..1. The `%` counter and the atlas both read this. ]]
function Grid.progress(bits: buffer): number
	return Grid.count(bits) / Config.CellCount
end

-- ── Serialisation ────────────────────────────────────────────────────────────

local BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
local DECODE: { [string]: number } = {}
for position = 1, #BASE64 do
	DECODE[string.sub(BASE64, position, position)] = position - 1
end

--[[
	DataStores store JSON, so the bitfield travels as base64 rather than raw
	bytes.
]]
function Grid.encode(bits: buffer): string
	local chunks = {}
	for offset = 0, BYTE_COUNT - 1, 3 do
		local b1 = buffer.readu8(bits, offset)
		local b2 = if offset + 1 < BYTE_COUNT then buffer.readu8(bits, offset + 1) else 0
		local b3 = if offset + 2 < BYTE_COUNT then buffer.readu8(bits, offset + 2) else 0
		local packed = bit32.bor(bit32.lshift(b1, 16), bit32.lshift(b2, 8), b3)

		for shift = 18, 0, -6 do
			local sextet = bit32.band(bit32.rshift(packed, shift), 63)
			table.insert(chunks, string.sub(BASE64, sextet + 1, sextet + 1))
		end
	end
	return table.concat(chunks)
end

--[[ Inverse of `encode`. Malformed input yields an all-zero grid. ]]
function Grid.decode(encoded: string?): buffer
	local bits = Grid.newBitfield()
	if type(encoded) ~= "string" then
		return bits
	end

	local offset = 0
	local position = 1
	while position + 3 <= #encoded and offset < BYTE_COUNT do
		local packed = 0
		for step = 0, 3 do
			local sextet = DECODE[string.sub(encoded, position + step, position + step)]
			if not sextet then
				return bits -- corrupt payload: fail closed, the player re-charts
			end
			packed = bit32.bor(bit32.lshift(packed, 6), sextet)
		end
		position += 4

		for shift = 16, 0, -8 do
			if offset < BYTE_COUNT then
				buffer.writeu8(bits, offset, bit32.band(bit32.rshift(packed, shift), 255))
				offset += 1
			end
		end
	end
	return bits
end

return Grid
