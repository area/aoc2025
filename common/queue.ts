export class Queue<T> {
  readonly items: T[] = [];

  enqueue (item: T): void {
    this.items.push(item);
  }

  dequeue (): T | undefined {
    return this.items.shift();
  }

  isEmpty (): boolean {
    return this.items.length === 0;
  }

  length (): number {
    return this.items.length;
  }
}
