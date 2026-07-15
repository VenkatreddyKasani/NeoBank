import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BankingService } from '../services/banking.service';

export const adminGuard: CanActivateFn = () => {
  const bank = inject(BankingService);
  const router = inject(Router);

  if (!bank.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (bank.currentUserRole() === 'admin') {
    return true;
  }

  // If role is user, redirect them to user dashboard
  if (bank.currentUserRole() === 'user') {
    return router.createUrlTree(['/user/dashboard']);
  }

  return router.createUrlTree(['/login']);
};
