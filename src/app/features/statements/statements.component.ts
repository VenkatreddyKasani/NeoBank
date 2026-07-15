import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-statements',
  imports: [NgClass, DatePipe, UpperCasePipe, InrPipe, CardElevationDirective, FormsModule],

  templateUrl: './statements.component.html',
  styleUrl: './statements.component.css'
})
export class StatementsComponent {
  readonly bank = inject(BankingService);

  selectedAccountId = 'all';
  dateRange = '30days';
  searchQuery = '';

  readonly filteredTransactions = computed(() => {
    const list = this.bank.transactions();
    const query = this.searchQuery.trim().toLowerCase();

    return list.filter((txn) => {
      if (this.selectedAccountId !== 'all' && txn.accountId && txn.accountId !== this.selectedAccountId) {
        return false;
      }
      if (query && !txn.merchant.toLowerCase().includes(query) && !txn.category.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  });

  downloadStatement(format: 'PDF' | 'EXCEL'): void {
    const formatName = format === 'PDF' ? 'PDF Document (.pdf)' : 'Excel Spreadsheet (.xlsx)';
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert(`Statement successfully generated and downloaded as ${formatName}.`, 'success');
    } else {
      alert(`Statement successfully generated and downloaded as ${formatName}.`);
    }
  }
}
