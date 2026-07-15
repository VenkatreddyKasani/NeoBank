import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-accounts',
  imports: [NgClass, DatePipe, FormsModule, InrPipe, CardElevationDirective],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent {
  readonly bank = inject(BankingService);
  readonly showNumbers = signal(false);
  readonly selectedAccountId = signal<string>('primary');
  readonly showStatementModal = signal(false);

  statementRange = 'Last 30 Days';
  statementFormat = 'PDF Document';

  readonly selectedAccount = computed(() => {
    return this.bank.accounts.find(a => a.id === this.selectedAccountId()) || this.bank.accounts[0];
  });

  readonly accountTransactions = computed(() => {
    return this.bank.transactions().slice(0, 5);
  });

  toggleNumbers(): void {
    this.showNumbers.update((value) => !value);
  }

  selectAccount(id: string): void {
    this.selectedAccountId.set(id);
  }

  openStatementModal(): void {
    this.showStatementModal.set(true);
  }

  closeStatementModal(): void {
    this.showStatementModal.set(false);
  }

  triggerStatementDownload(): void {
    this.bank.addMoney(0, `Downloaded ${this.statementRange} (${this.statementFormat})`);
    this.showStatementModal.set(false);
  }
}
