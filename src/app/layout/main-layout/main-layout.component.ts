import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BankingService } from '../../shared/services/banking.service';
import { NotificationService } from '../../shared/services/notification.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  readonly bank = inject(BankingService);
  readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly compact = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly darkMode = signal(false);

  readonly activeRole = computed(() => this.bank.currentUserRole() || 'user');

  readonly menu = computed<NavigationItem[]>(() => {
    if (this.activeRole() === 'admin') {
      return [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/admin/dashboard' },
        { label: 'Customers', icon: 'bi-people', route: '/admin/customers' },
        { label: 'Accounts', icon: 'bi-wallet2', route: '/admin/accounts' },
        { label: 'Transactions', icon: 'bi-arrow-left-right', route: '/admin/transactions' },
        { label: 'Pending KYC', icon: 'bi-person-check', route: '/admin/kyc' },
        { label: 'Loans', icon: 'bi-cash-coin', route: '/admin/loans' },
        { label: 'Cards', icon: 'bi-credit-card-2-front', route: '/admin/cards' },
        { label: 'Reports', icon: 'bi-bar-chart-line', route: '/admin/reports' }
      ];
    }

    return [
      { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/user/dashboard' },
      { label: 'Accounts', icon: 'bi-wallet2', route: '/user/accounts' },
      { label: 'Loans', icon: 'bi-cash-coin', route: '/user/loans' },
      { label: 'Transactions', icon: 'bi-arrow-left-right', route: '/user/transactions' },
      { label: 'Payments', icon: 'bi-qr-code-scan', route: '/user/payments' },
      { label: 'Cards', icon: 'bi-credit-card-2-front', route: '/user/cards' },
      { label: 'Analytics', icon: 'bi-bar-chart-line', route: '/user/analytics' },
      { label: 'Investments', icon: 'bi-graph-up-arrow', route: '/user/investments' },
      { label: 'Statements', icon: 'bi-file-earmark-spreadsheet', route: '/user/statements' }
    ];
  });

  toggleSidebar(): void { this.compact.update((value) => !value); }
  toggleMobileMenu(): void { this.mobileMenuOpen.update((value) => !value); }
  closeMobileMenu(): void { this.mobileMenuOpen.set(false); }
  toggleTheme(): void { this.darkMode.update((value) => !value); }

  doLogout(): void {
    this.closeMobileMenu();
    this.bank.logout();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 991) this.mobileMenuOpen.set(false);
  }
}
