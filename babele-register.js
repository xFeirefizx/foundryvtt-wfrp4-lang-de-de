class ActorWfrp4e_fr extends ActorWfrp4e {
 
  /**
   * Calculates a weapon's range or damage formula.
   * 
   * Takes a weapon formula for Damage or Range (SB + 4 or SBx3) and converts to a numeric value.
   * 
   * @param {String} formula formula to be processed (SBx3 => 9).
   * 
   * @return {Number} Numeric formula evaluation
   */
  calculateRangeOrDamage(formula)
  {
    //console.log("FR function calculateRangeOrDamage !", formula);
    let actorData = this.data
    try 
    {
      formula = formula.toLowerCase();
      // Iterate through characteristics
      for(let ch in actorData.data.characteristics)
      {
        // Determine if the formula includes the characteristic's abbreviation + B (SB, WPB, etc.)
        if (formula.includes(ch.concat('b')))
        {
          // Replace that abbreviation with the Bonus value
          formula = formula.replace(ch.concat('b'), actorData.data.characteristics[ch].bonus.toString());
        }
      }
      if (formula.includes("yard") )
        formula = formula.replace('yard', "mètre" );
      if (formula.includes("yds") )
        formula = formula.replace('yds', "m." );
      // To evaluate multiplication, replace x with *
      formula = formula.replace('x', '*');

      return eval(formula);
    }
    catch 
    {
      return formula
    }
  }
  
/**
   * Turns a formula into a processed string for display
   * 
   * Processes damage formula based - same as calculateSpellAttributes, but with additional
   * consideration to whether its a magic missile or not
   * 
   * @param   {String}  formula         Formula to process - "Willpower Bonus + 4" 
   * @param   {boolean} isMagicMissile  Whether or not it's a magic missile - used in calculating additional damage
   * @returns {String}  Processed formula
   */
  calculateSpellDamage(formula, isMagicMissile)
  {
    let actorData = this.data
    formula = formula.toLowerCase();

    if (isMagicMissile) // If it's a magic missile, damage includes willpower bonus
    {
      formula += "+ " + actorData.data.characteristics["wp"].bonus
    }

    // Specific case, to avoid wrong matching with "Force"
    if (formula.includes("force mentale")) 
    {
      // Determine if it's looking for the bonus or the value
      if (formula.includes('bonus'))
        formula = formula.replace( "bonus de force mentale",  );
      else
        formula = formula.replace("force mentale",  actorData.data.characteristics["wp"].value);
    }
  
    // Iterate through characteristics
    for(let ch in actorData.data.characteristics)
    { 
      // If formula includes characteristic name
      while (formula.includes(actorData.data.characteristics[ch].label.toLowerCase()))
      {
        // Determine if it's looking for the bonus or the value
        if (formula.includes('bonus'))
          formula = formula.replace("bonus de " + WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].bonus);
        else
          formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].value);
      }
    }
    
    //console.log("calculateSpellDamage -> " + formula );
    return eval(formula);
  }  
  
  /**
   * Turns a formula into a processed string for display
   * 
   * Turns a spell attribute such as "Willpower Bonus Rounds" into a more user friendly, processed value
   * such as "4 Rounds". If the aoe is checked, it wraps the result in AoE (Result).
   * 
   * @param   {String}  formula   Formula to process - "Willpower Bonus Rounds" 
   * @param   {boolean} aoe       Whether or not it's calculating AoE (changes string return)
   * @returns {String}  formula   processed formula
   */
  calculateSpellAttributes(formula, aoe=false)
  {
    let actorData = this.data
    formula = formula.toLowerCase();

    // Do not process these special values
    if (formula != game.i18n.localize("Vous").toLowerCase() && formula != game.i18n.localize("Special").toLowerCase() && formula != game.i18n.localize("Instantané").toLowerCase())
    {
      // Specific case, to avoid wrong matching with "Force"
      if (formula.includes("force mentale")) 
      {
        // Determine if it's looking for the bonus or the value
        if (formula.includes('bonus'))
          formula = formula.replace( "bonus de force mentale",  actorData.data.characteristics["wp"].bonus);
        else
          formula = formula.replace("force mentale",  actorData.data.characteristics["wp"].value);
      }
      if (formula.includes("yard") )
        formula = formula.replace('yard', "mètre" );
      if (formula.includes("yds") )
        formula = formula.replace('yds', "m." );
      // Iterate through remaining characteristics
      for(let ch in actorData.data.characteristics)
      {
        // If formula includes characteristic name
        //console.log("Testing :", ch, WFRP4E.characteristics[ch].toLowerCase());
        if (formula.includes(WFRP4E.characteristics[ch].toLowerCase()))
        {
          // Determine if it's looking for the bonus or the value
          if (formula.includes('bonus'))
            formula = formula.replace("bonus de " + WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].bonus);
          else
            formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].value);
        }
      }
    }

    // If AoE - wrap with AoE ( )
    if (aoe)
      formula = "AoE (" + formula.capitalize() + ")";
    
    //console.log("calculateSpellAttributes -> " + formula );
    return formula.capitalize();
  }

}


