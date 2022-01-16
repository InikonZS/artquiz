import Control from "../common/control";
import {SettingsModel, SettingsPage} from "./settingsPage";
import {CategoriesPage} from "./categoriesPage";
import {GameFieldPage} from "./gameFieldPage";
import {GameOverPage} from "./gameOverPage";
import {StartPage} from "./startPage";
import {IArtistsQuestionData, IPicturesQuestionData, QuizDataModel} from "./quizDataModel";
import {SoundManager} from "./soundManager";

import style from "./application.css";
import { ArtistQuestionView } from "./artistQuestionView";
import { PictureQuestionView } from "./pictureQuestionView";
import {SocketClient} from "../ratalien/sockets/socket-client";

export class Application extends Control{
  model: QuizDataModel;
  settingsModel: SettingsModel;
  header: Control<HTMLElement>;
  main: Control<HTMLElement>;
  footer: Control<HTMLElement>;

  constructor(parentNode:HTMLElement){
    super(parentNode, 'div', style["global_wrapper"]);
    this.header = new Control(this.node, 'div', style["global_header"]);
    this.main = new Control(this.node, 'div', style["global_main"]);
    this.footer = new Control(this.node, 'div', style["global_footer"]);
    //preloader
    const preloader = new Control(this.node, 'div', '', 'loading...');
    SoundManager.preload();
    this.settingsModel = new SettingsModel();
    this.settingsModel.loadFromStorage();
    this.model = new QuizDataModel();
    this.model.build().then(result=>{
      preloader.destroy();
     // console.log(result.data);
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



    let gameField: GameFieldPage<unknown>;
    if (gameName == 'artists') {
      gameField = new GameFieldPage<IArtistsQuestionData>(this.main.node, ArtistQuestionView, {gameName: gameName, categoryIndex: categoryIndex, settings:this.settingsModel.getData()}, questions);
    } else if(gameName == 'pictures'){
      gameField = new GameFieldPage<IPicturesQuestionData>(this.main.node, PictureQuestionView, {gameName: gameName, categoryIndex: categoryIndex, settings:this.settingsModel.getData()}, questions);
    } else {
      throw new Error('Unknown game name ' + gameName);
    }
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
      const gameOverPage = new GameOverPage(this.main.node, result);
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
    const categories = new CategoriesPage(this.main.node, gameName, this.model.getCategoriesData());
    categories.animateIn();
      categories.onBack = ()=>{
        categories.animateOut().then(()=>{
          categories.destroy();
          this.mainCycle();
        });
      }
      categories.onSelect=(index)=>{
        categories.animateOut().then(()=>{
          categories.destroy();
          this.gameCycle(gameName, index);
        });
      }
  }

  private mainCycle(){
    const startPage = new StartPage(this.main.node);
    startPage.animateIn();
    startPage.onGameSelect = (gameName)=>{
      startPage.animateOut().then(()=>{
        startPage.destroy();
        this.categoryCycle(gameName);
      });
    }
    startPage.onSettings = ()=>{
      startPage.animateOut().then(()=>{
        startPage.destroy();
        const settingsPage = new SettingsPage(this.main.node, this.settingsModel.getData());
        settingsPage.onBack = ()=>{
          
            settingsPage.destroy();
            this.mainCycle();
          
        }
        settingsPage.onSave = (settings)=>{
          settingsPage.destroy();
          this.settingsModel.setData(settings);
          this.mainCycle();
        }
      });
    }
  }
}
