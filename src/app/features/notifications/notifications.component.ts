import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { NotificationCategory } from '../../shared/interfaces/banking.models';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

type FilterTab = 'all' | NotificationCategory;

@Component({
  selector: 'app-notifications',
  imports: [NgClass, RelativeTimePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  readonly notificationService = inject(NotificationService);
  readonly activeTab = signal<FilterTab>('all');
  private subscription?: Subscription;

  readonly tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'bi-inbox' },
    { key: 'payment', label: 'Payments', icon: 'bi-wallet2' },
    { key: 'security', label: 'Security', icon: 'bi-shield-check' },
    { key: 'promo', label: 'Promotions', icon: 'bi-megaphone' },
    { key: 'system', label: 'System', icon: 'bi-gear' }
  ];

  readonly filtered = computed(() => {
    const tab = this.activeTab();
    return this.notificationService.getByCategory(tab);
  });

  readonly unreadInTab = computed(() => this.filtered().filter((n) => !n.read).length);

  ngOnInit(): void {
    // Demonstrates RxJS subscription to live notification stream
    this.subscription = this.notificationService.newNotification$.subscribe((notification) => {
      console.log('New notification received:', notification.title);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  setTab(tab: FilterTab): void { this.activeTab.set(tab); }
  markRead(id: string): void { this.notificationService.markAsRead(id); }
  dismiss(id: string): void { this.notificationService.dismiss(id); }
  markAllRead(): void { this.notificationService.markAllAsRead(); }

  categoryLabel(category: NotificationCategory): string {
    const map: Record<NotificationCategory, string> = { payment: 'Payment', security: 'Security', promo: 'Promotion', system: 'System' };
    return map[category];
  }

  categoryColor(category: NotificationCategory): string {
    const map: Record<NotificationCategory, string> = { payment: 'blue', security: 'green', promo: 'violet', system: 'orange' };
    return map[category];
  }
}
