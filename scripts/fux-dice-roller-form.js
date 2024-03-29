import { _module_id } from   './fux-dice-roller.js';
import { RollFuxDice } from   './fux-dice-roller-roll.js';
import { ModuleSettingsForm } from "./module-settings-form.js";
import { FUxDiceRollerCombatHelperForm } from "./fux-dice-roller-combat-helper-form.js";
import { FUX_CONST } from   './fux-dice-roller-constants.js';
import { SystemVariantName } from   './fux-dice-roller-constants.js';
export class FUxDiceRollerForm extends FormApplication {
  static title = 'FUx Dice Roller'
  static initialize() {
    //console.log('Initialized FUxDiceRollerForm' ); 
    
  }   
  
  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      height: 'auto',
      width: 'auto',
      id: 'fux-dice-roller-form',
      template: `modules/fux-dice-roller/templates/fux-dice-roller-form.hbs`,
      title: this.title,
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable: true
    };
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    return mergedOptions;
  }  

  

  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[name="fux-dice-roller-form_btn-roll"]').click(this._onRoll.bind(this));
    html.find('#DisplayFUxDiceRollerSettings').click(this._onDisplayFUxDiceRollerSettings.bind(this));
    html.find('#ResetFUxDiceRollerSelection').click(this._onResetFUxDiceRollerSelection.bind(this));
    html.find('#fux-dice-roller-combat-helper-show').click(this._onDisplayFUxDiceRollerCombatHelperForm.bind(this));
    
    Hooks.once("closeFUxDiceRollerForm", (app, html, data) => {      
      this._onCloseApplication(html);
    });
  }

  getData(options) {
    let data;
    let availabledice = game.settings.get(_module_id, 'OPTION_DICE_AVAILABLE');
    let showInitiativeOption = game.settings.get(_module_id, 'OPTION_SHOW_SEND_TO_COMBAT_TRACKER');
    let actiondiceicon='modules/fux-dice-roller/images/actiondie.svg';
    let dangerdiceicon='modules/fux-dice-roller/images/dangerdie.svg';
    let customactiondiceicon=game.settings.get(_module_id, 'OPTION_CUSTOM_ACTION_DICE_ICON');
    let customdangerdiceicon=game.settings.get(_module_id, 'OPTION_CUSTOM_DANGER_DICE_ICON');
    if(customactiondiceicon.length>0){
      actiondiceicon=customactiondiceicon;
    }
    if (customdangerdiceicon.length>0){
      dangerdiceicon=customdangerdiceicon;
    }        
    let actiondice = [];
    let dangerdice = [];
    let actiondie;
    let dangerdie;
    let actiondice_title = 'Action Dice';
    let dangerdice_title = 'Danger Dice';
    let systemvariant = game.settings.get(_module_id, 'OPTION_SYSTEM_VARIANT');
    let systemvariantname = SystemVariantName(systemvariant);
    let diceselection=game.user.getFlag('world','fux-dice-roller-form-selection');
        
    let actiondieselected=false;
    let dangerdieselected=false;
    for (let i = 1; i <= availabledice; i++) {
      if (i == 1) {
        actiondieselected=true;
        dangerdieselected=false;
        if(diceselection!=null){
          if(diceselection.actiondice.length>=i-1){
            actiondieselected=diceselection.actiondice[i-1];
            dangerdieselected=diceselection.dangerdice[i-1];
          }           
        } 
                
      } else {
        actiondieselected=false;
        dangerdieselected=false;
        if(diceselection!=null){
          if(diceselection.actiondice.length>=i-1){
            actiondieselected=diceselection.actiondice[i-1];
            dangerdieselected=diceselection.dangerdice[i-1];
          }           
        }
      }
      
      actiondie = {"number": i, "isSelected": actiondieselected,actiondiceicon:actiondiceicon};
      dangerdie = {"number": i, "isSelected": dangerdieselected,dangerdiceicon:dangerdiceicon};
      
      actiondice.push(actiondie);
      dangerdice.push(dangerdie);
    }
    let showfuxsettings = false;
    if (game.user.isGM) {
      showfuxsettings = true;
    }
    let showfu2combathelper = false;
    if (systemvariant == FUX_CONST.SYSTEM_VARIANTS.FU_V2) {
      showfu2combathelper = true;
    }
    data = {
      showfuxsettings: showfuxsettings,
      showfu2combathelper: showfu2combathelper,
      system_variant: systemvariantname,
      actiondice_title: actiondice_title,
      dangerdice_title: dangerdice_title,
      actiondice: actiondice,
      dangerdice: dangerdice,
      showInitiativeOption: showInitiativeOption
    }
    return data;
  }  

  async _updateObject(event, formData) {
    //console.log('_updateObject'); 
    //const expandedData = foundry.utils.expandObject(formData);
    //console.log(expandedData);     
  }

  async _onCloseApplication(html){    
    let doc = html[0].ownerDocument;
    let actiondiceselection=[];
    let dangerdiceselection=[];
    let actiondieselected=false;
    let dangerdieselected=false;
    let availabledice = game.settings.get(_module_id, 'OPTION_DICE_AVAILABLE');
    for (let i = 1; i <= availabledice; i++) {
      actiondieselected=false;
      dangerdieselected=false;
      if(doc.getElementById('fux-dice-roller-form-FUActionDie' + i).style.opacity==1){
        actiondieselected=true;
      }
      if(doc.getElementById('fux-dice-roller-form-FUDangerDie' + i).style.opacity==1){
        dangerdieselected=true;
      }
      actiondiceselection.push(actiondieselected) ;
      dangerdiceselection.push(dangerdieselected) ;            
    }
    let diceselection={
      actiondice:actiondiceselection,
      dangerdice:dangerdiceselection
    }    
    await game.user.setFlag('world','fux-dice-roller-form-selection',diceselection)    
  }
  
  _onResetFUxDiceRollerSelection(event){
    event.preventDefault();
    // loop configured dice and reset
    let availabledice = game.settings.get(_module_id, 'OPTION_DICE_AVAILABLE');
    const button = event.currentTarget;
    const form = button.form;
    // get document(used for popout combability)
    const doc = button.ownerDocument;
    for (let i = 1; i <= availabledice; i++) {
      if (i == 1) {
        doc.getElementById('fux-dice-roller-form-FUActionDie' + i).style.opacity = 1;
        doc.getElementById('fux-dice-roller-form-FUDangerDie' + i).style.opacity = 0.4;
      } else {
        doc.getElementById('fux-dice-roller-form-FUActionDie' + i).style.opacity = 0.4;
        doc.getElementById('fux-dice-roller-form-FUDangerDie' + i).style.opacity = 0.4;
      }
      
    }
  }

  _onDisplayFUxDiceRollerSettings(event) {
    event.preventDefault();
    let f = new ModuleSettingsForm();
    f.render(true, {focus: true});
  }

  _onDisplayFUxDiceRollerCombatHelperForm(event) {
    event.preventDefault();
    let options = {};
    new FUxDiceRollerCombatHelperForm(options).render(true, {focus: true});
  }

  async _onRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const form = button.form;
    // get document(used for popout combability)
    const doc = button.ownerDocument;
    //debugger;
    // get selected count
    let actiondice = this.getSelectedFUDice("Action", doc);
    let dangerdice = this.getSelectedFUDice("Danger", doc);
    let result = await RollFuxDice(actiondice, dangerdice);

    // --------------------------------------------- 
    let chkSendToCombatTrackerelement=doc.getElementById("fux-dice-roller-form-chkSendToCombatTracker");
    if (chkSendToCombatTrackerelement != null) {      
      if (chkSendToCombatTrackerelement.checked) {
        for (const token of canvas.tokens.controlled) {
          const combatant = game.combat.combatants.find(c => c.tokenId === token.id);
          game.combat.setInitiative(combatant.id, result);
        }
      }
    }
  }

  

  getSelectedFUDice(dietype, doc) {
    let selectedcount = 0;
    let availabledice = game.settings.get(_module_id, 'OPTION_DICE_AVAILABLE');
    for (let i = 1; i <= availabledice; i++)
    {
      if (doc.getElementById('fux-dice-roller-form-FU' + dietype + 'Die' + i).style.opacity == 1)
      {
        selectedcount = selectedcount + 1;
      }
    }
    return selectedcount;
  }

  

}
