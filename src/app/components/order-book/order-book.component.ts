import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { map, tap, shareReplay, take } from 'rxjs/operators';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { OrderBookService } from '../../services/order-book.service';
import { Snapshot } from '../../models/order-book.model';

interface ChartPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-order-book',
  standalone: true,
  imports: [NgxChartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent implements OnInit {
  // źródłowe dane
  snapshots$!: Observable<Snapshot[]>;
  private indexSubject = new BehaviorSubject<number>(0);

  // pojedynczy snapshot wybrany przez indexSubject
  snapshot$!: Observable<Snapshot | undefined>;

  // oddzielne serie dla wykresu
  bidsSeries$!: Observable<ChartPoint[]>;
  asksSeries$!: Observable<ChartPoint[]>;

  // flagi widoku
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
    // pobierz i podziel strumienie
    this.snapshots$ = this.service.getSnapshots().pipe(
      tap(() => {}),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.snapshot$ = combineLatest([this.snapshots$, this.indexSubject.asObservable()]).pipe(
      map(([snaps, idx]) => snaps[idx]),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // przygotuj serie wykresu, zabezpieczając undefined
    this.bidsSeries$ = this.snapshot$.pipe(
      map(snap => (snap?.bids ?? []).map(lvl => ({ name: String(lvl.price), value: lvl.size })))
    );
    this.asksSeries$ = this.snapshot$.pipe(
      map(snap => (snap?.asks ?? []).map(lvl => ({ name: String(lvl.price), value: lvl.size })))
    );
  }

  previous(): void {
    const current = this.indexSubject.value;
    this.indexSubject.next(Math.max(current - 1, 0));
  }

  next(): void {
    this.snapshots$.pipe(take(1)).subscribe(snaps => {
      const current = this.indexSubject.value;
      this.indexSubject.next(Math.min(current + 1, snaps.length - 1));
    });
  }

  select(i: number): void {
    this.indexSubject.next(i);
  }

  // funkcja formatująca wartości na osi X
  formatValue = (val: number): string => {
    return (val ?? 0).toLocaleString();
  }
}