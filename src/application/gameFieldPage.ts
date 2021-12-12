import Control from "../common/control";

interface IQuizOptions{
  gameName: string;
  categoryIndex: number;
}

interface IQuizResults{

}

export class GameFieldPage extends Control{
  onBack: ()=>void;
  onHome: ()=>void;
  onFinish: (results:IQuizResults)=>void;

  constructor(parentNode:HTMLElement, gameOptions: IQuizOptions){
    super(parentNode);
    console.log(gameOptions);
    const header = new Control(this.node, 'h1', '', `${gameOptions.gameName} - ${gameOptions.categoryIndex}`);

    const backButton = new Control(this.node, 'button', '', 'back');
    backButton.node.onclick = ()=>{
      this.onBack();
    }

    const homeButton = new Control(this.node, 'button', '', 'home');
    homeButton.node.onclick = ()=>{
      this.onHome();
    }

    const finishButton = new Control(this.node, 'button', '', 'finish');
    finishButton.node.onclick = ()=>{
      this.onFinish({});
    }
  }
}