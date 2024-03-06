import { _module_id } from   './fux-dice-roller.js';
import { RollFuxDice } from   './fux-dice-roller-roll.js';
import { ModuleSettingsForm } from "./module-settings-form.js";
import { FUxDiceRollerCombatHelperForm } from "./fux-dice-roller-combat-helper-form.js";
export class FUxDiceRollerForm extends FormApplication {
  static title = 'FUx Dice Roller'
  static initialize() {
    //console.log('Initialized FUxDiceRollerForm' );
  }   

  static ROLL_MODE = {
    FU_CLASSIC: 0,
    FU_V2: 1,
    ACTION_TALES: 2,
    NEON_CITY_OVERDRIVE: 3
  }

  _RollModeName(roll_mode) {
    let roll_modename = 'Unknown Variant';
    switch (roll_mode.toString()) {
      case FUxDiceRollerForm.ROLL_MODE.FU_CLASSIC.toString():
        roll_modename = game.i18n.localize('fux-dice-roller.settings.ROLL_MODE_FU_CLASSIC');
        break;
      case FUxDiceRollerForm.ROLL_MODE.FU_V2.toString():
        roll_modename = game.i18n.localize('fux-dice-roller.settings.ROLL_MODE_FU_V2');
        break;
      case FUxDiceRollerForm.ROLL_MODE.ACTION_TALES.toString():
        roll_modename = game.i18n.localize('fux-dice-roller.settings.ROLL_MODE_ACTION_TALES');
        break;
      case FUxDiceRollerForm.ROLL_MODE.NEON_CITY_OVERDRIVE.toString():
        roll_modename = game.i18n.localize('fux-dice-roller.settings.ROLL_MODE_NEON_CITY_OVERDRIVE');
        break;
    }
    return roll_modename;
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
    html.find('#fux-dice-roller-combat-helper-show').click(this._onDisplayFUxDiceRollerCombatHelperForm.bind(this));
  }

  getData(options) {
    let data;
    let availabledice = game.settings.get(_module_id, 'OPTION_DICE_AVAILABLE');
    let showInitiativeOption = game.settings.get(_module_id, 'OPTION_SHOW_SEND_TO_COMBAT_TRACKER');

    let actiondice = [];
    let dangerdice = [];
    let actiondie;
    let dangerdie;
    let actiondice_title = 'Action Dice';
    let dangerdice_title = 'Danger Dice';
    let roll_mode = game.settings.get(_module_id, 'OPTION_ROLL_MODE');
    let system_variant = this._RollModeName(roll_mode);
    switch (roll_mode.toString()) {
      case FUxDiceRollerForm.ROLL_MODE.FU_CLASSIC.toString():
//        actiondice_title = 'Start + Bonus Dice';
//        dangerdice_title = 'Penalty Dice'
        break;
      case FUxDiceRollerForm.ROLL_MODE.FU_V2.toString():
        break;
      case FUxDiceRollerForm.ROLL_MODE.ACTION_TALES.toString():
        break;
      case FUxDiceRollerForm.ROLL_MODE.NEON_CITY_OVERDRIVE.toString():
        break;
    }
    for (let i = 1; i <= availabledice; i++) {
      if (i == 1) {
        actiondie = {"number": i, "isSelected": true};
        dangerdie = {"number": i, "isSelected": false};
      } else {
        actiondie = {"number": i, "isSelected": false};
        dangerdie = {"number": i, "isSelected": false};
      }
      actiondice.push(actiondie);
      dangerdice.push(dangerdie);
    }
    let showfuxsettings = false;
    if (game.user.isGM) {
      showfuxsettings = true;
    }
    let showfu2combathelper = false;
    if (roll_mode == FUxDiceRollerForm.ROLL_MODE.FU_V2) {
      showfu2combathelper = true;
    }
    data = {
      showfuxsettings: showfuxsettings,
      showfu2combathelper: showfu2combathelper,
      system_variant: system_variant,
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
    let chkSendToInitative = doc.getElementById("fux-dice-roller-form-chkSendToCombatTracker").checked;
    
    if (chkSendToInitative) {

      for (const token of canvas.tokens.controlled) {
        const combatant = game.combat.combatants.find(c => c.data.tokenId === token.data._id);
        game.combat.setInitiative(combatant.data._id, result);
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
