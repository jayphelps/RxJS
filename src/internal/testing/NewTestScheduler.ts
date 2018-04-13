import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { VirtualTimeScheduler, VirtualAction } from '../scheduler/VirtualTimeScheduler';
import { Scheduler, SchedulerKind } from '../Scheduler';
import { Parser } from './parser';

import {
  Event, NodeKind, Next, Error, Complete, TimeProgression,
  DurationUnit, MacroTask, MicroTask
} from './ast';

export interface MarbleValues {
  [key: string]: any[];
}

export function marbles(diagram: string, values: MarbleValues = {}, errorValue?: any): Event[] {
  const parser = new Parser();
  const { events } = parser.parse(diagram);

  return events.reduce((results: any, event: any) => {
    switch (event.kind) {
      case NodeKind.NEXT_PLACEHOLDER:
        if (event.id in values) {
          const nexts = values[event.id].map(value => new Next(value));
          return results.concat(nexts);
        } else {
          return results.concat(new Next(event.id));
        }

      case NodeKind.ERROR_PLACEHOLDER:
        return results.concat(new Error(errorValue));

      default:
        return results.concat(event);
    }
  }, []);
}

export function run<T>(stream: Observable<T>): Event[] {
  const scheduler = new NewTestScheduler();
  Scheduler.delegate = scheduler;
  const events = scheduler.run(stream);
  scheduler.flush();
  Scheduler.delegate = undefined;
  return events;
}

export function millisecondsToTimeProgression(ms: number) {
  if (ms < 1000) {
    return new TimeProgression(ms, DurationUnit.MILLISECONDS);
  } else if (ms < 1000 * 60) {
    return new TimeProgression(ms / 1000, DurationUnit.SECONDS);
  } else {
    return new TimeProgression(ms / 1000 / 60, DurationUnit.MINUTES);
  }
}

export class NewTestAction<T> extends VirtualAction <T> {
  public schedule(state?: T, delay: number = 0): Subscription {
    const { scheduler, originalScheduler } = this;

    if (!this.id) {
      const events = (scheduler as NewTestScheduler).events;

      switch (originalScheduler.kind) {
        case SchedulerKind.ASYNC:
          if (delay === 0) {
            events.push(new MacroTask());
          } else {
            const event = millisecondsToTimeProgression(delay);
            events.push(event);
          }
          break;

        case SchedulerKind.ASAP:
          if (delay === 0) {
            events.push(new MicroTask());
          } else {
            const event = millisecondsToTimeProgression(delay);
            events.push(event);
          }
          break;

        default:
          throw new TypeError(`Unknown scheduler kind: ${originalScheduler.kind}`);
      }

      return super.schedule(state, delay);
    }
    this.active = false;
    const action = new NewTestAction(scheduler, this.work, undefined, originalScheduler);
    this.add(action);
    return action.schedule(state, delay);
  }
}

export class NewTestScheduler extends VirtualTimeScheduler {
  public kind = SchedulerKind.NEW;
  events: Event[] = [];
  subscription?: Subscription;

  constructor() {
    super(NewTestAction, Infinity);
  }

  run<T>(stream: Observable<T>): Event[] {
    this.subscription = stream.subscribe({
      next: value => this.events.push(new Next(value)),
      error: value => this.events.push(new Error(value)),
      complete: () => this.events.push(new Complete())
    });

    return this.events;
  }
}
