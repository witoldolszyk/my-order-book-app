import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'order-book', pathMatch: 'full' },
  {
    path: 'order-book',
    loadComponent: () =>
      import('./components/order-book/order-book.component')
        .then(m => m.OrderBookComponent)
  },
  { path: '**', redirectTo: 'order-book' }
];
