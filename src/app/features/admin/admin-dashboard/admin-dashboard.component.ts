import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BankingService } from '../../../shared/services/banking.service';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, NgClass, DatePipe, InrPipe, CardElevationDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements AfterViewInit, OnDestroy {
  readonly bank = inject(BankingService);

  @ViewChild('accountsChart') accountsCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('transactionsChart') txnsCanvas?: ElementRef<HTMLCanvasElement>;

  private chart1?: Chart;
  private chart2?: Chart;

  readonly totalUsersCount = computed(() => this.bank.usersList().length);
  readonly totalAccountsCount = computed(() => this.bank.accountsList().length);
  readonly pendingKycCount = computed(() => this.bank.usersList().filter((u) => u.kycStatus === 'Pending').length || 4);


  readonly recentRegistrations = computed(() => this.bank.usersList().slice(0, 5));
  readonly recentSystemTransactions = computed(() => this.bank.transactions().slice(0, 6));

  ngAfterViewInit(): void {
    this.initCharts();
  }

  ngOnDestroy(): void {
    this.chart1?.destroy();
    this.chart2?.destroy();
  }

  private initCharts(): void {
    if (this.accountsCanvas) {
      const cfg1: ChartConfiguration = {
        type: 'line',
        data: {
          labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'New Bank Accounts',
            data: [120, 185, 240, 310, 425, 580],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
      };
      this.chart1 = new Chart(this.accountsCanvas.nativeElement, cfg1);
    }

    if (this.txnsCanvas) {
      const cfg2: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            { label: 'IMPS/UPI Volume (Lakhs ₹)', data: [45, 62, 58, 79, 94, 128], backgroundColor: '#10b981', borderRadius: 6 },
            { label: 'Card Volume (Lakhs ₹)', data: [22, 31, 28, 41, 52, 68], backgroundColor: '#6366f1', borderRadius: 6 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
      };
      this.chart2 = new Chart(this.txnsCanvas.nativeElement, cfg2);
    }
  }
}
