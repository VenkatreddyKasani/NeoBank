import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-loans',
  imports: [NgClass, DatePipe, DecimalPipe, InrPipe, CardElevationDirective, FormsModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css'
})
export class LoansComponent {
  readonly bank = inject(BankingService);

  readonly filterTab = signal<'ALL' | 'Active' | 'Pending' | 'Closed'>('ALL');
  readonly showLoanModal = signal(false);

  newLoanType = 'Personal Instant Credit Line';
  newLoanAmount = 250000;
  newLoanTenure = '36 Months';

  readonly filteredLoans = computed(() => {
    const list = this.bank.userLoans();
    const tab = this.filterTab();
    if (tab === 'ALL') return list;
    return list.filter((l) => l.status === tab);
  });

  readonly totalSanctioned = computed(() => {
    return this.bank.userLoans().reduce((sum, l) => sum + (l.amount || 0), 0);
  });

  readonly totalOutstanding = computed(() => {
    return this.bank.userLoans().reduce((sum, l) => sum + (l.remainingAmount !== undefined ? l.remainingAmount : (l.amount || 0)), 0);
  });

  readonly monthlyEmiTotal = computed(() => {
    return this.bank.userLoans()
      .filter((l) => l.status === 'Active')
      .reduce((sum, l) => sum + (l.emi || 0), 0);
  });

  readonly calculatedEmi = computed(() => {
    const months = parseInt(this.newLoanTenure) || 36;
    const rate = this.newLoanType.includes('Home') ? 0.084 : (this.newLoanType.includes('Auto') ? 0.092 : 0.105);
    const r = rate / 12;
    const emi = (this.newLoanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  });

  setTab(tab: 'ALL' | 'Active' | 'Pending' | 'Closed'): void {
    this.filterTab.set(tab);
  }

  openLoanModal(): void {
    this.showLoanModal.set(true);
  }

  closeLoanModal(): void {
    this.showLoanModal.set(false);
  }

  submitLoanApplication(): void {
    if (this.newLoanAmount <= 0) {
      alert('Please enter a valid loan amount.');
      return;
    }
    this.bank.applyForLoan({
      customerName: this.bank.profile().name,
      customerId: this.bank.profile().customerId || 'NEO-894210',
      type: this.newLoanType,
      amount: this.newLoanAmount,
      tenure: this.newLoanTenure,
      emi: this.calculatedEmi(),
      interestRate: this.newLoanType.includes('Home') ? 8.4 : (this.newLoanType.includes('Auto') ? 9.2 : 10.5)
    });
    this.closeLoanModal();
  }

  payEmi(loanId: string): void {
    this.bank.payLoanEmi(loanId);
  }
}
