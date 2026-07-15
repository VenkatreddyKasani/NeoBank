import { Injectable, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Notification, NotificationCategory } from '../interfaces/banking.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly state = signal<Notification[]>([
    { id: 'n-001', title: 'Salary credited', message: '₹82,500 received from employer into Neo Primary account.', category: 'payment', icon: 'bi-wallet2', timestamp: new Date('2026-07-14T09:15:00'), read: false },
    { id: 'n-002', title: 'New login detected', message: 'A sign-in was detected from Chrome on Windows in Mumbai.', category: 'security', icon: 'bi-shield-exclamation', timestamp: new Date('2026-07-14T08:02:00'), read: false },
    { id: 'n-003', title: 'Swiggy payment', message: '₹486 debited for Swiggy order #SW-29184.', category: 'payment', icon: 'bi-bag', timestamp: new Date('2026-07-12T20:34:00'), read: true },
    { id: 'n-004', title: 'Card spending limit updated', message: 'Your monthly card limit has been set to ₹25,000.', category: 'system', icon: 'bi-credit-card', timestamp: new Date('2026-07-12T14:20:00'), read: true },
    { id: 'n-005', title: 'Earn 7.5% with Fixed Deposits', message: 'Lock in high returns with NeoBank FDs. Start with just ₹5,000.', category: 'promo', icon: 'bi-megaphone', timestamp: new Date('2026-07-11T10:00:00'), read: false },
    { id: 'n-006', title: 'UPI payment successful', message: '₹3,200 sent to Riya Sharma via UPI.', category: 'payment', icon: 'bi-send', timestamp: new Date('2026-07-09T16:45:00'), read: true },
    { id: 'n-007', title: 'Passkey enabled', message: 'Biometric sign-in has been activated on your account.', category: 'security', icon: 'bi-fingerprint', timestamp: new Date('2026-07-08T11:30:00'), read: true },
    { id: 'n-008', title: 'Tata Power bill due', message: 'Your electricity bill of ₹1,725 is due tomorrow.', category: 'system', icon: 'bi-lightning-charge', timestamp: new Date('2026-07-07T09:00:00'), read: false },
    { id: 'n-009', title: 'Refer and earn ₹500', message: 'Invite friends to NeoBank and earn ₹500 per referral.', category: 'promo', icon: 'bi-gift', timestamp: new Date('2026-07-05T12:00:00'), read: true },
    { id: 'n-010', title: 'Microsoft 365 renewal', message: '₹689 debited for Microsoft 365 subscription renewal.', category: 'payment', icon: 'bi-cloud-check', timestamp: new Date('2026-07-10T06:15:00'), read: true }
  ]);

  /** RxJS subject emitting each new notification as it arrives */
  readonly newNotification$ = new Subject<Notification>();

  readonly notifications = this.state.asReadonly();
  readonly unreadCount = computed(() => this.state().filter((n) => !n.read).length);

  getByCategory(category: NotificationCategory | 'all'): Notification[] {
    return category === 'all' ? this.state() : this.state().filter((n) => n.category === category);
  }

  markAsRead(id: string): void {
    this.state.update((list) => list.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  markAllAsRead(): void {
    this.state.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  dismiss(id: string): void {
    this.state.update((list) => list.filter((n) => n.id !== id));
  }

  /** Push a new notification and emit it on the RxJS stream */
  push(data: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const notification: Notification = { ...data, id: crypto.randomUUID(), timestamp: new Date(), read: false };
    this.state.update((list) => [notification, ...list]);
    this.newNotification$.next(notification);
  }
}