Hooks.once('init', () => {
  
  // Replace to manage specific bonuses/char. computations
  CONFIG.Actor.entityClass = ActorWfrp4e_fr;
  WFRP4E.talentBonuses = {
        "perspicace": "int",
        "affable": "fel",
        "tireur de précision": "bs",
        "très fort": "s",
        "vivacité": "i",
        "reflexes foudroyants": "ag",
        "imperturbable": "wp",
        "très résistant": "t",
        "doigts de fée": "dex",
        "guerrier né": "ws"
  }


  if(typeof Babele !== 'undefined') {
		
		Babele.get().register({
			module: 'WH4-fr-translation',
			lang: 'fr',
			dir: 'compendium'
		});
    
    Babele.get().registerConverters({
      "career_skills": (skills_list) => {
        var compendium = game.packs.find(p => p.collection === 'wfrp4e.skills');
        //console.log( "Thru here ...", compendium, skills_list);
        var i;
        var len = skills_list.length;
        var re  = /(.*)\((.*)\)/i;
        for (i = 0; i < len; i++) {
          var transl = compendium.i18nName( { name: skills_list[i] } );
          //console.log("List ...", skills_list[i]);
          if ( transl == skills_list[i] ) {            
            var res = re.exec( skills_list[i]);
            if (res) { 
              //console.log("Matched/split:", res[1], res[2]);
              var subword = game.i18n.localize(res[2].trim() );
              var s1 = res[1].trim() + " ()";
              var translw = compendium.i18nName( { name: s1} );              
              if (translw != s1) {
                var res2 = re.exec(translw);
                transl = res2[1] + "(" + subword  + ")";
              } else {
                s1 = res[1].trim() + " ( )";
                translw = compendium.i18nName( { name: s1} );
                var res2 = re.exec(translw);
                transl = res2[1] + "(" + subword  + ")";
              }  
            }
          }
          skills_list[i] = transl;
        }
        return skills_list;      
      },
      "career_talents": (talents_list) => { 
        var compendium = game.packs.find(p => p.collection === 'wfrp4e.talents');
        var i;
        var len = talents_list.length;
        var re  = /(.*)\((.*)\)/i;
        for (i = 0; i < len; i++) {
          var transl = compendium.i18nName( { name: talents_list[i]} );
          if ( transl == talents_list[i] ) {            
            var res = re.exec( talents_list[i]);
            if (res) { 
              //console.log("Matched/split:", res[1], res[2]);
              var subword = game.i18n.localize(res[2].trim() );
              var s1 = res[1].trim(); // No () in talents table
              var translw = compendium.i18nName( { name: s1 } );
              if (translw != s1) {
                transl = translw + "(" + subword  + ")";
              } else {
                s1 = res[1].trim() + " ( )";
                translw = compendium.i18nName( { name: s1 } );
                var res2 = re.exec(translw);
                transl = res2[1] + "(" + subword  + ")";
              }  
            }
          }
          talents_list[i] = transl;
        }
        return talents_list;      
      },
      "bestiary_traits": (value) => {
        console.log("Traits converter is calle d!!!!");
      },
      // To avoid duplicateing class for all careers
      "generic_localization": (value) => { 
        if ( value )
          return game.i18n.localize( value.trim() );
      },      
      "trapping_qualities_flaws": (value) => {
        if ( value ) { 
          var list = value.split( "," );
          var i=0;
          var re  = /(.*) (\d+)/i;        
          for (i=0; i<list.length; i++) {
            var splitted = re.exec( list[i].trim() );
            if ( splitted ) {
              //console.log("FOund:", splitted[0], splitted[1], splitted[2] );
              list[i] = game.i18n.localize( splitted[1] ) + " " + splitted[2];
            } else { 
              list[i] = game.i18n.localize( list[i].trim() ) ;
            }
          }
          return list.toString();
        }
      },
      // Search back in careers the translated name of the groupe (as it is the name of the level career itself)
      "career_careergroup": (value) => { 
        var compendium = game.packs.find(p => p.collection === 'wfrp4e.careers');
        return compendium.i18nName( { name: value } );
      },
      // Auto-translate duration
      "spells_duration_range_target_damage": (value) => {
        //console.log("Spell duration/range/damage/target :", value);
        if ( value == "" ) return ""; // Hop !
        if ( value == "Touch" ) return "Contact"; // Hop !
        if ( value == "You" ) return "Vous"; // Hop !        
        if ( value == "Instant" ) return "Instantané"; // Hop !
        var translw = value;
        var re  = /(.*) Bonus (\w*)/i;
        var res = re.exec( value );
        var unit = "";
        if ( res ) { // Test "<charac> Bonus <unit>" pattern
          if ( res[1] ) { // We have char name, then convert it
            translw = "Bonus de " + game.i18n.localize(  res[1].trim()  );
          }           
          unit = res[2];
        } else { 
          re = /(\d+) (\w+)/i;
          res = re.exec( value );
          if (res) { // Test : "<number> <unit>" pattern
            translw  = res[1];
            unit = res[2];
          } else { // Test 
            re = /(\w+) (\w+)/i;
            res = re.exec( value );
            if (res) { // Test : "<charac> <unit>" pattern
              translw  = game.i18n.localize( res[1].trim() );
              unit = res[2];
            } 
          }
        } 
        if ( unit == "hour") unit = "heure";
        if ( unit == "hours") unit = "heures";
        if ( unit == "days") unit = "jours";            
        if ( unit == "yard") unit = "mètre";            
        if ( unit == "yards") unit = "mètres";            
        translw += " " + unit;
        return translw; 
      }
    });      
  }
  
} );

