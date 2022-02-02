import Control from "../common/control";

export class AnimatedControl extends Control{
  private styles: { default: string; hidden: string; };

  constructor(parentNode: HTMLElement | null, tagName = 'div', styles: {default:string, hidden:string}, content = ''){
    super(parentNode, tagName, styles.default, content);
    this.styles = styles;
  }

  quickIn(){
    this.node.classList.remove(this.styles.hidden);
  }

  quickOut(){
    this.node.classList.add(this.styles.hidden);
  }

  animateIn():Promise<void>{
    return new Promise((resolve)=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if (!this.node.classList.contains(this.styles.hidden)){
          resolve(null);
        }
        this.node.classList.remove(this.styles.hidden);
        this.node.ontransitionend = (e)=>{
          if (e.target !==this.node) return;
          this.node.ontransitionend = null;
          resolve(null);
        }
      }));
    })
  }

  animateOut(): Promise<void>{
    return new Promise((resolve)=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if (this.node.classList.contains(this.styles.hidden)){
          resolve(null);
        }
        this.node.classList.add(this.styles.hidden);
        this.node.ontransitionend = (e)=>{
          if (e.target !==this.node) return;
          this.node.ontransitionend = null;
          resolve(null);
        }
      }));
    })
  }
}