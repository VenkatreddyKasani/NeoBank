import { Component, signal } from '@angular/core';

@Component({ selector: 'app-settings', templateUrl: './settings.component.html', styleUrl: './settings.component.css' })
export class SettingsComponent {
  readonly paymentAlerts = signal(true); readonly marketingAlerts = signal(false); readonly biometricLogin = signal(true);
  toggle(setting: 'paymentAlerts' | 'marketingAlerts' | 'biometricLogin'): void { this[setting].update((value) => !value); }
}
