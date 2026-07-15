import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { userGuard } from './shared/guards/user.guard';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  // Public Routes
  { path: 'welcome', loadComponent: () => import('./features/public/landing/landing.component').then((m) => m.LandingComponent), title: 'Welcome | Virtual Banking Portal' },
  { path: 'about', loadComponent: () => import('./features/public/about/about.component').then((m) => m.AboutComponent), title: 'About Us | NeoBank' },
  { path: 'services', loadComponent: () => import('./features/public/services/services.component').then((m) => m.ServicesComponent), title: 'Banking Services & Capabilities | NeoBank' },
  { path: 'open-account', loadComponent: () => import('./features/public/open-account/open-account.component').then((m) => m.OpenAccountComponent), title: 'Open Bank Account | NeoBank' },
  { path: 'login', loadComponent: () => import('./features/authentication/login/login.component').then((m) => m.LoginComponent), title: 'Sign in | Virtual Banking Portal' },
  { path: 'register', loadComponent: () => import('./features/authentication/register/register.component').then((m) => m.RegisterComponent), title: 'User Registration | Virtual Banking Portal' },

  // User Portal Routes (/user/*)
  {
    path: 'user',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard, userGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent), title: 'User Dashboard | Virtual Banking Portal' },
      { path: 'accounts', loadComponent: () => import('./features/accounts/accounts.component').then((m) => m.AccountsComponent), title: 'My Accounts | Virtual Banking Portal' },
      { path: 'loans', loadComponent: () => import('./features/loans/loans.component').then((m) => m.LoansComponent), title: 'My Loans & Credit | Virtual Banking Portal' },
      { path: 'transactions', loadComponent: () => import('./features/transactions/transactions.component').then((m) => m.TransactionsComponent), title: 'Transactions | Virtual Banking Portal' },
      { path: 'payments', loadComponent: () => import('./features/payments/payments.component').then((m) => m.PaymentsComponent), title: 'Payments & Bills | Virtual Banking Portal' },
      { path: 'cards', loadComponent: () => import('./features/cards/cards.component').then((m) => m.CardsComponent), title: 'Virtual Cards | Virtual Banking Portal' },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent), title: 'Financial Analytics | Virtual Banking Portal' },
      { path: 'investments', loadComponent: () => import('./features/investments/investments.component').then((m) => m.InvestmentsComponent), title: 'Investments | Virtual Banking Portal' },
      { path: 'statements', loadComponent: () => import('./features/statements/statements.component').then((m) => m.StatementsComponent), title: 'Account Statements | Virtual Banking Portal' },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent), title: 'Notifications | Virtual Banking Portal' },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent), title: 'User Profile | Virtual Banking Portal' },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent), title: 'Account Settings | Virtual Banking Portal' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },

  // Admin Portal Routes (/admin/*)
  {
    path: 'admin',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent), title: 'Admin Dashboard | Virtual Banking Portal' },
      { path: 'customers', loadComponent: () => import('./features/admin/admin-customers/admin-customers.component').then((m) => m.AdminCustomersComponent), title: 'Customer Management | Virtual Banking Portal' },
      { path: 'accounts', loadComponent: () => import('./features/admin/admin-accounts/admin-accounts.component').then((m) => m.AdminAccountsComponent), title: 'Account Management | Virtual Banking Portal' },
      { path: 'transactions', loadComponent: () => import('./features/admin/admin-transactions/admin-transactions.component').then((m) => m.AdminTransactionsComponent), title: 'Portal Transactions | Virtual Banking Portal' },
      { path: 'kyc', loadComponent: () => import('./features/admin/admin-kyc/admin-kyc.component').then((m) => m.AdminKycComponent), title: 'Pending KYC | Virtual Banking Portal' },
      { path: 'loans', loadComponent: () => import('./features/admin/admin-loans/admin-loans.component').then((m) => m.AdminLoansComponent), title: 'Loan Requests | Virtual Banking Portal' },
      { path: 'cards', loadComponent: () => import('./features/admin/admin-cards/admin-cards.component').then((m) => m.AdminCardsComponent), title: 'Card Operations | Virtual Banking Portal' },
      { path: 'reports', loadComponent: () => import('./features/admin/admin-reports/admin-reports.component').then((m) => m.AdminReportsComponent), title: 'System Reports | Virtual Banking Portal' },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent), title: 'Broadcast Notifications | Virtual Banking Portal' },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent), title: 'Portal Settings | Virtual Banking Portal' },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },

  // Backward-compatible Root and Alias Redirects
  { path: 'dashboard', redirectTo: 'user/dashboard', pathMatch: 'full' },
  { path: 'accounts', redirectTo: 'user/accounts', pathMatch: 'full' },
  { path: 'loans', redirectTo: 'user/loans', pathMatch: 'full' },
  { path: 'transactions', redirectTo: 'user/transactions', pathMatch: 'full' },
  { path: 'payments', redirectTo: 'user/payments', pathMatch: 'full' },
  { path: 'cards', redirectTo: 'user/cards', pathMatch: 'full' },
  { path: 'analytics', redirectTo: 'user/analytics', pathMatch: 'full' },
  { path: 'investments', redirectTo: 'user/investments', pathMatch: 'full' },
  { path: 'statements', redirectTo: 'user/statements', pathMatch: 'full' },
  { path: 'notifications', redirectTo: 'user/notifications', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'user/profile', pathMatch: 'full' },
  { path: 'settings', redirectTo: 'user/settings', pathMatch: 'full' },
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'welcome' }
];
