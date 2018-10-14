export type Listener = {
  type: 'one' | 'every';
  invok: Function;
};

export class Observable<Event extends String, Invok extends Function> {
  events: Event[];
  handlers = new Map<Event, Listener[]>();

  constructor(...events: Event[]) {
    this.events = events;
    for (const event of events) {
      this.handlers.set(event, []);
    }
  }

  supportedEvents() {
    return this.events;
  }

  getListeners(event: Event) {
    return this.handlers.get(event);
  }

  fireEvent(event: Event, ...params: any[]) {
    if (!this.handlers.has(event)) {
      return;
    }
    const listeners = this.handlers.get(event) as Listener[];
    for (const listener of listeners) {
      const { invok } = listener;
      try {
        invok(...params);
      } catch (err) {
        console.warn(err);
      }
    }
    this.handlers.set(event, listeners.filter(sub => sub.type === 'every'));
  }

  one(event: Event, callback: Invok) {
    if (!this.handlers.has(event)) {
      return;
    }
    const listeners = this.handlers.get(event) as Listener[];
    listeners.push({ type: 'one', invok: callback });
  }

  on(event: Event, callback: Invok) {
    if (!this.handlers.has(event)) {
      return;
    }
    const listeners = this.handlers.get(event) as Listener[];
    listeners.push({ type: 'every', invok: callback });
  }

  un(event: Event, callback?: Invok) {
    if (!this.handlers.has(event)) {
      return;
    }
    const listeners = this.handlers.get(event) as Listener[];
    if (callback) {
      this.handlers.set(event, listeners.filter(({ invok }) => invok === callback));
    } else {
      listeners.length = 0;
    }
  }
}
