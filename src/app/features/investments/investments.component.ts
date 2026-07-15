import { Component, computed, inject } from '@angular/core';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({ selector: 'app-investments', imports: [InrPipe], templateUrl: './investments.component.html', styleUrl: './investments.component.css' })
export class InvestmentsComponent {
  readonly bank = inject(BankingService);
  readonly gain = computed(() => this.bank.investmentValue() * .124);
  readonly products = [{ icon: 'bi-piggy-bank', name: 'Fixed deposit', detail: 'Up to 7.5% p.a. · Low risk', action: 'Explore FDs', color: 'blue' }, { icon: 'bi-pie-chart', name: 'Mutual funds', detail: 'Build wealth with diversified funds', action: 'Start SIP', color: 'violet' }, { icon: 'bi-bar-chart-line', name: 'Stocks', detail: 'Invest in Indian and global markets', action: 'View stocks', color: 'orange' }];
}
