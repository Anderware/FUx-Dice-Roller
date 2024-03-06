import { _module_id } from   './fux-dice-roller.js';
import { ModuleSettingsForm } from "./module-settings-form.js";
export class FUxDiceRollerCombatHelperForm extends FormApplication {
  static title = 'FU2 Combat helper'
  
  CombatResult={
    CombatAction:'Attack',
    CombatResult:'',
    Wound:'None',
    HitLocation:'',
    SuccessLevel:0
  }
  
  static initialize() {
    //console.log('Initialized FUxDiceRollerCombatHelperForm' );
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
    
//    // test code for future use to load select dynamically from json
//    Hooks.on("renderFUxDiceRollerCombatHelperForm",async (app, html,data) => {        
//      // find the select
//      let eselect=html.find('#fux-dice-roller-combat-helper-form-hit-location')[0];            
//      let option = new Option("Small of the back", "20");
//      eselect.appendChild(option);
//    });
    
    
  }
  
  getData(options) {
    let data;
    data = {
      damage_types: ['None','Crush', 'Pierce', 'Cut', 'Chop', 'Burn', 'Energy', 'Mental', 'Mystic'],
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
    const element = event.currentTarget;
    
    // get document(used for popout combability)
    const doc = element.ownerDocument;

    if (datatarget !== null && dataoperation !== null && datavalue !== null) {
      let targetinput = '';
      switch (datatarget) {
        case 'success-level':
          targetinput = 'fux-dice-roller-combat-helper-form-success-level';
          if(dataoperation=='set'){
            this.CombatResult.SuccessLevel=parseInt(datavalue);
          } else if(dataoperation=='inc') {
            this.CombatResult.SuccessLevel=parseInt(this.CombatResult.SuccessLevel) + 1;            
          } else if(dataoperation=='dec'){
            this.CombatResult.SuccessLevel=parseInt(this.CombatResult.SuccessLevel) - 1;            
          }
          
          break;
        case 'damage-level':
          targetinput = 'fux-dice-roller-combat-helper-form-damage-level';
          break;
        case 'soak-level':
          targetinput = 'fux-dice-roller-combat-helper-form-soak-level';
          break;
        case 'combat-action':
          targetinput = '';
          this.CombatResult.CombatAction=datavalue;
          this._ComputeCombatAction(doc);
          break;
        case 'damage-type':
          targetinput = '';
          this._ComputeCombatAction(doc);
          break;
        case 'hit-location':
          targetinput = 'fux-dice-roller-combat-helper-form-hit-location';
          break;
        case 'hit-location-select':
          targetinput = '';
          this._ComputeCombatAction(doc);
          break;
        
      }
      if (targetinput !== '') {
        let inputelement = doc.getElementById(targetinput);
        if (inputelement != null) {
          switch (dataoperation) {
            case 'set':
              inputelement.value = datavalue;
              this._ComputeCombatAction(doc);
              break;
            case 'inc':
              inputelement.value = parseInt(inputelement.value, 10) + parseInt(datavalue, 10);
              this._ComputeCombatAction(doc);
              break;
            case 'dec':
              inputelement.value = parseInt(inputelement.value, 10) - parseInt(datavalue, 10);
              this._ComputeCombatAction(doc);
              break;
            case 'roll':
              if(datatarget=='hit-location'){
                let rollvalue=0;
                let hitlocationindex=0;
                let rollexpression='';
                let faces=0;
                let adaptive=doc.getElementById("fux-dice-roller-combat-helper-form-adaptive-hit-location-roll").checked;
                let relative=doc.getElementById("fux-dice-roller-combat-helper-form-relative-hit-location-roll").checked;                
                if(relative) {
                  faces='100' ;
                }else{
                  faces='19' ;
                }  

                if(adaptive){   //Math.abs(parseInt(this.CombatResult.SuccessLevel))>0
                  // use success level to adapt hit location roll                   
                  if(Math.abs(parseInt(this.CombatResult.SuccessLevel))<=1){
                    rollexpression='2d'+ faces +'kl' ;
                  } else{
                    rollexpression=(Math.abs(parseInt(this.CombatResult.SuccessLevel)) - 1) + 'd'+ faces +'kh' ;
                  }                                                            
                }else{
                  rollexpression='1d'+faces;
                } 
                
                //console.warn('Adaptive('+ adaptive + ') Relative('+ relative+') hit roll('+rollexpression+')'); 
                rollvalue = await this._Roll(rollexpression);
                if(relative){                   
                  if     (rollvalue>=1 &&   rollvalue<=4)  {hitlocationindex=1;}
                  else if(rollvalue>=5 &&   rollvalue<=8)  {hitlocationindex=2;}
                  else if(rollvalue>=9 &&   rollvalue<=10) {hitlocationindex=3;}
                  else if(rollvalue>=11 &&  rollvalue<=12) {hitlocationindex=4;}
                  else if(rollvalue>=13 &&  rollvalue<=16) {hitlocationindex=5;}
                  else if(rollvalue>=17 &&  rollvalue<=20) {hitlocationindex=6;}
                  else if(rollvalue>=21 &&  rollvalue<=23) {hitlocationindex=7;}
                  else if(rollvalue>=24 &&  rollvalue<=26) {hitlocationindex=8;}
                  else if(rollvalue>=27 &&  rollvalue<=34) {hitlocationindex=9;}
                  else if(rollvalue>=35 &&  rollvalue<=42) {hitlocationindex=10;}
                  else if(rollvalue>=43 &&  rollvalue<=49) {hitlocationindex=11;}
                  else if(rollvalue>=50 &&  rollvalue<=56) {hitlocationindex=12;}
                  else if(rollvalue>=57 &&  rollvalue<=64) {hitlocationindex=13;}
                  else if(rollvalue>=65 &&  rollvalue<=72) {hitlocationindex=14;}
                  else if(rollvalue>=73 &&  rollvalue<=83) {hitlocationindex=15;}
                  else if(rollvalue>=84 &&  rollvalue<=84) {hitlocationindex=16;}
                  else if(rollvalue>=85 &&  rollvalue<=91) {hitlocationindex=17;}
                  else if(rollvalue>=92 &&  rollvalue<=98) {hitlocationindex=18;}
                  else if(rollvalue>=99 &&  rollvalue<=100){hitlocationindex=19;}
                }
                else{                    
                  hitlocationindex = rollvalue;
                }
                //console.warn('rollvalue:' + rollvalue + ' hitlocationindex:'+hitlocationindex); 
                                                      
                // outout the result
                if (inputelement.nodeName === 'SELECT') {
                  inputelement.options.selectedIndex = hitlocationindex;
                } else {
                  inputelement.value = hitlocationindex;
                }
                
                this._ComputeCombatAction(doc);
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
  _ComputeCombatAction(doc) {
    let successlevel = doc.getElementById('fux-dice-roller-combat-helper-form-success-level').value;
    let damagelevel = doc.getElementById('fux-dice-roller-combat-helper-form-damage-level').value;
    let soaklevel = doc.getElementById('fux-dice-roller-combat-helper-form-soak-level').value;

    //let combataction = document.getElementById('fux-dice-roller-combat-helper-form-combat-action').value;
    let combataction = doc.querySelector('input[name="fux-dice-roller-combat-helper-form-combat-action"]:checked').value;

    let attacklevel = doc.getElementById('fux-dice-roller-combat-helper-form-attack-level');
    let actionresult = doc.getElementById('fux-dice-roller-combat-helper-form-combat-action-result');

    if (successlevel > 0) {
      actionresult.value = 'Success';      
    } else {
      actionresult.value = 'Failure';      
    }
    
    this.CombatResult.CombatResult=actionresult.value;
    switch (combataction) {
      case 'Attack':
        if (successlevel > 0) {
          attacklevel.value = parseInt(successlevel, 10) + parseInt(damagelevel, 10) - parseInt(soaklevel, 10);
        } else {
          attacklevel.value = 0;
        }
        break;
      case 'Defense':
        if (successlevel > 0) {
          attacklevel.value = 0;
        } else {
          attacklevel.value = -parseInt(successlevel, 10) + parseInt(damagelevel, 10) - parseInt(soaklevel, 10);
        }
        break;
    }
    let wound= this._ComputeWound(attacklevel.value);
    // generate combat description
    this._GenerateCombatDescription(doc);
  }

  _ComputeWound(attacklevel) {
    let wound = 'None';
    let iAttackLevel = parseInt(attacklevel, 10);
    if (iAttackLevel == 1) {
      wound = 'Bruise';
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
//    let woundlevel = document.getElementById('fux-dice-roller-combat-helper-form-wound-level')
//    woundlevel.value = wound;
    this.CombatResult.Wound=wound;
    return wound;
  }
  
  _GenerateCombatDescription(doc){
    let combatdescription='';
    // get data
    let ehitlocation= doc.getElementById('fux-dice-roller-combat-helper-form-hit-location');
    let hitlocation=  ehitlocation.options[ehitlocation.selectedIndex].text;
    let damagetype=doc.querySelector('input[name="fux-dice-roller-combat-helper-form-damage-type"]:checked').value;
    if(damagetype==='None'){
      damagetype='';
    }else{
      damagetype=' ' + damagetype;
    }
    combatdescription='Your ' + FUX_DR_CHF_BoldText(this.CombatResult.CombatAction) + ' was a ' + FUX_DR_CHF_BoldText(this.CombatResult.CombatResult);
    const traumalabel=FUX_DR_CHF_BoldText('Trauma');
    if (this.CombatResult.CombatAction==='Defense' && this.CombatResult.CombatResult==='Failure'){
      if(this.CombatResult.Wound==='None' || this.CombatResult.Wound==='No wound'){
        combatdescription+=' but you did not recieve any ' + FUX_DR_CHF_BoldText(traumalabel);
      } else{
        if(hitlocation==='Not selected'){          
          combatdescription+=', you recieve a ' + FUX_DR_CHF_BoldText(this.CombatResult.Wound)  + FUX_DR_CHF_BoldText(damagetype) + ' ' + traumalabel ;
        } else{
          combatdescription+=', you recieve a ' + FUX_DR_CHF_BoldText(this.CombatResult.Wound)  + FUX_DR_CHF_BoldText(damagetype) + ' ' + traumalabel +' on your ' + FUX_DR_CHF_BoldText(hitlocation) ;  
        }
        
        
      }
    } else if(this.CombatResult.CombatAction==='Attack' && this.CombatResult.CombatResult==='Success'){
      if(this.CombatResult.Wound==='None' || this.CombatResult.Wound==='No wound'){
        combatdescription+=' but you did not inflict any ' + FUX_DR_CHF_BoldText(traumalabel) + ' on your opponent';
      } else{      
        if(hitlocation==='Not selected'){          
          combatdescription+=', you inflict a ' + FUX_DR_CHF_BoldText(this.CombatResult.Wound) + FUX_DR_CHF_BoldText(damagetype) + ' ' + traumalabel + ' on your opponent' ;
        } else{
          combatdescription+=', you inflict a ' + FUX_DR_CHF_BoldText(this.CombatResult.Wound) + FUX_DR_CHF_BoldText(damagetype) + ' ' + traumalabel + ' on your opponents ' + FUX_DR_CHF_BoldText(hitlocation) ;  
        }
      }
    }
  
    // assemble description
    let eCombatDescription = doc.getElementById('fux-dice-roller-combat-helper-combat-description');
    eCombatDescription.innerHTML='<i>' + combatdescription +'</i>';
  }

}
;

function FUX_DR_CHF_BoldText(text){
  return '<b>' + text + '</b>';
}
