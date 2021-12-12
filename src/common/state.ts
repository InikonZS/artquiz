import Signal from "./signal";

export default class State <DataType> {
  private data: DataType;
  public onUpdate: Signal<{from:DataType,to:DataType}> = new Signal();
  constructor(initialState:DataType) {
    this.data = initialState;
  }

  setData(data: DataType) {
    const lastData = this.data;
    this.data = data;
    this.onUpdate.emit({from:lastData,to:this.data});
  }

  getData() {
    return this.data;
  }
}