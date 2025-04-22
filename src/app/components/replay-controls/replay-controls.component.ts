import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-replay-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './replay-controls.component.html',
  styleUrls: ['./replay-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ReplayControlsComponent {
  @Input() isPlaying = false;
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onPlayPause(): void {
    this.isPlaying ? this.pause.emit() : this.play.emit();
  }

  onReset(): void {
    this.reset.emit();
  }
}
