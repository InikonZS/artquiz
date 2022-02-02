import { Vector } from "../../common/vector";

export class BaseListNode<NodeType extends BaseNode = BaseNode>{
  protected childs:Array<NodeType>;
  public isDestroyed: boolean;
  private didChildDestroy: boolean;

  constructor(){
    this.childs = [];
    this.didChildDestroy = false;
  }

  public requestHandleChildDestroy(){
    this.didChildDestroy = true; 
  }

  public handleChildDestroy(){
    if (this.didChildDestroy){
      this.childs = this.childs.filter(child => child.isDestroyed !== true);
      this.didChildDestroy = false;
    }
  }

  public append(node:NodeType){
    this.childs.push(node);
    node.attach(this);
  }

  public destroy(){
    this.childs.forEach(child => child.detach(this));
  }
}

export class BaseNode{
  private owners:Array<BaseListNode>;
  public isDestroyed: boolean;

  constructor(){
    this.owners = [];
    this.isDestroyed = false;
  }

  public attach(node:BaseListNode){
    this.owners.push(node);
  }

  public detach(node:BaseListNode){
    this.owners = this.owners.filter(owner => owner != node);
  }

  public destroy(){
    this.isDestroyed = true;
    this.owners.forEach(owner => owner.requestHandleChildDestroy());
  }
}

export interface IInteractive extends BaseNode{
  handleMove: (pos:Vector)=>void;
}

export class InteractiveNode extends BaseNode implements IInteractive{
  private _isHovered: boolean;
  get isHovered(){
    return this._isHovered;
  }
  onMouseMove: (cursor:Vector)=>void;
  onMouseEnter: (cursor:Vector)=>void;
  onMouseLeave: (cursor:Vector)=>void;

  constructor(){
    super();
  }

  handleMove(cursor:Vector){
    if (this.inShape(cursor)){
      this.onMouseMove?.(cursor);
      if (!this.isHovered) {
        this._isHovered = true;
        this.onMouseEnter?.(cursor);
      }
    } else {
      if (this.isHovered) {
        this._isHovered = false;
        this.onMouseLeave?.(cursor);
      }
    }  
  }

  inShape(cursor:Vector):boolean{
    throw new Error("Cannot call abstract method inShape.");
  }
}