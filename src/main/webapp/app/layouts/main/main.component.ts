import { Component, OnInit, RendererFactory2, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { AccountService } from 'app/core/auth/account.service';
import { FocusViewService } from '../profiles/focusview.service';

@Component({
  selector: 'jhi-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  helptitle: string | undefined;
  focusview = false;
  private renderer: Renderer2;
  constructor(
    private accountService: AccountService,
    private titleService: Title,
    private router: Router,
    private translateService: TranslateService,
    rootRenderer: RendererFactory2,
    private focusViewService: FocusViewService,
  ) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);

    // Could not use default translate services due to a bug in https://github.com/omridevk/ng-keyboard-shortcuts
    if ('fr' === this.translateService.currentLang) {
      this.helptitle = 'Raccourcis clavier';
    } else {
      this.helptitle = 'Keyboard shortcuts';
    }
  }

  ngOnInit(): void {
    // try to log in automatically
    this.accountService.identity().subscribe();
    this.focusViewService.registerFocusView().subscribe((b: boolean) => {
      this.focusview = b;
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });

    /*    this.translateService.get('scanexam.help').subscribe(e=> {
      this.helptitle = e
    });*/

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.updateTitle();
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }

  private getPageTitle(routeSnapshot: ActivatedRouteSnapshot): string {
    const title: string = routeSnapshot.data['pageTitle'] ?? '';
    if (routeSnapshot.firstChild) {
      return this.getPageTitle(routeSnapshot.firstChild) || title;
    }
    return title;
  }

  private updateTitle(): void {
    let pageTitle = this.getPageTitle(this.router.routerState.snapshot.root);
    if (!pageTitle) {
      pageTitle = 'global.title';
    }
    this.translateService.get(pageTitle).subscribe(title => this.titleService.setTitle(title));
  }
}
