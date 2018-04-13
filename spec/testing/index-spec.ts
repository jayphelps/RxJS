import { expect } from 'chai';
import { run, marbles } from 'rxjs/testing';
import {
  asyncScheduler, Observable, Scheduler, VirtualTimeScheduler,
  VirtualAction, of, Subscription, SchedulerAction, range
} from 'rxjs';
import {
  Event, NodeKind, MarbleDiagram, Next, Error, Complete, MacroTask,
  MicroTask, Queue, Subscribe, Unsubscribe, TimeProgression, DurationUnit
} from 'rxjs/internal/testing/ast';

describe('index', () => {
  describe('run()', () => {
    it('should handle a single synchronous emission', () => {
      const output$ = of(1);
      const actual = run(output$);
      const expected = marbles('a|', {
        a: [1]
      });

      expect(actual).to.deep.equal(expected);
    });

    it('should handle multiple synchronous emissions', () => {
      const output$ = of(1, 2, 3);
      const actual = run(output$);
      const expected = marbles('a|', {
        a: [1, 2, 3]
      });

      expect(actual).to.deep.equal(expected);
    });

    it.only('should handle macrotasks', () => {
      const output$ = range(1, 3, asyncScheduler);
      const actual = run(output$);
      const expected = marbles('-a-b-c-|', {
        a: [1],
        b: [2],
        c: [3]
      });

      expect(actual).to.deep.equal(expected);
    });
  });

  it('should support identifiers as marbles', () => {
    const a = marbles('a');
    expect(a).to.deep.equal([
      new Next('a')
    ]);

    const abc = marbles('abc');
    expect(abc).to.deep.equal([
      new Next('abc')
    ]);

    const a2 = marbles('a', {
      a: [1]
    });
    expect(a2).to.deep.equal([
      new Next(1)
    ]);

    const a3 = marbles('a', {
      a: [1, 2, 3]
    });
    expect(a3).to.deep.equal([
      new Next(1),
      new Next(2),
      new Next(3)
    ]);
  });

  it('should support # as errors', () => {
    const a = marbles('#');
    expect(a).to.deep.equal([
      new Error()
    ]);

    const error = new TypeError('wow');
    const b = marbles('#', {}, error);
    expect(b).to.deep.equal([
      new Error(error)
    ]);
  });

  it('should support | as complete', () => {
    const a = marbles('|');
    expect(a).to.deep.equal([
      new Complete()
    ]);
  });

  it('should support - as a macrotask', () => {
    const a = marbles('-');
    expect(a).to.deep.equal([
      new MacroTask()
    ]);

    const b = marbles('---');
    expect(b).to.deep.equal([
      new MacroTask(),
      new MacroTask(),
      new MacroTask()
    ]);
  });

  it('should support ~ as a microtask', () => {
    const a = marbles('~');
    expect(a).to.deep.equal([
      new MicroTask()
    ]);

    const b = marbles('~~~');
    expect(b).to.deep.equal([
      new MicroTask(),
      new MicroTask(),
      new MicroTask()
    ]);
  });

  it('should support + as a queue', () => {
    const a = marbles('+');
    expect(a).to.deep.equal([
      new Queue()
    ]);

    const b = marbles('+++');
    expect(b).to.deep.equal([
      new Queue(),
      new Queue(),
      new Queue()
    ]);
  });

  it('should support ^ as a subscribe', () => {
    const a = marbles('^');
    expect(a).to.deep.equal([
      new Subscribe()
    ]);
  });

  it('should support ! as an unsubscribe', () => {
    const a = marbles('!');
    expect(a).to.deep.equal([
      new Unsubscribe()
    ]);
  });

  it('should support time durations', () => {
    const a = marbles('1ms 99s 100m');
    expect(a).to.deep.equal([
      new TimeProgression(1, DurationUnit.MILLISECONDS),
      new TimeProgression(99, DurationUnit.SECONDS),
      new TimeProgression(100, DurationUnit.MINUTES)
    ]);
  });

  it('should support various combinations', () => {
    const a = marbles('a-b--c~d~~e 1ms f 99s g - 100m ~#');

    expect(a).to.deep.equal([
      new Next('a'),
      new MacroTask(),
      new Next('b'),
      new MacroTask(),
      new MacroTask(),
      new Next('c'),
      new MicroTask(),
      new Next('d'),
      new MicroTask(),
      new MicroTask(),
      new Next('e'),
      new TimeProgression(1, DurationUnit.MILLISECONDS),
      new Next('f'),
      new TimeProgression(99, DurationUnit.SECONDS),
      new Next('g'),
      new MacroTask(),
      new TimeProgression(100, DurationUnit.MINUTES),
      new MicroTask(),
      new Error()
    ]);

    const b = marbles('a-b--^c~d~~e 1ms f 99s g - ! 100m ~|');

    expect(b).to.deep.equal([
      new Next('a'),
      new MacroTask(),
      new Next('b'),
      new MacroTask(),
      new MacroTask(),
      new Subscribe(),
      new Next('c'),
      new MicroTask(),
      new Next('d'),
      new MicroTask(),
      new MicroTask(),
      new Next('e'),
      new TimeProgression(1, DurationUnit.MILLISECONDS),
      new Next('f'),
      new TimeProgression(99, DurationUnit.SECONDS),
      new Next('g'),
      new MacroTask(),
      new Unsubscribe(),
      new TimeProgression(100, DurationUnit.MINUTES),
      new MicroTask(),
      new Complete()
    ]);
  });
});
