import { AsyncScheduler } from './AsyncScheduler';
import { SchedulerKind } from '../Scheduler';

export class QueueScheduler extends AsyncScheduler {
  public kind = SchedulerKind.QUEUE;
}
