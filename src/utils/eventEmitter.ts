type EventCallback = (...args: any[]) => void

export interface EventMap {
  [key: string]: EventCallback[]
}

export class EventEmitter {
  private events: EventMap = {}

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    return this
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return this
    this.events[event] = this.events[event].filter(cb => cb !== callback)
    return this
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return false
    this.events[event].forEach(callback => callback(...args))
    return true
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.events[event] = []
    } else {
      this.events = {}
    }
    return this
  }
}

// Create and export instances for different purposes
export const loadingEvents = new EventEmitter()
export const tokenizerEvents = new EventEmitter()