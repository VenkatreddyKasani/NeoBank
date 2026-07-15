import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({ selector: '[appCardElevation]', standalone: true })
export class CardElevationDirective {
  @HostBinding('class.is-lifted') lifted = false;
  @HostListener('mouseenter') onEnter(): void { this.lifted = true; }
  @HostListener('mouseleave') onLeave(): void { this.lifted = false; }
}
