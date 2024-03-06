
const _module_id = 'fux-dice-roller';  // modules true name(id)
export async function RollFuxDice(actiondice, dangerdice) {
    if (actiondice == 0 && dangerdice == 0) {
      //no dice, abort
      return;
    }

    let hardmode = game.settings.get(_module_id, 'OPTION_HARD_MODE');
    let roll_mode = game.settings.get(_module_id, 'OPTION_ROLL_MODE');
    let botch_value = game.settings.get(_module_id, 'OPTION_BOTCH_VALUE');

    // reduce dice if FU Classic
    if (roll_mode == 0) {
      // 5a, 3d => 2a
      // 2a, 3d => 1d
      // 2a, 2d => 
      if (dangerdice == actiondice) {
        actiondice = 0;
        dangerdice = 2;

      } else if (dangerdice > actiondice) {
        // more penalty than bonus

        dangerdice = dangerdice - actiondice + 2;
        actiondice = 0;
      } else if (actiondice > dangerdice) {
        // bonus is reduced by penalty
        actiondice = actiondice - dangerdice;
        dangerdice = 0;
      }

    }
    // roll dice
    let actiondiceresults = await new Roll(actiondice + "d6").roll({async: true});
    let dangerdiceresults = await new Roll(dangerdice + "d6").roll({async: true});
    // prepare result array
    let arrFinals = [0, 0, 0, 0, 0, 0];  // array for result counts, slot corresponds to face value 1- 6
    // action dice
    let actionresult = '';
    let actionssorted = [];
    if (actiondiceresults.terms[0].results.length > 0) {
      for (let i = 0; i < actiondiceresults.terms[0].results.length; i++) {
        // increment finals
        arrFinals[actiondiceresults.terms[0].results[i].result - 1] = arrFinals[actiondiceresults.terms[0].results[i].result - 1] + 1;
        actionssorted.push(actiondiceresults.terms[0].results[i].result);
      }
    }
    // sort action results
    actionssorted.sort(function (a, b) {
      return a - b;
    });
    // build result string for action dice
    for (let i = 0; i < actionssorted.length; i++) {
      if (i == 0) {
        actionresult = '<img src="modules/fux-dice-roller/images/actiondie_value_' + actionssorted[i] + '.png" style="margin-top:-3px;margin-left:2px;">';
      } else {
        actionresult = actionresult + '' + '<img src="modules/fux-dice-roller/images/actiondie_value_' + actionssorted[i] + '.png" style="margin-top:-3px;margin-left:2px;">';
      }
    }
    //danger dice
    let dangerresult = '';
    let dangersorted = [];
    if (dangerdiceresults.terms[0].results.length > 0) {
      for (let i = 0; i < dangerdiceresults.terms[0].results.length; i++) {
        // dec finals
        if (hardmode) {
          // In hard mode each Danger die cancels all Action dice with a matching value. 
          arrFinals[dangerdiceresults.terms[0].results[i].result - 1] = 0;
        } else {
          arrFinals[dangerdiceresults.terms[0].results[i].result - 1] = arrFinals[dangerdiceresults.terms[0].results[i].result - 1] - 1;
        }
        dangersorted.push(dangerdiceresults.terms[0].results[i].result);
      }
    }
    // sort danger result
    dangersorted.sort(function (a, b) {
      return a - b;
    });
    // build result string for danger dice
    for (let i = 0; i < dangersorted.length; i++) {
      if (i == 0) {
        dangerresult = '<img src="modules/fux-dice-roller/images/dangerdie_value_' + dangersorted[i] + '.png" style="margin-top:0px;margin-left:2px;">';
      } else {
        dangerresult = dangerresult + '' + '<img src="modules/fux-dice-roller/images/dangerdie_value_' + dangersorted[i] + '.png" style="margin-top:0px;margin-left:2px;">';
        ;
      }
    }
    // find highest remaining positive in finals
    let highest = 0;
    for (let i = 0; i < 6; i++) {
      if (arrFinals[i] > 0) {
        highest = i + 1;
      }
    }
    let oracle = '';
    let boons = 0;
    let botches = 0;
    let rollvalue = 0;
    let hascrit = false;
    let hasfumble = false
    let submsg = '';
    let flavortext = '';
    if (roll_mode == 0) {
      // classic fu
      flavortext = 'Beating the Odds';
      let option_matchingdice = game.settings.get(_module_id, 'OPTION_FU_CLASSIC_MATCHING_DICE');

      if (actiondice == 0) {
        // use lowest
        // used for fu classic    
        let lowestdangerdice = 0;
        if (dangersorted.length > 0) {
          lowestdangerdice = dangersorted[0];
          rollvalue = lowestdangerdice;
          if (option_matchingdice) {
            let matchingdice = 0;
            // now look for extra failure(matching dice)
            for (let i = 0; i < dangersorted.length; i++) {
              if (dangersorted[i] == lowestdangerdice) {
                matchingdice = matchingdice + 1;
                if (matchingdice > 1) {
                  if (rollvalue > 1) {
                    rollvalue = rollvalue - 1;
                  } else {
                    botches = botches + 1;
                  }
                }
              }
            }
          }
        }
      } else {
        // use highest action dice
        rollvalue = highest;
        // now look for boons(matching dice)
        if (option_matchingdice) {
          let matchingdice = 0;
          // now look for extra success(matching dice)
          for (let i = 0; i < actionssorted.length; i++) {
            if (actionssorted[i] == highest) {
              matchingdice = matchingdice + 1;
              if (matchingdice > 1) {
                if (rollvalue < 6) {
                  rollvalue = rollvalue + 1;
                } else {
                  boons = boons + 1;
                }
              }
            }
          }
        }
      }
      submsg = 'Result: ' + rollvalue;
      switch (rollvalue) {
        case 0:
        // this should never happen in FU classic          
        case 1:
          oracle = 'NO AND...';
          if (botches > 0) {
            hasfumble = true;
            submsg = submsg + ' + ' + botches + '(Botch(es)) ';
          }
          break;
        case 2:
          oracle = 'NO';
          break;
        case 3:
          oracle = 'NO BUT...';
          break;
        case 4:
          oracle = 'YES BUT...';
          break;
        case 5:
          oracle = 'YES';
          break;
        case 6:
          oracle = 'YES AND...';
          if (boons > 0) {
            hascrit = true;
            submsg = submsg + ' + ' + boons + '(Boon(s)) ';
          }
          break;
      }
    } else if (roll_mode >= 2) {
      // use the oracle from ActionTales(Neon City Overdrive) 
      flavortext = 'The Check returned';
      // use highest action dice
      rollvalue = highest;
      submsg = 'Result: ' + rollvalue;
      switch (rollvalue) {
        // in NCO BOTCH: If all the action dice have been canceled out, or the only remaining 
        // action dice are 1’s, you have critically failed. Things have gone very wrong and 
        // the consequences will be terrible.
        case 0:
        case 1:
          oracle = 'BOTCH';
          hasfumble = true;
          submsg = 'Result: ' + botch_value;
          break;
        case 2:
        case 3:
          oracle = 'FAILURE';
          break;
        case 4:
        case 5:
          oracle = 'PARTIAL SUCCESS';
          break;
        case 6:
          oracle = 'SUCCESS';
          // check for boon
          boons = arrFinals[5] - 1;
          if (boons > 0) {
            hascrit = true;
            submsg = submsg + ' + ' + boons + '(Boon(s)) ';
          }
          break;
      }
    } else {
      // Standard FU2 oracle
      flavortext = 'The Oracle answered';
      rollvalue = highest;
      submsg = 'Result: ' + rollvalue;
      switch (rollvalue) {
        // In FU2 Botch: if all the ( are cancelled, 
        // the result counts as a roll of “1”.
        case 0:
          oracle = 'BOTCH';
          hasfumble = true;
          submsg = 'Result: ' + botch_value;
          break;
        case 1:
          oracle = 'NO AND...';
          break;
        case 2:
          oracle = 'NO';
          break;
        case 3:
          oracle = 'NO BUT...';
          break;
        case 4:
          oracle = 'YES BUT...';
          break;
        case 5:
          oracle = 'YES';
          break;
        case 6:
          oracle = 'YES AND...';
          // check for boon
          boons = arrFinals[5] - 1;
          if (boons > 0) {
            hascrit = true;
            submsg = submsg + ' + ' + boons + '(Boon(s)) ';
          }
          break;
      }
    }
    //
    // rolling and calcultion complete, now for result display
    //
    let rolldice = '';
    let publicmode=false;
    let blindmode = false;
    let privatemode=false;
    let gmmode=false;
    let selfmode=false;
    let rolltype = document.getElementsByClassName("roll-type-select");
    let rtypevalue = rolltype[0].value;
    let rvalue = CONST.CHAT_MESSAGE_TYPES.OTHER;
    switch (rtypevalue) {      //roll, gmroll,blindroll,selfroll
      case CONST.DICE_ROLL_MODES.PUBLIC:
        publicmode=true;
        break;
      case CONST.DICE_ROLL_MODES.PRIVATE:
        gmmode = true;
        privatemode=true;
        rvalue = 1;
        break;
      case CONST.DICE_ROLL_MODES.BLIND:
        rvalue = 1;
        blindmode = true;
        gmmode = true;
        break;
      case CONST.DICE_ROLL_MODES.SELF:
        selfmode=true;
        break;
      default:
    }
    
    // now if the module dice-so-nice is activated
    if (game.dice3d != null) {            
      //dynamic builing dice rolls for d3
      let dice3dice=[];      
      for (let i = 0; i < actionssorted.length; i++) {
        let dieresult={
          result: actionssorted[i],
          resultLabel: actionssorted[i],
          type: "d6",
          vectors: [],
          options: {colorset:"white"}
        };
        dice3dice.push(dieresult);
      }
      for (let i = 0; i < dangersorted.length; i++) {
        let dieresult={
          result: dangersorted[i],
          resultLabel: dangersorted[i],
          type: "d6",
          vectors: [],
          options: {colorset:"black"}
        };
        dice3dice.push(dieresult);
      }                  
      let dice3ddata= {
        throws: [{
            dice:dice3dice 
          }]
      };
      
      let user=game.user;
      //;
      let synchronize=false;
      let whisper;
      let blind = false;
      
      if(publicmode){
        synchronize=true;
      }
      
      if(privatemode){
        synchronize=true;
        whisper=ChatMessage.getWhisperRecipients('GM');
      }
      if (blindmode){
        blind=true;
        synchronize=true;
        whisper=ChatMessage.getWhisperRecipients('GM');
      }
      
      if(selfmode){
        synchronize=false;
      }
      
      // always show for gm
      if (game.user.isGM) {
        blind = false;
      }
      await game.dice3d.show(dice3ddata, user, synchronize, whisper, blind)
    }
    
    let msgimg;
    let msgname;
    if (game.user.character != null) {
      msgimg = game.user.character.data.img;
      msgname = game.user.character.data.name;
    } else {
      msgimg = game.user.avatar;
      msgname = game.user.name;
    }
    // determine running system    
    let runningsystemname = game.system.data.name; // sandbox
    if (runningsystemname == 'sandbox') {
      // special handling for sandbox    
      let rollData = {
        token: {
          img: msgimg,
          name: msgname
        },
        actor: msgname,
        flavor: flavortext,
        formula: '',
        mod: '',
        result: oracle,
        user: game.user.name,
        conditional: submsg,
        iscrit: hascrit,
        isfumble: hasfumble,
        blind: blindmode,
        action: actionresult,
        danger: dangerresult,
        summary: submsg + ' => ' + oracle
      };

      renderTemplate("modules/fux-dice-roller/templates/fux-dice-roller-chatmsg-sandbox.hbs", rollData).then(html => {
        let messageData = {
          content: html,
          type: rvalue,
          blind: blindmode
        };
        if (rtypevalue == CONST.DICE_ROLL_MODES.PRIVATE || rtypevalue == CONST.DICE_ROLL_MODES.BLIND) {
          messageData.whisper = ChatMessage.getWhisperRecipients('GM');
        } else if (rtypevalue == CONST.DICE_ROLL_MODES.SELF) {
          // whisper to self  
          messageData.whisper = ChatMessage.getWhisperRecipients(game.user.name);
        }
        let newmessage = ChatMessage.create(messageData);
      });
    } else {
      // ----------------
      // any other system
      // ----------------
      let actionrolls=[];
      let dangerrolls=[];
      
      for (let i = 0; i < actionssorted.length; i++) {
        let dieresult={
          classes:'die d6',
          result: actionssorted[i]
        };
        actionrolls.push(dieresult);
      }
      for (let i = 0; i < dangersorted.length; i++) {
        let dieresult={
          classes:'die d6',
          result: dangersorted[i]
        };
        dangerrolls.push(dieresult);
      }                   
      let parts=[
        {
          faces:6,
          flavor:'white',
          formula:'Action Dice',
          rolls:actionrolls,
          total:actiondice
        },
        {
          faces:6,
          flavor:'black',
          formula:'Danger Dice',
          rolls:dangerrolls,
          total:dangerdice
        }
      ];
      
      let rollData = {
        token: {
          img: msgimg,
          name: msgname
        },
        actor: msgname,
        flavor: flavortext,
        formula: submsg,
        total:oracle ,
        parts:parts,
        
        mod: '',
        result: oracle ,
        user: game.user.name,
        conditional: submsg,
        iscrit: hascrit,
        isfumble: hasfumble,
        blind: blindmode,
        action: actionresult,
        danger: dangerresult,
        summary: submsg + ' => ' + oracle
      };

      renderTemplate("modules/fux-dice-roller/templates/fux-dice-roller-chatmsg-core.hbs", rollData).then(html => {
        let messageData = {
          content: html,
          type: rvalue,
          blind: blindmode
        };
        
        if (rtypevalue == CONST.DICE_ROLL_MODES.PRIVATE || rtypevalue == CONST.DICE_ROLL_MODES.BLIND) {
          messageData.whisper = ChatMessage.getWhisperRecipients('GM');
        } else if (rtypevalue == CONST.DICE_ROLL_MODES.SELF) {
          // whisper to self  
          messageData.whisper = ChatMessage.getWhisperRecipients(game.user.name);
        }
        let newmessage = ChatMessage.create(messageData);
      });       
    }

    return rollvalue + boons;

  }
