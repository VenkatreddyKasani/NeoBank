import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BankingService } from '../../../shared/services/banking.service';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-admin-reports',
  imports: [DatePipe, CardElevationDirective],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css'
})
export class AdminReportsComponent {
  readonly bank = inject(BankingService);

  readonly reports = [
    { title: 'RBI Regulatory AML Audit Log', desc: 'Daily anti-money laundering and large transaction compliance report.', date: '2026-07-15', status: 'Ready', format: 'PDF & CSV' },
    { title: 'Monthly Liquidity & Reserves Extract', desc: 'Summary of customer vault deposits and fractional cash reserve ratio.', date: '2026-07-01', status: 'Ready', format: 'Excel (.xlsx)' },
    { title: 'Quarterly KYC Compliance Scorecard', desc: 'Audit of verified biometric identities and pending document verifications.', date: '2026-06-30', status: 'Ready', format: 'PDF (.pdf)' },
    { title: 'System Performance & API Telemetry', desc: 'Response times across Spring Boot endpoints and MySQL query pools.', date: '2026-07-14', status: 'Ready', format: 'JSON / CSV' }
  ];

  exportReport(reportTitle: string): void {
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert(`Report "${reportTitle}" has been generated and downloaded.`, 'success');
    } else {
      alert(`Report downloaded: ${reportTitle}`);
    }
  }
}
