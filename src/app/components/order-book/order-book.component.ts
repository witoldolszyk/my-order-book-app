// src/app/components/order-book/order-book.component.ts
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { OrderBookService } from '../../services/order-book.service';
import { Snapshot } from '../../models/order-book.model';
import { ReplayControlsComponent } from '../replay-controls/replay-controls.component';

@Component({
  selector: 'app-order-book',
  standalone: true,
  imports: [NgxChartsModule, ReplayControlsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent implements OnInit, OnDestroy {
  private indexSubject = new BehaviorSubject<number>(0);
  index$ = this.indexSubject.asObservable();

  snapshot$!: Observable<Snapshot | null>;
  bidsSeries$!: Observable<{ name: string; value: number }[]>;
  asksSeries$!: Observable<{ name: string; value: number }[]>;

  isPlaying = false;
  private replayTimeouts: any[] = [];
  private totalReplayDuration = 200000; 
  private subs = new Subscription();

  view: [number, number] = [600, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Volume';
  showYAxisLabel = true;
  yAxisLabel = 'Price';

  constructor(private service: OrderBookService) {}

  ngOnInit(): void {
    const snaps$ = this.service.getSnapshots();

    this.snapshot$ = combineLatest([snaps$, this.index$]).pipe(
      map(([snaps, idx]) => snaps[idx] || null)
    );

    this.bidsSeries$ = this.snapshot$.pipe(
      filter((s): s is Snapshot => s !== null),
      map(snap =>
        snap.bids.map(lvl => ({
          name: lvl.price?.toString() ?? '',
          value: +lvl.size || 0
        }))
      )
    );

    this.asksSeries$ = this.snapshot$.pipe(
      filter((s): s is Snapshot => s !== null),
      map(snap =>
        snap.asks.map(lvl => ({
          name: lvl.price?.toString() ?? '',
          value: +lvl.size || 0
        }))
      )
    );
  }

  ngOnDestroy(): void {
    this.clearReplay();
    this.subs.unsubscribe();
  }

  previous(): void {
    const i = Math.max(this.indexSubject.value - 1, 0);
    this.indexSubject.next(i);
  }

  next(): void {
    this.service.getSnapshots().pipe(take(1)).subscribe(snaps => {
      const i = Math.min(this.indexSubject.value + 1, snaps.length - 1);
      this.indexSubject.next(i);
    });
  }

  select(i: number): void {
    this.indexSubject.next(i);
  }

  formatValue(val: number): string {
    return val.toLocaleString();
  }

  startReplay(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleReplayFromCurrent();
  }

  pauseReplay(): void {
    this.isPlaying = false;
    this.clearReplay();
  }

  resetReplay(): void {
    this.pauseReplay();
    this.indexSubject.next(0);
  }

  private scheduleReplayFromCurrent(): void {
    this.clearReplay();
    this.service.getSnapshots().pipe(take(1)).subscribe(snaps => {
      if (snaps.length < 2) {
        this.isPlaying = false;
        return;
      }
      const timestamps = snaps.map(s => s.timestamp);
      const minT = timestamps[0];
      const maxT = timestamps[timestamps.length - 1];
      const span = maxT - minT;

      const currentIndex = this.indexSubject.value;
      const elapsed = timestamps[currentIndex] - minT;
      const remainingSpan = span - elapsed;
      const remainingDuration = this.totalReplayDuration * (remainingSpan / span);

      snaps.forEach((_, idx) => {
        if (idx <= currentIndex) return;
        const delta = timestamps[idx] - timestamps[currentIndex];
        const when = (delta / remainingSpan) * remainingDuration;
        const t = setTimeout(() => {
          this.indexSubject.next(idx);
          if (idx === snaps.length - 1) {
            this.isPlaying = false;
          }
        }, when);
        this.replayTimeouts.push(t);
      });
    });
  }

  private clearReplay(): void {
    this.replayTimeouts.forEach(t => clearTimeout(t));
    this.replayTimeouts = [];
  }
}
