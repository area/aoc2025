// A* finds a path from start to goal.

import { type Position } from './positions';
import { PriorityQueue } from './priorityQueue';

function getGScore (gScore: Map<string, number>, p: Position): number {
  const score = gScore.get(p.toString());
  if (score === undefined) {
    return Infinity;
  }
  return score;
}

function setGScore (g: Map<string, number>, p: Position, value: number): void {
  g.set(p.toString(), value);
}

function getFScore (f: Map<string, number>, p: Position): number {
  const score = f.get(p.toString());
  if (score === undefined) {
    return Infinity;
  }
  return score;
}
function setFScore (fScore: Map<string, number>, p: Position, value: number): void {
  fScore.set(p.toString(), value);
}

function getLowestFInOpenSet (openSet: PriorityQueue<Position>): Position {
  const value = openSet.peek();
  if (value === undefined) {
    throw new Error('openSet is empty');
  }
  return value;
}

function getCameFrom (cameFrom: Map<string, Position>, p: Position): Position | undefined {
  return cameFrom.get(p.toString());
};

const setCameFrom = (cameFrom: Map<string, Position>, p: Position, value: Position): void => {
  cameFrom.set(p.toString(), value);
};

function reconstructPath (cameFrom: Map<string, Position>, current: Position): Position[] {
  const totalPath = [];
  let cameFromNode: Position | undefined = current;
  while (cameFromNode !== undefined) {
    totalPath.unshift(cameFromNode);
    cameFromNode = getCameFrom(cameFrom, cameFromNode);
  }
  return totalPath;
}

// h is the heuristic function. h(n) estimates the cost to reach goal from node n.
export function aStar (start: Position, goal: Position, h: (p: Position) => number, getValidNeighborsFunction: (p: Position) => Position[], costBetween: (p: Position, q: Position, cameFrom: Map<string, Position>) => number): Position[] {
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const openSet = new PriorityQueue(function (p: Position) { return getFScore(fScore, p); });
  const cameFrom = new Map<string, Position>();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  setGScore(gScore, start, 0);

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how cheap a path could be from start to finish if it goes through n.
  setFScore(fScore, start, h(start));

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  openSet.put(start);

  while (openSet.length() > 0) {
    // console.log(openSet.length());
    // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
    const current = getLowestFInOpenSet(openSet);
    if (current.equals(goal)) {
      return reconstructPath(cameFrom, current);
    }
    openSet.pop();
    const neighbors = getValidNeighborsFunction(current);

    for (const n of neighbors) {
      const tentativeGScore = getGScore(gScore, current) + costBetween(current, n, cameFrom);
      // console.log(current, getGScore(current), grid[n.y][n.x], tentativeGScore);
      if (tentativeGScore < getGScore(gScore, n)) {
        // This path to neighbor is better than any previous one. Record it!
        setCameFrom(cameFrom, n, current);
        setGScore(gScore, n, tentativeGScore);
        setFScore(fScore, n, tentativeGScore + h(n));
        if (!openSet.contains(n)) {
          openSet.put(n);
        }
      }
    }
  }
  // Open set is empty but goal was never reached
  return [];
}
