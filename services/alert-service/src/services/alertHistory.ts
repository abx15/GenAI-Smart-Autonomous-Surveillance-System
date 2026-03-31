import { IAlert } from '../models/Alert';

class AlertHistory {
  private buffer: IAlert[] = [];
  private readonly max_size = 100;

  add(alert: IAlert) {
    this.buffer.push(alert);
    if (this.buffer.length > this.max_size) {
      this.buffer.shift(); // Remove oldest
    }
  }

  getLast(n: number): IAlert[] {
    return this.buffer.slice(-n);
  }

  clear() {
    this.buffer = [];
  }

  getAll(): IAlert[] {
    return [...this.buffer];
  }
}

export const alertHistory = new AlertHistory();
