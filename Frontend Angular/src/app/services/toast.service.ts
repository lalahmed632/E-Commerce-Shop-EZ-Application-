import { Injectable } from '@angular/core';
import { ToastMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages: ToastMessage[] = [];

  show(text: string, categoryClass = 'toast-cat-light-green'): void {
    const id = Date.now();
    this.messages.push({ id, text, categoryClass });
    window.setTimeout(() => this.dismiss(id), 1600);
  }

  private dismiss(id: number): void {
    this.messages = this.messages.filter((message) => message.id !== id);
  }
}
