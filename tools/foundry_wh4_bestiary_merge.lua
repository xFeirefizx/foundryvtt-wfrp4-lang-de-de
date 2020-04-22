
package.path = package.path .. ";luajson/?.lua"
local JSON = require"json"

local beastref_f   = "../compendium/wfrp4e.bestiary.json"
local beastdescr_f = "compendium_wfrp4e.bestiary.json"

local f1 = io.open(beastref_f)
local strjson = f1:read("*a")
local beastref = JSON.decode(strjson)

local f2 = io.open(beastdescr_f)
strjson = f2:read("*a")
f2:close()
local beastdescr = JSON.decode(strjson)


for _, beasttext in pairs(beastdescr.entries) do 
  for _, beastgood in pairs(beastref.entries) do 
    if beasttext.id == beastgood.id then 
      beastgood.description = beasttext.description
    end
  end
end

local jsonout = JSON.encode( beastref ) 
local fout = io.open("beasts.json", "w+")
fout:write( jsonout )
fout:close()
