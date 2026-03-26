import {
  Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type QuillType from 'quill';

@Component({
  selector: 'app-quill-editor',
  template: '<div #editorEl></div>',
  styleUrl: './quill-editor.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditor),
      multi: true
    }
  ]
})
export class QuillEditor implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild('editorEl', { static: true }) editorEl!: ElementRef<HTMLDivElement>;
  @Input() modules: Record<string, unknown> = { toolbar: true };
  @Input() placeholder = '';

  private quill!: QuillType;
  private pendingValue: string | null = null;
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const { default: Quill } = await import('quill');
    this.quill = new Quill(this.editorEl.nativeElement, {
      theme: 'snow',
      modules: this.modules,
      placeholder: this.placeholder
    });

    if (this.pendingValue !== null) {
      this.setHtml(this.pendingValue);
      this.pendingValue = null;
    }

    this.quill.on('text-change', () => {
      const el = this.editorEl.nativeElement.querySelector('.ql-editor');
      const html = el?.innerHTML ?? '';
      this.onChange(html === '<p><br></p>' ? '' : html);
      this.onTouched();
    });
  }

  ngOnDestroy() {}

  writeValue(value: string): void {
    if (this.quill) {
      this.setHtml(value || '');
    } else {
      this.pendingValue = value || '';
    }
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.quill?.enable(!isDisabled);
  }

  private setHtml(html: string) {
    const delta = (this.quill as any).clipboard.convert({ html } as any);
    this.quill.setContents(delta, 'silent');
  }
}
