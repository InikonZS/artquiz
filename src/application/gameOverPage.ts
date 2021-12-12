import Control from "../common/control";

export class GameOverPage extends Control{
  onNext: ()=>void;
  onHome: ()=>void;

  constructor(parentNode:HTMLElement, results:any){
    super(parentNode);

    const resultIndicator = new Control(this.node, 'div', '', '');
    resultIndicator.node.textContent = results.map((it:boolean)=>it?'+':'-').join(' ');

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