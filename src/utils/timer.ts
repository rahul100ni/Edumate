// Utility for precise timer management
export class PreciseTimer {
  private startTime: number | null = null;
  private remaining: number;
  private rafId: number | null = null;
  private lastUpdate: number | null = null;
  private visibilityHandler: () => void;

  constructor(
    private callback: (timeLeft: number, progress: number) => void,
    private duration: number,
    private onComplete: () => void
  ) {
    this.remaining = duration;
    this.visibilityHandler = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // Store the exact timestamp when tab becomes hidden
      // Store exact timestamp and state when hidden
      this.lastHiddenTime = Date.now()
      if (this.isRunning()) {
        this.pause()
      }
    } else if (this.startTime) {
      // Recalculate elapsed time and adjust remaining time
      const now = Date.now();
      // Calculate actual elapsed time using high-resolution timer if available
      const hiddenDuration = typeof performance !== 'undefined' 
        ? performance.now() - (this.lastHiddenTime || performance.now())
        : now - (this.lastHiddenTime || now);
      this.remaining = Math.max(0, this.remaining - hiddenDuration);
      
      // Sync with system clock
      this.lastUpdate = now;
      this.startTime = now;
      
      if (this.remaining <= 0) {
        this.stop();
        this.onComplete();
      } else {
        this.start();
      }
    }
  }

  start() {
    if (this.rafId !== null) return;
    
    this.startTime = Date.now();
    this.lastUpdate = this.startTime;
    this.tick();
  }

  pause() {
    if (this.rafId === null) return;
    
    if (this.lastUpdate && this.startTime) {
      const elapsed = Date.now() - this.lastUpdate;
      this.remaining -= elapsed;
    }
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.startTime = null;
    this.lastUpdate = null;
  }

  stop() {
    this.pause();
    this.remaining = this.duration;
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }

  private tick = () => {
    if (!this.startTime || !this.lastUpdate) return;

    const now = Date.now();
    const elapsed = Math.min(now - this.lastUpdate, 1000); // Cap at 1 second
    
    if (elapsed >= 1000) {
      this.remaining -= 1000;
      this.lastUpdate = now;

      if (this.remaining <= 0) {
        this.stop();
        this.onComplete();
        return;
      }

      const progress = ((this.duration - this.remaining) / this.duration) * 100;
      this.callback(Math.ceil(this.remaining / 1000), progress);
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  setDuration(newDuration: number) {
    const wasRunning = this.rafId !== null;
    this.pause();
    
    const progress = (this.duration - this.remaining) / this.duration;
    this.duration = newDuration;
    this.remaining = newDuration - (newDuration * progress);
    
    if (wasRunning) {
      this.start();
    }
  }

  getTimeLeft(): number {
    return Math.ceil(this.remaining / 1000);
  }

  isRunning(): boolean {
    return this.rafId !== null;
  }
}