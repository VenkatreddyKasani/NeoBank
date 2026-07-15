import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BankingService } from '../services/banking.service';

export const authGuard: CanActivateFn = () => {
  const bank = inject(BankingService);
  const router = inject(Router);

  if (bank.isLoggedIn() && bank.currentUserRole() !== null) {
    return true;
  }
  return router.createUrlTree(['/welcome']);
};
