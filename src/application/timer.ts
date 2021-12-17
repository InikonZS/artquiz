import Control from "../common/control";

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