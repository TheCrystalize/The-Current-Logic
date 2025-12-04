
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MerkleDagService } from './core/merkle-dag/merkle-dag.service';
import { AutonomyMode, TraceOperation } from './shared/types/core.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  dagService = inject(MerkleDagService);
  
  newOperationPayload = signal<string>('{\n  "action": "CREATE",\n  "entity": "user",\n  "data": {\n    "name": "undine"\n  }\n}');
  payloadError = signal<string | null>(null);

  get autonomyMode(): AutonomyMode {
    return this.dagService.autonomyMode();
  }
  set autonomyMode(value: AutonomyMode) {
    this.dagService.autonomyMode.set(value);
  }

  get currentStress(): number {
    return this.dagService.currentStress();
  }
  set currentStress(value: number) {
    this.dagService.currentStress.set(value);
  }

  addOperation() {
    try {
      const payload = JSON.parse(this.newOperationPayload());
      const operation: Partial<TraceOperation> = { payload };
      this.dagService.addOperation(operation);
      this.payloadError.set(null);
    } catch (e) {
      this.payloadError.set('Invalid JSON format.');
      console.error(e);
    }
  }

  forceFreeze() {
    this.dagService.forceFreeze();
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
