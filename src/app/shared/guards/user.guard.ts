import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BankingService } from '../services/banking.service';

export const userGuard: CanActivateFn = () => {
  const bank = inject(BankingService);
  const router = inject(Router);

  if (!bank.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (bank.currentUserRole() === 'user') {
    return true;
  }

  // If role is admin, redirect them to admin dashboard
  if (bank.currentUserRole() === 'admin') {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/login']);
};
