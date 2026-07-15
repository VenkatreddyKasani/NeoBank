import { Component, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { BankingService } from '../../../shared/services/banking.service';
import { LoanApplication } from '../../../shared/interfaces/banking.models';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-admin-loans',
  imports: [NgClass, DatePipe, InrPipe, CardElevationDirective],
  templateUrl: './admin-loans.component.html',
  styleUrl: './admin-loans.component.css'
})
export class AdminLoansComponent {
  readonly bank = inject(BankingService);

  readonly loans = this.bank.loansList;

  updateStatus(id: string, newStatus: 'Approved' | 'Rejected'): void {
    this.bank.updateLoanStatus(id, newStatus);
  }
}

