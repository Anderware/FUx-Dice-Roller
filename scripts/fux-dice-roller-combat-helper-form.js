import { _module_id } from   './fux-dice-roller.js';
import { ModuleSettingsForm } from "./module-settings-form.js";
export class FUxDiceRollerCombatHelperForm extends FormApplication {
  static title = 'FU2 Combat helper'
  static initialize() {
    //console.log('Initialized SandboxKeyCheckerForm' );
  }   

  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      height: 'auto',
      width: '600',
      id: 'fux-dice-roller-combat-helper-form',
      template: `modules/fux-dice-roller/templates/fux-dice-roller-combat-helper-form.hbs`,
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
    html.find('#DisplayFUxDiceRollerSettings').click(this._onDisplayFUxDiceRollerSettings.bind(this));
    html.find('#fux-dice-roller-combat-helper-form').click(this._onFormClick.bind(this));

  }
  getData(options) {
    let data;
    data = {
      damage_types: ['Crush', 'Pierce', 'Cut', 'Chop', 'Burn', 'Energy', 'Mental', 'Mystic'],
      user:{"isGM":game.user.isGM}
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
    f.render(true);
  }
  async _onFormClick(event) {
    //event.preventDefault();

    let datatarget = event.target.getAttribute("data-target");
    let dataoperation = event.target.getAttribute("data-operation");
    let datavalue = event.target.getAttribute("data-value");

    if (datatarget !== null && dataoperation !== null && datavalue !== null) {
      let targetinput = '';
      switch (datatarget) {
        case 'success-level':
          targetinput = 'fux-dice-roller-combat-helper-form-success-level';
          break;
        case 'damage-level':
          targetinput = 'fux-dice-roller-combat-helper-form-damage-level';
          break;
        case 'soak-level':
          targetinput = 'fux-dice-roller-combat-helper-form-soak-level';
          break;
        case 'combat-action':
          targetinput = '';
          this._ComputeCombatAction();
          break;
        case 'damage-type':
          targetinput = '';
          this._ComputeCombatAction();
        case 'hit-location':
          targetinput = 'fux-dice-roller-combat-helper-form-hit-location';
          break;
      }
      if (targetinput !== '') {
        let inputelement = document.getElementById(targetinput);
        if (inputelement != null) {
          switch (dataoperation) {
            case 'set':
              inputelement.value = datavalue;
              this._ComputeCombatAction();
              break;
            case 'inc':
              inputelement.value = parseInt(inputelement.value, 10) + parseInt(datavalue, 10);
              this._ComputeCombatAction();
              break;
            case 'dec':
              inputelement.value = parseInt(inputelement.value, 10) - parseInt(datavalue, 10);
              this._ComputeCombatAction();
              break;
            case 'roll':
              let rollvalue = await this._Roll(datavalue);
              if (inputelement.nodeName === 'SELECT') {
                inputelement.options.selectedIndex = rollvalue;
              } else {
                inputelement.value = rollvalue;
              }
              break;
          }
        }
      }
    }
  }
  async _Roll(rollexpression) {
    let results = await new Roll(rollexpression).roll({async: true});
    let rolled = results.total;
    return rolled;
  }
  _ComputeCombatAction() {
    let successlevel = document.getElementById('fux-dice-roller-combat-helper-form-success-level').value;
    let damagelevel = document.getElementById('fux-dice-roller-combat-helper-form-damage-level').value;
    let soaklevel = document.getElementById('fux-dice-roller-combat-helper-form-soak-level').value;

    //let combataction = document.getElementById('fux-dice-roller-combat-helper-form-combat-action').value;
    let combataction = document.querySelector('input[name="fux-dice-roller-combat-helper-form-combat-action"]:checked').value;

    let attacklevel = document.getElementById('fux-dice-roller-combat-helper-form-attack-level');
    let actionresult = document.getElementById('fux-dice-roller-combat-helper-form-combat-action-result');

    if (successlevel > 0) {
      actionresult.value = 'Success';
    } else {
      actionresult.value = 'Fail';
    }
    switch (combataction) {
      case 'Attack':
        if (successlevel > 0) {
          attacklevel.value = parseInt(successlevel, 10) + parseInt(damagelevel, 10) - parseInt(soaklevel, 10);
        } else {
          attacklevel.value = 0;
        }
        break;
      case 'Defend':
        if (successlevel > 0) {
          attacklevel.value = 0;
        } else {
          attacklevel.value = -parseInt(successlevel, 10) + parseInt(damagelevel, 10) - parseInt(soaklevel, 10);
        }
        break;
    }
    let wound= this._ComputeWound(attacklevel.value);
    // generate combat description
  }

  _ComputeWound(attacklevel) {
    let wound = 'None';
    let iAttackLevel = parseInt(attacklevel, 10);
    if (iAttackLevel == 1) {
      wound = 'No wound';
    } else
    if (iAttackLevel == 2) {
      wound = 'Minor';
    } else
    if (iAttackLevel == 3) {
      wound = 'Medium';
    } else
    if (iAttackLevel == 4) {
      wound = 'Major';
    } else
    if (iAttackLevel == 5) {
      wound = 'Critical';
    } else
    if (iAttackLevel > 5) {
      wound = 'Deadly';
    }
    let woundlevel = document.getElementById('fux-dice-roller-combat-helper-form-wound-level')
    woundlevel.value = wound;
    return wound;
  }

}
;
