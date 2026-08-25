--!strict
--[[
	The naming vocabulary. 12 adjectives x 12 nouns = 144 pre-reviewed names,
	zero free text — the client sends indices, never strings.
]]

local WordBank = {}

WordBank.Adjectives = table.freeze({
	"Silver", "Hollow", "Old", "Quiet", "Bright", "Cold",
	"Far", "Grey", "Long", "Deep", "Still", "Wild",
})

WordBank.Nouns = table.freeze({
	"Hollow", "Ridge", "Water", "Stone", "Reach", "Fall",
	"Bend", "Pass", "Rise", "Mere", "Crag", "Wood",
})

--[[
	Returns the name for a pair of indices, or nil when either index is out of
	range. The server treats nil as a rejected request.
]]
function WordBank.resolve(adjectiveIndex: number, nounIndex: number): string?
	local adjective = WordBank.Adjectives[adjectiveIndex]
	local noun = WordBank.Nouns[nounIndex]
	if not adjective or not noun then
		return nil
	end
	return `{adjective} {noun}`
end

return WordBank
