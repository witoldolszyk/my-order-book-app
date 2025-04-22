import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import rawData from '../../assets/sample.json';

import { RawSnapshot, Snapshot, Level } from '../models/order-book.model';

@Injectable({
  providedIn: 'root'
})
export class OrderBookService {

  constructor() {}

  getSnapshots(): Observable<Snapshot[]> {

    return of(rawData as RawSnapshot[]).pipe(
      map(rawArray => rawArray.map(r => this.transformRaw(r)))
    );
  }
  private transformRaw(r: RawSnapshot): Snapshot {
    const bids: Level[] = Array.from({ length: 10 }, (_, i) => {
      const price = parseFloat((r as any)[`Bid${i+1}`]) || 0;
      const size  = parseFloat((r as any)[`Bid${i+1}Size`]) || 0;
      return { price, size };
    });
    const asks: Level[] = Array.from({ length: 10 }, (_, i) => {
      const price = parseFloat((r as any)[`Ask${i+1}`]) || 0;
      const size  = parseFloat((r as any)[`Ask${i+1}Size`]) || 0;
      return { price, size };
    });
  
    return {
      timestamp: new Date(`1970-01-01T${r.Time}Z`).getTime(),
      timeText:  r.Time,
      bids,
      asks
    };
  }
  
}
