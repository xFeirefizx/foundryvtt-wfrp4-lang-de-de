
package.path = package.path .. ";luajson/?.lua"
local JSON = require"json"

local path_in  = "/home/sigmar/work/foundryvtt/WFRP-4th-Edition-FoundryVTT/packs/"
local traitsf = "/home/sigmar/work/foundryvtt/foundryvtt-wh4-lang-fr-fr/compendium/wfrp4e.traits.json"
local beastsf = "/home/sigmar/work/foundryvtt/foundryvtt-wh4-lang-fr-fr/compendium/wfrp4e.bestiary.json"
local f1 = io.open(path_in .. "bestiary.db")

local f2 = io.open(traitsf)
local strjson = f2:read("*a")
f2:close()
local traits = JSON.decode(strjson)

local f3 = io.open(beastsf)
local beastjson = f3:read("*a")
f3:close()
local beast_french = JSON.decode(beastjson)

local function trim1(s)
   return (s:gsub("^%s*(.-)%s*$", "%1"))
end

local SIZE2FR = { Size = "Taille",
                   Tiny = "Minuscule",
                   Little =  "Très petite",
                   Small = "Petit",
                   Average = "Moyenne",
                   Large =  "Grande",
                   Enormous =  "Enorme",
                  Monstrous = "Monstrueuse",
                  Difficulty = "Difficulté",
                  Everything = "Tout",
                  Moderate= "Modéré",
                  Major= "Majeur",
                  Minor= "Mineur",
                  Greenskins= "Peaux vertes",
                  Challenging= "Intermédiaire",
                  Elves = "Elfes",
                 }

local table
local line = f1:read()
while line do 
  --print(line)
  local beast = JSON.decode( line) 
  -- Get the french beast translation
  local sel_beastfr
  for _, beastfr in pairs(beast_french.entries) do 
    print("Testing", beastfr.name)
    if beast.name:lower() == beastfr.id:lower() then 
      sel_beastfr = beastfr
      break
    end
  end
  if not sel_beastfr then print(">>>>>>>>>>>>>>> NO BEAST !!!", beast.name) end
  
  local uniq = io.open(beast.name .. ".json", "w+")
  uniq:write(line)
  uniq:close()
  
  --print(beast.name, beast.items)
  if beast.items then 
    local myitems = {}
    for _, traitbeast in pairs( beast.items) do 
      if traitbeast.name then 
        print(beast.name, traitbeast.name)
        local found, ntentacle = false
        local name, bonus_or_category = traitbeast.name:match("([%w%s]+)%s%(([%s%w]+)%)")
        if not name then ntentacle, name  = traitbeast.name:match("(%d)x%s*(Tentacles)") end
        if not name then name = traitbeast.name end
        for _, traitdata in pairs(traits.entries) do 
          if traitdata.id == trim1(name) then    
            found = true
            --local newtrait = { }
            traitbeast.id = trim1(traitbeast.name)
            traitbeast.name = trim1(traitdata.name)
            if traitbeast.data.biography then 
              traitbeast.data.biography.value = traitdata.description
            end
            if SIZE2FR[traitbeast.data.specification.value] then 
              traitbeast.data.specification.value = SIZE2FR[traitbeast.data.specification.value]
            end
            print("    Found trait " .. traitdata.name)
            --newtrait.specification = traitbeast.data.specification.value
            --myitems[#myitems+1] = newtrait
            break
          end
        end
        if not found then 
          print("    > NOT FOUND !!!", beast.name, name, traitbeast.name)
        end
      end
    end    
    sel_beastfr.items = beast.items
    --sel_beastfr.items = myitems 
    --sel_beastfr.items = nil
  end
  line = f1:read()
end
f1:close()

local jsonout = JSON.encode( beast_french ) 
local fout = io.open("beasts.json", "w+")
fout:write( jsonout )
fout:close()


