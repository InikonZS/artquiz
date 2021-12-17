import Control from "../common/control";
import { AnimatedControl } from "./animatedControl";
import { IArtistsQuestionData, IPicturesQuestionData } from "./quizDataModel";
import style from "./pictureQuestion.css";

export class PictureQuestionView extends AnimatedControl {
  onAnswer: (index:number)=>void;

  constructor(parentNode: HTMLElement, questionData: IPicturesQuestionData) {
    super(parentNode, 'div', {
      default: style["wrapper"],
      hidden: style["hide"]
    });
    this.quickOut();

    const question = new Control(this.node, 'div', '', questionData.artistName);
    const answerButtons = questionData.answers.map((it, i) => {
      const button = new Control(this.node, 'button', '', i.toString());
      const img = new Image(200, 200);
      img.src = it;
      button.node.append(img);
      button.node.onclick = () => {
        this.onAnswer(i);
      }
    })
  }
}