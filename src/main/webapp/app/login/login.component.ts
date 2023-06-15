import { Component, ViewChild, OnInit, AfterViewInit, ElementRef, NgZone } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('username', { static: false })
  username!: ElementRef;

  authenticationError = false;

  loginForm: any;

  constructor(
    private accountService: AccountService,
    private loginService: LoginService,
    private router: Router,
    private fb: UntypedFormBuilder,
    private zone: NgZone
  ) {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // if already authenticated then navigate to home page
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.zone.run(() => {
          this.router.navigate(['']);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.username.nativeElement.focus();
  }

  login(): void {
    this.loginService
      .login({
        username: this.loginForm.get('username')!.value,
        password: this.loginForm.get('password')!.value,
        rememberMe: this.loginForm.get('rememberMe')!.value,
      })
      .subscribe({
        next: () => {
          this.authenticationError = false;
          if (!this.router.getCurrentNavigation()) {
            // There were no routing during login (eg from navigationToStoredUrl)
            this.zone.run(() => {
              this.router.navigate(['']);
            });
          }
        },
        error: () => (this.authenticationError = true),
      });
  }
}
