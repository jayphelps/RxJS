export enum NodeKind {
  MARBLE_DIAGRAM = 'MARBLE_DIAGRAM',
  NEXT = 'NEXT',
  NEXT_PLACEHOLDER = 'NEXT_PLACEHOLDER',
  ERROR = 'ERROR',
  ERROR_PLACEHOLDER = 'ERROR_PLACEHOLDER',
  COMPLETE = 'COMPLETE',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  MICRO_TASK = 'MICRO_TASK',
  MACRO_TASK = 'MACRO_TASK',
  QUEUE = 'QUEUE',
  TIME_PROGRESSION = 'TIME_PROGRESSION',
}

export interface Node {
  kind: NodeKind;
}

export class NextPlaceholder implements Node {
  kind: NodeKind.NEXT_PLACEHOLDER = NodeKind.NEXT_PLACEHOLDER;

  constructor(public id: string) {}
}

export class Next implements Node {
  kind: NodeKind.NEXT = NodeKind.NEXT;

  constructor(public value: any) {}
}

export class ErrorPlaceholder implements Node {
  kind: NodeKind.ERROR_PLACEHOLDER = NodeKind.ERROR_PLACEHOLDER;
}

export class Error implements Node {
  kind: NodeKind.ERROR = NodeKind.ERROR;

  constructor(public value?: any) {}
}

export class Complete implements Node {
  kind: NodeKind.COMPLETE = NodeKind.COMPLETE;
}

export class MacroTask implements Node {
  kind: NodeKind.MACRO_TASK = NodeKind.MACRO_TASK;
}

export class MicroTask implements Node {
  kind: NodeKind.MICRO_TASK = NodeKind.MICRO_TASK;
}

export class Queue implements Node {
  kind: NodeKind.QUEUE = NodeKind.QUEUE;
}

export class Subscribe implements Node {
  kind: NodeKind.SUBSCRIBE = NodeKind.SUBSCRIBE;
}

export class Unsubscribe implements Node {
  kind: NodeKind.UNSUBSCRIBE = NodeKind.UNSUBSCRIBE;
}

export enum DurationUnit {
  MILLISECONDS = 'MILLISECONDS',
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
}

export class TimeProgression implements Node {
  kind: NodeKind.TIME_PROGRESSION = NodeKind.TIME_PROGRESSION;

  constructor(public duration: number,public unit: DurationUnit) {}
}

export type Event
  = NextPlaceholder
  | Next
  | ErrorPlaceholder
  | Error
  | Complete
  | MacroTask
  | MicroTask
  | Queue
  | Subscribe
  | Unsubscribe
  | TimeProgression
  ;

export class MarbleDiagram implements Node {
  kind: NodeKind.MARBLE_DIAGRAM = NodeKind.MARBLE_DIAGRAM;

  constructor(public events: Event[]) {}
}
