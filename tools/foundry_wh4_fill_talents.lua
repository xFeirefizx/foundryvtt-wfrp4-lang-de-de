
package.path = package.path .. ";luajson/?.lua"
local JSON = require"json"

local talent_db  = "../../WFRP-4th-Edition-FoundryVTT/packs/talents.db"
local talent = "../compendium/wfrp4e.talents.json"

local f1 = io.open(talent_db)

local f2 = io.open(talent)
local strjson = f2:read("*a")
f2:close()
local talents = JSON.decode(strjson)

local function trim1(s)
   return (s:gsub("^%s*(.-)%s*$", "%1"))
end

local line = f1:read()
while line do 
  --print(line)
  local db_talent = JSON.decode( line) 
  
  for _, mytalent in pairs(talents.entries) do     
    if mytalent.id == db_talent.name then 
      mytalent.tests = db_talent.data.tests.value
    end
  end
  
  line = f1:read()
end
f1:close()

local jsonout = JSON.encode( talents ) 
local fout = io.open("talents.json", "w+")
fout:write( jsonout )
fout:close()
