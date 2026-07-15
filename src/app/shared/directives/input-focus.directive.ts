import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({ selector: '[appInputFocus]', standalone: true })
export class InputFocusDirective {
  @HostBinding('class.is-focused') focused = false;
  @HostListener('focusin') onFocus(): void { this.focused = true; }
  @HostListener('focusout') onBlur(): void { this.focused = false; }
}
