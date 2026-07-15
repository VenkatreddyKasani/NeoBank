import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { SpendingCategory } from '../../shared/interfaces/banking.models';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  imports: [InrPipe, StatCardComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements AfterViewInit, OnDestroy {
  readonly bank = inject(BankingService);
  private readonly inrPipe = new InrPipe();

  @ViewChild('doughnutChart') doughnutCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendCanvas?: ElementRef<HTMLCanvasElement>;
  private doughnut?: Chart<'doughnut'>;
  private trend?: Chart<'line'>;

  readonly totalSpent = computed(() => this.bank.expenses());
  readonly transactionCount = computed(() => this.bank.transactions().filter((t) => t.type === 'debit').length);
  readonly avgDaily = computed(() => Math.round(this.totalSpent() / 30));

  readonly spendingCategories: SpendingCategory[] = [
    { name: 'Food & dining', amount: 8420, percentage: 28, color: '#f97316', icon: 'bi-bag' },
    { name: 'Subscriptions', amount: 5890, percentage: 19, color: '#8b5cf6', icon: 'bi-cloud-check' },
    { name: 'Utilities', amount: 4950, percentage: 16, color: '#eab308', icon: 'bi-lightning-charge' },
    { name: 'Shopping', amount: 4320, percentage: 14, color: '#ec4899', icon: 'bi-cart' },
    { name: 'Transport', amount: 3680, percentage: 12, color: '#06b6d4', icon: 'bi-car-front' },
    { name: 'Home', amount: 3240, percentage: 11, color: '#10b981', icon: 'bi-house-heart' }
  ];

  readonly topCategory = computed(() => this.spendingCategories[0].name);

  readonly budgets = [
    { name: 'Food & dining', spent: 8420, limit: 12000, icon: 'bi-bag', color: 'orange' },
    { name: 'Shopping', spent: 4320, limit: 5000, icon: 'bi-cart', color: 'pink' },
    { name: 'Subscriptions', spent: 5890, limit: 6000, icon: 'bi-cloud-check', color: 'violet' }
  ];

  formatInr(value: number): string { return this.inrPipe.transform(value); }
  budgetPercent(spent: number, limit: number): number { return Math.min(Math.round((spent / limit) * 100), 100); }

  ngAfterViewInit(): void {
    this.createDoughnut();
    this.createTrend();
  }

  ngOnDestroy(): void {
    this.doughnut?.destroy();
    this.trend?.destroy();
  }

  onStatClicked(label: string): void {
    // demonstrates @Output handling — could navigate or show detail
    console.log(`Stat card clicked: ${label}`);
  }

  private createDoughnut(): void {
    if (!this.doughnutCanvas) return;
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.spendingCategories.map((c) => c.name),
        datasets: [{
          data: this.spendingCategories.map((c) => c.amount),
          backgroundColor: this.spendingCategories.map((c) => c.color),
          borderWidth: 0,
          spacing: 3,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 11,
            displayColors: true,
            callbacks: { label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}` }
          }
        }
      }
    };
    this.doughnut = new Chart<'doughnut'>(this.doughnutCanvas.nativeElement, config);
  }

  private createTrend(): void {
    if (!this.trendCanvas) return;
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Spending',
          data: [1240, 890, 2180, 460, 1950, 3200, 780],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 11,
            displayColors: false,
            callbacks: { label: (ctx) => ` ₹${(ctx.parsed.y ?? 0).toLocaleString('en-IN')}` }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (value) => `₹${value}` }, beginAtZero: true }
        }
      }
    };
    this.trend = new Chart<'line'>(this.trendCanvas.nativeElement, config);
  }
}
