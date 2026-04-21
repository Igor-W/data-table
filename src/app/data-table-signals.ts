import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';

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
  selector: 'data-table-signals',
  imports: [CommonModule],
  template: `
    <input type="text" placeholder="Search..." (input)="onSearch($event)" />

    <table>
      <thead>
        <tr>
          @for (column of columns; track column.key) {
            @if (['name', 'age'].includes(column.key)) {
              <th style="cursor: pointer;" (click)="onSort(column.key)">
                {{ column.label }}
                @if (sort().key === column.key) {
                  {{ sort().direction === 'asc' ? '▲' : '▼' }}
                }
              </th>
            } @else {
              <th>{{ column.label }}</th>
            }
          }
        </tr>
      </thead>

      <tbody>
        @if (loading()) {
          <tr style="opacity: 0.5;">
            <td colspan="3" style="text-align: center; padding: 20px;">Loading...</td>
          </tr>
        } @else if (pagedUsers().length === 0) {
          <tr>
            <td colspan="3" style="text-align: center;">No data</td>
          </tr>
        } @else {
          @for (user of pagedUsers(); track user.id) {
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
        <button [disabled]="page() === 1" (click)="prevPage()">Previous</button>
        <button [disabled]="page() * pageSize >= total()" (click)="nextPage()">Next</button>
      </div>

      <div>Page {{ page() }} of {{ Math.ceil(total() / pageSize) || 1 }}</div>

      <p>Total items: {{ total() }}</p>
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
export class DataTableSignals {
  public Math = Math;

  columns: ColumnDefinition[] = [
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

  search = signal('');
  sort = signal<SortState>({ key: null, direction: 'asc' });
  page = signal(1);
  total = computed(() => this.filteredUsers().length);
  loading = signal(true);

  pageSize = 5;

  filteredUsers = computed(() => {
    const term = this.search().toLowerCase();

    let filtered = this.users.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    );

    const sort = this.sort();

    if (sort.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sort.key!];
        const bVal = b[sort.key!];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return sort.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return filtered;
  });

  pagedUsers = signal<User[]>([]);

  constructor() {
    effect(() => {
      const page = this.page();
      const data = this.filteredUsers();

      this.loading.set(true);

      const maxPage = Math.ceil(data.length / this.pageSize) || 1;
      const safePage = Math.min(page, maxPage);

      const start = (safePage - 1) * this.pageSize;
      const end = start + this.pageSize;

      const result = data.slice(start, end);

      setTimeout(() => {
        this.pagedUsers.set(result);
        this.loading.set(false);
      }, 1000);
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.page.set(1);
  }

  onSort(key: UserKey) {
    if (key !== 'name' && key !== 'age') return;

    const current = this.sort();

    const direction = current.key === key && current.direction === 'asc' ? 'desc' : 'asc';

    this.sort.set({ key, direction });
  }

  nextPage() {
    const maxPage = Math.ceil(this.total() / this.pageSize);
    if (this.page() < maxPage) {
      this.page.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
    }
  }
}
