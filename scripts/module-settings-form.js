// -----------------------------------------------
// Export const needs defined in 
//   export const _module_id='sandbox-extensions';  // modules true name(id)
//   export const _module_ignore_settings=[];       // array of strings containing settings that should not be displayed
// -----------------------------------------------
import { _module_id } from   './fux-dice-roller.js';
import { _module_ignore_settings } from   './fux-dice-roller.js';

export class ModuleSettingsForm extends FormApplication {
  static ModuleID='';
  static ModuleName='';
  static ModuleSettingIgnoreList;
  static initialize() {
    this.ModuleID=_module_id; 
    this.ModuleSettingIgnoreList=_module_ignore_settings;
    this.ModuleName=game.modules.get(_module_id).data.title; 
    console.log('Initialized ModuleSettingsForm for module ' + this.ModuleID );
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      height: 'auto',
      id: 'module-settings-form',
      template: `modules/${this.ModuleID}/templates/module-settings-form.hbs`,
      title: `Configure Module Settings`,
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable:true,
      width:600
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));   
  }
  
  getData(options) {      
    let data;
    let settings=[];
    
    let setting; 
    let nsetting;
    let dtype;
    let mapSettings=game.settings.settings;
    
    for(let k of mapSettings.keys()){ 
      let isCheckbox=false;     
      let isRange=false;
      let isSelect=false; 
      let choices;
      let range={"min": 0, "max": 0,"step": 1};
      let filePicker; 
      let filePickerType;
      let type;     
      let ignoreThisSetting=false;
      if(k.toString().startsWith(ModuleSettingsForm.ModuleID)){                       
        setting=mapSettings.get(k);
        // check if to display this
        if (ModuleSettingsForm.ModuleSettingIgnoreList.length>0){
          if(ModuleSettingsForm.ModuleSettingIgnoreList.includes(setting.key)){             
            ignoreThisSetting=true;
          }
        }  
        if (!ignoreThisSetting){   
          dtype= setting.type.name;
          switch(dtype){          
            case('Number'): 
              type='Number';
              isRange=true; 
              range.min=setting.range.min;
              range.max=setting.range.max;
              range.step=setting.range.step;
              break;
            case('Boolean'):
              type='Boolean';
              isCheckbox=true;
              break;
            case('String'):  
              type='String';  
              // check for choices 
              if (setting.hasOwnProperty('choices')){
                isSelect=true; 
                choices=setting.choices;
              }  
              if (setting.hasOwnProperty('filePicker')){
                filePicker=true;
                filePickerType=setting.filePicker;               
              }
              break;
            default:
              type=dtype;
          }         
          nsetting={"id":k.toString() ,"type":type,"isCheckbox":isCheckbox,"isRange":isRange,"range":range,"isSelect":isSelect,"choices":choices,"filePicker":filePicker,"filePickerType":filePickerType,"name":game.i18n.localize(setting.name),"hint":game.i18n.localize(setting.hint),"value":modulesettingsform_get_game_setting(ModuleSettingsForm.ModuleID, setting.key)}
          settings.push(nsetting);
        }        
      }
    }
    
    data={     
      module_name:ModuleSettingsForm.ModuleName, 
      settings:settings
    }     
    return data;
  }    
  
  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    //console.log(expandedData);
    if (expandedData.hasOwnProperty(ModuleSettingsForm.ModuleID)){    
      let keys=Object.keys(expandedData[ModuleSettingsForm.ModuleID]); 
      //console.log(keys);
      for(let i=0;i<keys.length;i++){
        let sKey=keys[i];
        let sNewValue=expandedData[ModuleSettingsForm.ModuleID][keys[i]];
        //console.log('Saving setting ' + sKey + ':' + sNewValue + ' for module ' + ModuleSettingsForm.ModuleID);
        // save it                               
        await game.settings.set(ModuleSettingsForm.ModuleID, sKey, sNewValue)
      }
    }
  }
  
  _onResetDefaults(event) { 
    event.preventDefault();
    const button = event.currentTarget;
    const form = button.form;
    for ( let [k, v] of game.settings.settings.entries() ) {      
        // restore only for this module         
        // v8 uses module, v9 uses namespace
        if (v.module==ModuleSettingsForm.ModuleID || v.namespace==ModuleSettingsForm.ModuleID ){                
           // check if to ignore this   
          let ignoreThisSetting=false; 
          if (ModuleSettingsForm.ModuleSettingIgnoreList.length>0){
            if(ModuleSettingsForm.ModuleSettingIgnoreList.includes(v.key)){ 
              ignoreThisSetting=true;
            }
          }  
          if (!ignoreThisSetting){                                
            let input = form[k];
            if (input.type === "checkbox"){              
              input.checked = v.default;    
            }
            else if (input){
              input.value = v.default;
            } 
            $(input).change();
          }
        }
      
    }
  }
  
}
  function modulesettingsform_get_game_setting(moduleID,settingName){
    let setting=game.settings.get(moduleID, settingName);
    if (!setting) {
      return  '';
    }
    else{
      return setting;
    }
  }
  
  
  Hooks.once('init', () => {      
    ModuleSettingsForm.initialize();
  });