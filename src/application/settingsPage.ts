import Control from "../common/control";

interface IQuizSettings{

}

export class SettingsPage extends Control{
  onBack: ()=>void;
  onSave: (settings:IQuizSettings)=>void;

  constructor(parentNode:HTMLElement){
    super(parentNode);
    const backButton = new Control(this.node, 'button', '', 'back');
    backButton.node.onclick = ()=>{
      this.onBack();
    }

    const settings: IQuizSettings = {

    }
    const saveButton = new Control(this.node, 'button', '', 'save');
    saveButton.node.onclick = ()=>{
      this.onSave(settings);
    }
  }
}