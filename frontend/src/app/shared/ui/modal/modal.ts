import { ChangeDetectionStrategy, Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core';

let nextModalId = 0;

/**
 * Accessible dialog. Two-way bind `open`: `<app-modal title="Delete?" [(open)]="showDelete">`.
 * Closes on Escape, on the close button and (optionally) on a backdrop click, and moves focus
 * into the dialog when it opens. Project action buttons with the `modal-actions` attribute.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly closeOnBackdrop = input(true);
  readonly closed = output<void>();

  readonly titleId = `app-modal-title-${nextModalId++}`;
  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  constructor() {
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.dialog()?.nativeElement.focus());
      }
    });
  }

  close(): void {
    if (this.open()) {
      this.open.set(false);
      this.closed.emit();
    }
  }

  onEscape(): void {
    this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.close();
    }
  }
}
