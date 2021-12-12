import Control from "../common/control";
import {ArtistQuestionView} from "./artistQuestionView";
import {PictureQuestionView} from "./pictureQuestionView";
//import {IArtistQuestionData} from "./IArtistQuestionData";
import { IArtistsQuestionData, IPicturesQuestionData } from "./quizDataModel";
import { IQuizSettings } from "./settingsPage";
import {SoundManager} from "./soundManager";

interface IQuizOptions{
  gameName: string;
  categoryIndex: number;
  settings:IQuizSettings;
}

type IQuizResults = Array<boolean>;

export class Timer extends Control{
  onTimeout: ()=>void;
  timer: number;
  initialTime:number;

  constructor(parentNode:HTMLElement){
    super(parentNode);
  }

  start(time:number){
    this.initialTime = time;
    if (this.timer){
      this.stop();
    }
    let currentTime = time;
    const render = (currentTime:number)=>{
      this.node.textContent = `${this.initialTime} / ${currentTime}`;
    }
    render(time);
    this.timer = window.setInterval(()=>{
      currentTime--;
      render(currentTime);
      if (currentTime <=0){
        this.onTimeout();
      }
    }, 1000);
  }

  stop(){
    window.clearInterval(this.timer);
  }
}

export class GameFieldPage extends Control{
  onBack: ()=>void;
  onHome: ()=>void;
  onFinish: (results:IQuizResults)=>void;
  progressIndicator: Control<HTMLElement>;
  results: IQuizResults;
  answersIndicator: Control<HTMLElement>;
  timer: Timer;
  gameOptions: IQuizOptions;

  constructor(parentNode:HTMLElement, gameOptions: IQuizOptions, questionsData:Array<IArtistsQuestionData| IPicturesQuestionData>){
    super(parentNode);
    console.log(gameOptions);
    this.gameOptions = gameOptions;
    const header = new Control(this.node, 'h1', '', `${gameOptions.gameName} - ${gameOptions.categoryIndex}`);

    const backButton = new Control(this.node, 'button', '', 'back');
    backButton.node.onclick = ()=>{
      this.onBack();
    }

    const homeButton = new Control(this.node, 'button', '', 'home');
    homeButton.node.onclick = ()=>{
      this.onHome();
    }

    this.timer = new Timer(this.node);
    this.progressIndicator = new Control(this.node, 'div', '', '');
    this.answersIndicator = new Control(this.node, 'div', '', '');

    this.results = [];
    this.questionCycle(gameOptions.gameName, questionsData, 0, ()=>{
      this.onFinish(this.results);
    });

  }

  questionCycle(gameName:string, questions:Array<any>, index:number, onFinish:()=>void){
    if (index >= questions.length){ 
      onFinish();
      return;
    }
    let _quest: Control;
    this.progressIndicator.node.textContent = `${index+1} / ${questions.length}`;
    this.answersIndicator.node.textContent = this.results.map(it=>it?'+':'-').join(' ');
    if (this.gameOptions.settings.timeEnable){
      this.timer.start(this.gameOptions.settings.time);
      this.timer.onTimeout = ()=>{
        _quest.destroy();
        this.results.push(false);
        SoundManager.fail();
        this.questionCycle(gameName, questions, index+1, onFinish);
      }
    }
  
    if (gameName == 'artists'){
      const question = new ArtistQuestionView(this.node, questions[index]);
      _quest = question;
      question.onAnswer = answerIndex=>{
        question.destroy();
        const result = answerIndex === questions[index].correctAnswerIndex;
        if (result) {
          SoundManager.ok();
        } else {
          SoundManager.fail();
        }
        this.results.push(result);
        this.questionCycle(gameName, questions, index+1, onFinish);
      };
    } else if (gameName == 'pictures'){
      const question = new PictureQuestionView(this.node, questions[index]);
      _quest = question;
      question.onAnswer = answerIndex=>{
        question.destroy();
        const result = answerIndex === questions[index].correctAnswerIndex;
        if (result) {
          SoundManager.ok();
        } else {
          SoundManager.fail();
        }
        this.results.push(result);
        this.questionCycle(gameName, questions, index+1, onFinish);
      };
    } else {
      throw new Error('Game type is not exists');
    }
    
  }

  destroy(){
    this.timer.stop();
    super.destroy();
  }
}