import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../shared/directives/card-elevation.directive';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgClass, DatePipe, DecimalPipe, InrPipe, CardElevationDirective, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  readonly bank = inject(BankingService);
  private readonly router = inject(Router);

  @ViewChild('spendingChart') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  readonly balanceVisible = signal(true);
  readonly emergencyFundCurrent = signal(360000);
  readonly emergencyFundTarget = 500000;

  readonly showCreateAccountModal = signal(false);
  newAccountName = 'Neo Savings Vault';
  newAccountType: 'Savings' | 'Current' | 'Salary' | 'Joint' = 'Savings';
  newAccountInitialDeposit = 15000;

  readonly showLoanModal = signal(false);
  newLoanType = 'Personal Instant Credit Line';
  newLoanAmount = 250000;
  newLoanTenure = '36 Months';

  readonly calculatedEmi = computed(() => {
    const months = parseInt(this.newLoanTenure) || 36;
    const rate = this.newLoanType.includes('Home') ? 0.084 : (this.newLoanType.includes('Auto') ? 0.092 : 0.105);
    const r = rate / 12;
    const emi = (this.newLoanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  });

  readonly emergencyFundPercent = computed(() => {
    return Math.min(Math.round((this.emergencyFundCurrent() / this.emergencyFundTarget) * 100), 100);
  });

  readonly primaryAccount = computed(() => {
    return this.bank.accountsList().find((a) => a.id === 'primary' || a.accountType === 'Savings' || a.type.includes('Savings')) || this.bank.accountsList()[0];
  });

  readonly chartLegend = [
    { name: 'Income', color: 'income' },
    { name: 'Spend', color: 'spend' }
  ];

  readonly bills = [
    { name: 'Tata Power Electricity', due: 'Due tomorrow', amount: 1725, icon: 'bi-lightning-charge', color: 'amber' },
    { name: 'Airtel Xstream Fiber', due: 'Due 22 Jul', amount: 999, icon: 'bi-wifi', color: 'blue' },
    { name: 'HDFC Credit Card Bill', due: 'Due 28 Jul', amount: 14250, icon: 'bi-credit-card', color: 'violet' }
  ];

  readonly tips = [
    { icon: 'bi-piggy-bank', title: 'Automate your wealth creation', detail: 'Set up recurring auto-debit of 15% salary into high-yield Growth Vaults.' },
    { icon: 'bi-shield-check', title: 'Enable Geo-locked Card Security', detail: 'Lock international transactions when not traveling abroad via Cards tab.' },
    { icon: 'bi-graph-up-arrow', title: 'Maximize UPI rewards program', detail: 'Earn up to 2% cashback when paying merchant QR codes directly from Neo Primary.' }
  ];

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  toggleBalance(): void {
    this.balanceVisible.update((v) => !v);
  }

  openCreateAccountModal(): void {
    this.showCreateAccountModal.set(true);
  }

  closeCreateAccountModal(): void {
    this.showCreateAccountModal.set(false);
  }

  submitCreateAccount(): void {
    if (this.newAccountInitialDeposit <= 0) {
      alert('Please enter a valid initial deposit amount.');
      return;
    }

    this.bank.createBankAccount({
      name: this.newAccountName,
      type: `${this.newAccountType} Account`,
      number: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: this.newAccountInitialDeposit,
      color: this.newAccountType === 'Savings' ? 'blue' : this.newAccountType === 'Current' ? 'violet' : 'green',
      status: 'active',
      holderName: this.bank.profile().name,
      holderId: this.bank.profile().customerId || 'NEO-894210',
      accountType: this.newAccountType
    });

    this.closeCreateAccountModal();
  }

  addQuickMoney(): void {
    this.bank.addMoney(5000, 'Instant account top up (+₹5,000)');
  }

  addToEmergencyFund(): void {
    if (this.bank.balance() >= 10000) {
      if (this.bank.sendMoney(10000, 'Emergency Fund Vault Transfer', 'Transfer')) {
        this.emergencyFundCurrent.update((v) => v + 10000);
      }
    } else {
      this.bank.addMoney(0, 'Insufficient balance to add ₹10,000 to goal');
    }
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

  doLogout(): void {
    this.bank.logout();
  }

  private createChart(): void {
    if (!this.chartCanvas) return;
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          { label: 'Income', data: [68, 72, 65, 77, 73, 85], backgroundColor: '#dbeafe', borderRadius: 8, borderSkipped: false, barPercentage: 0.55 },
          { label: 'Spend', data: [37, 45, 34, 50, 41, 48], backgroundColor: '#2563eb', borderRadius: 8, borderSkipped: false, barPercentage: 0.55 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 12,
            displayColors: false,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y},000` }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 12, weight: 'bold' } } },
          y: { display: false, beginAtZero: true, suggestedMax: 100 }
        }
      }
    };
    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }
}
