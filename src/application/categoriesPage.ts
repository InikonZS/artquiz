import Control from "../common/control";
import {ICategoryData} from "./quizDataModel";
import {AnimatedControl} from "./animatedControl"

import style from "./categories.css";

export class CategoriesPage extends AnimatedControl{
  onBack: ()=>void;
  onSelect: (index:number)=> void;

  constructor(parentNode:HTMLElement, gameName:string, quizCategoriesData:Array<ICategoryData>){
    super(parentNode, 'divdfd', {default: style["categories_page"], hidden:style["hide"]});
    this.quickOut();

    const headerWrapper = new Control(this.node, 'div', style["head_panel"]);
    const backButton = new Control(headerWrapper.node, 'button', style["button_back"], 'back');
    backButton.node.onclick = ()=>{
      this.onBack();
    }
    const header = new Control(headerWrapper.node, 'h1', style["head_name"], gameName);
    
    const categoriesContainer = new Control(this.node, 'div', style["categories"]);
    //const categoriesList = [1,2,3,4,5,6,7];
    const categoryButtons = quizCategoriesData.map((it, i) => {
      return new CategoryItem(categoriesContainer.node, it, {
        onSelect: ()=>{
          this.onSelect(i);
        },
        onScore: ()=>{
          console.log('score', i);
        }
      });
      /*const category = new Control(categoriesContainer.node, 'div', style["category"]);

      const button = new Control(category.node, 'div', style["category_img"], it.name.toString());
      button.node.style.backgroundImage = `url('${it.picture}')`;
      //const img = new Image(100, 100);
      //button.node.append(img);
      //img.src = it.picture;
      button.node.onclick = ()=>{
        this.onSelect(i);
      }
      const score = new Control(category.node, 'div', style["category_score"], 'score');
      return category;*/
    });
  }
}

interface ICategoryItemController {
  onScore: ()=>void;
  onSelect: ()=>void;
}

class CategoryItem extends Control{
  constructor(parentNode: HTMLElement, data:ICategoryData, controller: ICategoryItemController){
    super(parentNode, 'div', style["category"]);
    const button = new Control(this.node, 'div', style["category_img"], data.name.toString());
      button.node.style.backgroundImage = `url('${data.picture}')`;
      
      button.node.onclick = ()=>{
        controller.onSelect();
        //this.onSelect(i);
      }
      const score = new Control(this.node, 'div', style["category_score"], 'score');
      score.node.onclick = ()=>{
        controller.onScore();
      }
  };

}