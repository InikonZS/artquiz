import Control from "../common/control";
import {SettingsModel, SettingsPage} from "./settingsPage";
import {CategoriesPage} from "./categoriesPage";
import {GameFieldPage} from "./gameFieldPage";
import {GameOverPage} from "./gameOverPage";
import {StartPage} from "./startPage";
import {QuizDataModel} from "./quizDataModel";
import {SoundManager} from "./soundManager";

export class Application extends Control{
  model: QuizDataModel;
  settingsModel: SettingsModel;

  constructor(parentNode:HTMLElement){
    super(parentNode);
    //preloader
    const preloader = new Control(this.node, 'div', '', 'loading...');
    SoundManager.preload();
    this.settingsModel = new SettingsModel();
    this.settingsModel.loadFromStorage();
    this.model = new QuizDataModel();
    this.model.build().then(result=>{
      preloader.destroy();
      console.log(result.data);
      //main
      this.mainCycle();
    })
    
  }

  private gameCycle(gameName: string, categoryIndex: number){
    let questions: Array<any>; 
    if (gameName == 'artists'){
      questions = this.model.getArtistsQuestions(categoryIndex);
    } else if (gameName == 'pictures'){
      questions = this.model.getPicturesQuestions(categoryIndex);
    } else {
      throw new Error('Game type is not exists');
    }

    const gameField = new GameFieldPage(this.node, {gameName: gameName, categoryIndex: categoryIndex, settings:this.settingsModel.getData()}, questions);
    gameField.onHome = ()=>{
      gameField.destroy();
      this.mainCycle();
    }
    gameField.onBack = ()=>{
      gameField.destroy();
      this.categoryCycle(gameName);
    }
    gameField.onFinish = (result)=>{
      gameField.destroy();
      const gameOverPage = new GameOverPage(this.node, result);
      gameOverPage.onHome = ()=>{
        gameOverPage.destroy();
        this.mainCycle();
      }
      gameOverPage.onNext = ()=>{
        //if (categoryIndex>)
        gameOverPage.destroy();
        this.gameCycle(gameName, categoryIndex+1);
      }
    }
  }

  private categoryCycle(gameName:string){
    const categories = new CategoriesPage(this.node, gameName, this.model.getCategoriesData());
      categories.onBack = ()=>{
        categories.destroy();
        this.mainCycle();
      }
      categories.onSelect=(index)=>{
        categories.destroy();
        this.gameCycle(gameName, index);
      }
  }

  private mainCycle(){
    const startPage = new StartPage(this.node);
    startPage.onGameSelect = (gameName)=>{
      startPage.destroy();
      this.categoryCycle(gameName);
    }
    startPage.onSettings = ()=>{
      startPage.destroy();

      const settingsPage = new SettingsPage(this.node, this.settingsModel.getData());
      settingsPage.onBack = ()=>{
        settingsPage.destroy();
        this.mainCycle();
      }
      settingsPage.onSave = (settings)=>{
        settingsPage.destroy();
        this.settingsModel.setData(settings);
        this.mainCycle();
      }
    }
  }
}