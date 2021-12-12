import Control from "../common/control";
import {ArtistQuestionView} from "./artistQuestionView";
import {PictureQuestionView} from "./pictureQuestionView";
import {IArtistQuestionData} from "./IArtistQuestionData";

interface IQuizOptions{
  gameName: string;
  categoryIndex: number;
}

type IQuizResults = Array<boolean>;

export class GameFieldPage extends Control{
  onBack: ()=>void;
  onHome: ()=>void;
  onFinish: (results:IQuizResults)=>void;
  progressIndicator: Control<HTMLElement>;
  results: IQuizResults;
  answersIndicator: Control<HTMLElement>;

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

    this.progressIndicator = new Control(this.node, 'div', '', '');
    this.answersIndicator = new Control(this.node, 'div', '', '');

    const questions: Array<IArtistQuestionData> = [{answers:[1,2,3,4], correctAnswerIndex:1}, {answers:[1,2,3,4], correctAnswerIndex: 2}, {answers:[1,2,3,4], correctAnswerIndex:3}];
    this.results = [];
    this.questionCycle(gameOptions.gameName, questions, 0, ()=>{
      this.onFinish(this.results);
    });

  }

  questionCycle(gameName:string, questions:Array<IArtistQuestionData>, index:number, onFinish:()=>void){
    if (index >= questions.length){ 
      onFinish();
      return;
    }
    this.progressIndicator.node.textContent = `${index+1} / ${questions.length}`;
    this.answersIndicator.node.textContent = this.results.map(it=>it?'+':'-').join(' ');
  
    if (gameName == 'artists'){
      const question = new ArtistQuestionView(this.node, questions[index]);
      question.onAnswer = answerIndex=>{
        question.destroy();
        this.results.push(answerIndex === questions[index].correctAnswerIndex);
        this.questionCycle(gameName, questions, index+1, onFinish);
      };
    } else if (gameName == 'pictures'){
      const question = new PictureQuestionView(this.node, questions[index]);
      question.onAnswer = answerIndex=>{
        question.destroy();
        this.results.push(answerIndex === questions[index].correctAnswerIndex);
        this.questionCycle(gameName, questions, index+1, onFinish);
      };
    } else {
      throw new Error('Game type is not exists');
    }
    
  }
}