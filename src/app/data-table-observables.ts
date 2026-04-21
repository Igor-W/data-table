import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  delay,
  distinctUntilChanged,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

type CellType = 'text' | 'number';
type UserKey = 'name' | 'email' | 'age';

interface ColumnDefinition {
  label: string;
  key: UserKey;
  cellType: CellType;
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type SortDirection = 'asc' | 'desc';

interface SortState {
  key: UserKey | null;
  direction: SortDirection;
}

@Component({
  selector: 'data-table-observables',
  imports: [CommonModule],
  template: `
    <input type="text" placeholder="Search..." (input)="onSearch($event)" />

    <table>
      <thead>
        <tr>
          @let sort = sort$ | async;
          @for (column of columns; track column.key) {
            @if (['name', 'age'].includes(column.key)) {
              <th style="cursor: pointer;" (click)="onSort(column.key)">
                {{ column.label }}
                @if (sort?.key === column.key) {
                  {{ sort?.direction === 'asc' ? '▲' : '▼' }}
                }
              </th>
            } @else {
              <th>{{ column.label }}</th>
            }
          }
        </tr>
      </thead>

      <tbody>
        @let users = users$ | async;
        @if (loading$ | async) {
          <tr style="opacity: 0.5;">
            <td colspan="3" style="text-align: center; padding: 20px;">Loading...</td>
          </tr>
        } @else if (users?.length === 0) {
          <tr>
            <td colspan="3" style="text-align: center;">No data</td>
          </tr>
        } @else {
          @for (user of users; track user.id) {
            <tr>
              @for (column of columns; track column.key) {
                <td>{{ user[column.key] }}</td>
              }
            </tr>
          }
        }
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; margin-top: 10px;">
      <div>
        <button [disabled]="(page$ | async) === 1" style="margin-right: 5px;" (click)="prevPage()">
          Previous
        </button>

        <button [disabled]="(page$ | async)! * pageSize >= (total$ | async)!" (click)="nextPage()">
          Next
        </button>
      </div>
      <div>Page {{ page$ | async }} of {{ Math.ceil((total$ | async)! / pageSize) || 1 }}</div>
      <p>Total items: {{ total$ | async }}</p>
    </div>
  `,
  styles: `
    input {
      margin-bottom: 10px;
      padding: 5px;
      width: 200px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
      text-align: left;
    }
    button {
      cursor: pointer;
    }
  `,
})
export class DataTableObservables {
  public Math = Math;

  public columns: ColumnDefinition[] = [
    { label: 'Name', key: 'name', cellType: 'text' },
    { label: 'Email', key: 'email', cellType: 'text' },
    { label: 'Age', key: 'age', cellType: 'number' },
  ];

  users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34 },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 22 },
    { id: 4, name: 'David Wilson', email: 'david@example.com', age: 30 },
    { id: 5, name: 'Eva Adams', email: 'eva@example.com', age: 27 },
    { id: 6, name: 'Frank Miller', email: 'frank@example.com', age: 35 },
    { id: 7, name: 'Grace Lee', email: 'grace@example.com', age: 29 },
    { id: 8, name: 'Henry Ford', email: 'henry@example.com', age: 33 },
  ];

  private search$ = new BehaviorSubject<string>('');
  private debouncedSearch$ = this.search$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    startWith(''),
  );
  public sort$ = new BehaviorSubject<SortState>({
    key: null,
    direction: 'asc',
  });
  public page$ = new BehaviorSubject<number>(1);
  public total$ = new BehaviorSubject<number>(0);
  public loading$ = new BehaviorSubject<boolean>(true);
  public readonly pageSize = 5;

  users$ = combineLatest([this.debouncedSearch$, this.sort$, this.page$]).pipe(
    switchMap(([term, sort, page]) => {
      const lower = term.toLowerCase();

      let filtered = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(lower) || user.email.toLowerCase().includes(lower),
      );

      if (sort.key) {
        filtered = [...filtered].sort((a, b) => {
          const valueA = a[sort.key!];
          const valueB = b[sort.key!];

          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sort.direction === 'asc' ? valueA - valueB : valueB - valueA;
          }

          return sort.direction === 'asc'
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        });
      }

      const total = filtered.length;
      this.total$.next(total);

      const maxPage = Math.ceil(total / this.pageSize) || 1;
      const safePage = Math.min(page, maxPage);

      const start = (safePage - 1) * this.pageSize;
      const end = start + this.pageSize;

      const result = filtered.slice(start, end);

      this.loading$.next(true);

      return of(result).pipe(
        delay(1000),
        tap(() => {
          this.loading$.next(false);
        }),
      );
    }),
  );

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search$.next(value);
    this.page$.next(1);
  }

  onSort(key: UserKey) {
    if (key !== 'name' && key !== 'age') return;

    const current = this.sort$.value;

    let direction: SortDirection = 'asc';

    if (current.key === key) {
      direction = current.direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }

    this.sort$.next({ key, direction });
  }

  nextPage() {
    const current = this.page$.value;
    const total = this.total$.value;
    const maxPage = Math.ceil(total / this.pageSize);

    if (current < maxPage) {
      this.page$.next(current + 1);
    }
  }

  prevPage() {
    const current = this.page$.value;

    if (current > 1) {
      this.page$.next(current - 1);
    }
  }
}
