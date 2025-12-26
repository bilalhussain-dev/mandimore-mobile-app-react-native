// EventEmitter.ts - Simple event emitter for cross-component communication
type Listener = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.events.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Listener): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// Singleton instance
const appEvents = new EventEmitter();

// Event names
export const EVENTS = {
  FAVORITES_UPDATED: 'FAVORITES_UPDATED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  LISTING_UPDATED: 'LISTING_UPDATED',      // When a listing is edited
  LISTING_DELETED: 'LISTING_DELETED',      // When a listing is deleted
  LISTING_CREATED: 'LISTING_CREATED',      // When a new listing is created
};

export default appEvents;