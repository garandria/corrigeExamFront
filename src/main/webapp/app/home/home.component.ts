/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-console */
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AlignImagesService } from 'app/scanexam/services/align-images.service';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  dockItems!: any[];

  faPlus = faPlus;

  private readonly destroy$ = new Subject<void>();

  constructor(private accountService: AccountService, private router: Router, private alignImagesService: AlignImagesService) {}

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => (this.account = account));

    this.dockItems = [
      {
        label: 'Créer cours',
        icon: 'content/images/plus.svg',
        title: 'Créer cours',
        route: 'creercours',
      },
    ];
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
