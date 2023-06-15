import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[click.single],[click.double]',
})
export class ClickDoubleDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 300;
  @Output('click.double') doubleClick = new EventEmitter();
  @Output('click.single') singleClick = new EventEmitter();

  private clicksSubject = new Subject<MouseEvent>();
  private subscription: Subscription | undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  ngOnInit(): void {
    this.subscription = this.clicksSubject.pipe(debounceTime(this.debounceTime)).subscribe(event => {
      if (event.type === 'click') {
        this.singleClick.emit(event);
      } else {
        this.doubleClick.emit(event);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription!.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }
  @HostListener('dblclick', ['$event'])
  doubleClickEvent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }
}
