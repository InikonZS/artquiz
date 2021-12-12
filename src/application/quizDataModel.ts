import imagesDataUrl from '../assets/json/images.json';

interface IMultiLangString{
  ru: string,
  en: string 
}

interface IPictureData{
  year: number,
  picture: number,
  author: IMultiLangString,
  name: IMultiLangString
}

interface IImageDto{
  year: string,
  picture: string,
  author: IMultiLangString,
  name: IMultiLangString
}

export interface IArtistsQuestionData{
  answers: string[];
  correctAnswerIndex: number;
  artistImgUrl: string;
}

export interface IPicturesQuestionData{
  answers: string[];
  correctAnswerIndex: number;
  artistName: string;
}


export interface ICategoryData{
  name: string;
  picture: string;
  score?: Array<boolean>;
}

type IImagesDto = Record<string, IImageDto>

export class QuizDataModel{
  private questionsPerCategory = 10;
  data: Array<IPictureData>;

  constructor(){

  }

  public async build(){
    this.data = await this.loadImagesData(imagesDataUrl);
    return this;
  }

  public getCategoriesData(){
    const questionsPerCategory = this.questionsPerCategory;
    const categoriesCount = Math.floor(this.data.length / questionsPerCategory);
    const categories: Array<ICategoryData> = [];
    for (let i= 0; i < categoriesCount; i++){
      const pictureUrl = `./public/img/pictures/${i* questionsPerCategory}.jpg`;
      const categoryData: ICategoryData = {
        name: i.toString(),
        picture: pictureUrl,
        score: new Array(categoriesCount).fill(false)
      }
      categories.push(categoryData);
    }
    return categories;
  }

  public getPicturesQuestions(categoryIndex:number){
    const questionsPerCategory = this.questionsPerCategory;
    const result: Array<IPicturesQuestionData> = [];
    for (let i= categoryIndex* questionsPerCategory; i< (categoryIndex+1)* (questionsPerCategory); i++){
      const answers: Array<string> = [];
      const answersCount = 4;
      const correctAnswerIndex = Math.floor(Math.random() * answersCount);
      const correctAnswer = `./public/img/pictures/${this.data[i].picture}.jpg`;
      for(let j=0; j<answersCount; j++){
        if (correctAnswerIndex == j){
          answers.push(correctAnswer)
        } else {
          const randomImage = this.data[Math.floor(Math.random()*this.data.length)].picture;
          const variantUrl = `./public/img/pictures/${randomImage}.jpg`;
          answers.push(variantUrl);
        }
      }
      const question: IPicturesQuestionData = {
        artistName: this.data[i].author.en,
        answers: answers,
        correctAnswerIndex: correctAnswerIndex
      }
      result.push(question);
    }
    return result;
  }

  public getArtistsQuestions(categoryIndex:number){
    const questionsPerCategory = this.questionsPerCategory;
    const result: Array<IArtistsQuestionData> = [];
    for (let i= categoryIndex* questionsPerCategory; i< (categoryIndex+1)* (questionsPerCategory); i++){
      const answers: Array<string> = [];
      const answersCount = 4;
      const correctAnswerIndex = Math.floor(Math.random() * answersCount);
      const correctAnswer = this.data[i].author.en;
      for(let j=0; j<answersCount; j++){
        if (correctAnswerIndex == j){
          answers.push(correctAnswer)
        } else {
          const randomName = this.data[Math.floor(Math.random()*this.data.length)].author;
          answers.push(randomName.en);
        }
      }
      const question: IArtistsQuestionData = {
        artistImgUrl: `./public/img/pictures/${this.data[i].picture}.jpg`,
        answers: answers,
        correctAnswerIndex: correctAnswerIndex
      }
      result.push(question);
    }
    return result;
  }

  private loadImagesData(url:string): Promise<Array<IPictureData>>{
    return fetch(url).then(res=>res.json()).then((imagesData: IImagesDto)=>{
      const modelData: Array<IPictureData> = Object.keys(imagesData).map(it=>{
        const item = imagesData[it];
        const record: IPictureData = {
          year: Number(item.year),
          picture: Number(item.picture),
          author: item.author,
          name: item.name
        };
        return record;
      });
      return modelData;
    });
  }
}