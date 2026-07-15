import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { CardElevationDirective } from '../../directives/card-elevation.directive';

@Component({
  selector: 'app-stat-card',
  imports: [NgClass, CardElevationDirective],
  template: `
    <article class="stat-card" appCardElevation (click)="cardClicked.emit()">
      <span class="stat-icon" [ngClass]="iconColor">
        <i class="bi" [ngClass]="icon"></i>
      </span>
      <div class="stat-body">
        <span class="stat-label">{{ label }}</span>
        <strong class="stat-value">{{ value }}</strong>
        @if (trend) {
          <small class="stat-trend" [class.positive]="trend.startsWith('+') || trend.startsWith('↑')">
            <i class="bi" [ngClass]="trend.startsWith('+') || trend.startsWith('↑') ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
            {{ trend }}
            @if (trendLabel) { <em>{{ trendLabel }}</em> }
          </small>
        }
      </div>
    </article>
  `,
  styles: `
    .stat-card { align-items: center; background: #fff; border: 1px solid #eef2f7; border-radius: 16px; cursor: pointer; display: flex; gap: 14px; padding: 20px; transition: .2s ease; }
    .stat-icon { align-items: center; border-radius: 11px; display: grid; flex: 0 0 auto; font-size: 18px; height: 42px; place-items: center; width: 42px; }
    .stat-icon.blue { background: #dbeafe; color: #2563eb; }
    .stat-icon.green { background: #dcfce7; color: #16a34a; }
    .stat-icon.orange { background: #ffedd5; color: #ea580c; }
    .stat-icon.violet { background: #ede9fe; color: #7c3aed; }
    .stat-icon.pink { background: #fce7f3; color: #db2777; }
    .stat-icon.cyan { background: #cffafe; color: #0891b2; }
    .stat-body { min-width: 0; }
    .stat-label { color: #64748b; display: block; font-size: 11px; }
    .stat-value { display: block; font-size: 18px; letter-spacing: -.4px; margin: 3px 0 2px; white-space: nowrap; }
    .stat-trend { color: #94a3b8; display: block; font-size: 10px; }
    .stat-trend.positive { color: #16a34a; }
    .stat-trend em { color: #94a3b8; font-style: normal; margin-left: 3px; }
    :host-context(.dark-theme) .stat-card { background: #182235; border-color: #2e3b4e; }
  `
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input() trend = '';
  @Input() trendLabel = '';
  @Input() icon = 'bi-bar-chart';
  @Input() iconColor = 'blue';
  @Output() cardClicked = new EventEmitter<void>();
}
