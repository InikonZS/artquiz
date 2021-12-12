import Control from "../common/control";

export class GameOverPage extends Control{
  onNext: ()=>void;
  onHome: ()=>void;

  constructor(parentNode:HTMLElement, result:any){
    super(parentNode);

    
    const nextButton = new Control(this.node, 'button', '', 'next');
    nextButton.node.onclick = ()=>{
      this.onNext();
    }

    const homeButton = new Control(this.node, 'button', '', 'home');
    homeButton.node.onclick = ()=>{
      this.onHome();
    }
  }
}