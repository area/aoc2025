import { type Comparable } from './comparable';

export class PriorityQueue<T extends Comparable> {
  elements: T[];
  f: (a: T) => number;

  constructor (f: (a: T) => number) {
    this.elements = [];
    this.f = f;
  }

  put (item: T): void {
    let lowerBound = 0;
    let upperBound = this.elements.length;
    while (lowerBound < upperBound) {
      const mid = Math.floor((lowerBound + upperBound) / 2);
      // console.log(this.elements, mid)
      if (this.f(this.elements[mid]) < this.f(item)) {
        lowerBound = mid + 1;
      } else {
        upperBound = mid;
      }
    }

    this.elements.splice(lowerBound, 0, item);
  }

  pop (): T | undefined {
    return this.elements.shift();
  }

  peek (): T | undefined {
    return this.elements[0];
  }

  contains (item: T): boolean {
    for (const element of this.elements) {
      // console.log(element, item);
      if (element.equals(item)) {
        return true;
      }
    }
    return false;
  }

  length (): number {
    return this.elements.length;
  }
}
