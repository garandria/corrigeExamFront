/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/member-ordering */
import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { NgxExtendedPdfViewerService, ScrollModeType } from 'ngx-extended-pdf-viewer';
import { EventHandlerService } from '../event-handler.service';
import { DrawingTools, DrawingColours } from '../models';
import { PageHandler } from './PageHandler';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import PerfectScrollbar from 'perfect-scrollbar';
import { IExam } from 'app/entities/exam/exam.model';
import { ZoneService } from '../../../../entities/zone/service/zone.service';
import { IZone } from 'app/entities/zone/zone.model';
import { FabricShapeService } from '../shape.service';
import { QuestionService } from '../../../../entities/question/service/question.service';
import { TranslateService } from '@ngx-translate/core';
import { IQuestion } from 'app/entities/question/question.model';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

export type CustomZone = IZone & { type: DrawingTools };

@Component({
  selector: 'jhi-fabric-canvas',
  templateUrl: './fabric-canvas.component.html',
  styleUrls: ['./fabric-canvas.component.scss'],
  providers: [
    NgxExtendedPdfViewerService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
})
export class FabricCanvasComponent implements AfterViewInit, OnInit {
  @Input()
  content: any;
  @Input()
  exam!: IExam;

  @Input()
  numeroEvent!: Subject<string>;

  zones: { [page: number]: CustomZone[] } = {};

  public questions: Map<number, IQuestion> = new Map();

  public examId = -1;

  title = 'gradeScopeFree';

  public scrollbar: PerfectScrollbar | undefined = undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private eventHandler: EventHandlerService,
    @Inject(PERFECT_SCROLLBAR_CONFIG)
    public config: PerfectScrollbarConfigInterface,
    public zoneService: ZoneService,
    public fabricShapeService: FabricShapeService,
    public questionService: QuestionService,
    public translateService: TranslateService
  ) {}

  public scrollMode: ScrollModeType = ScrollModeType.vertical;

  public ngOnInit(): void {
    this.eventHandler.exam = this.exam;
    this.eventHandler.zonesRendering = this.zones;

    this.eventHandler.registerOnQuestionAddRemoveCallBack((qid, add) => {
      if (add) {
        this.getQuestion(qid);
      } else {
        this.questions.delete(qid);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.eventHandler.nextQuestionNumeros = Array.from(this.questions).map(([key, value]) => value.numero!);
      }
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.examId = parseInt(params.get('examid') ?? '-1', 10);

      // Reacting on a change in a question
      this.numeroEvent.subscribe(numero => {
        this.getQuestion(parseInt(numero, 10));
      });
    });

    if (this.exam.namezoneId !== undefined) {
      this.zoneService.find(this.exam.namezoneId!).subscribe(z => {
        const ezone = z.body as CustomZone;
        ezone.type = DrawingTools.NOMBOX;
        if (!this.zones[z.body!.pageNumber!]) {
          this.zones[ezone.pageNumber!] = [];
        }
        this.zones[ezone.pageNumber!].push(ezone);
      });
    }
    if (this.exam.firstnamezoneId !== undefined) {
      this.zoneService.find(this.exam.firstnamezoneId!).subscribe(z => {
        const ezone = z.body as CustomZone;
        ezone.type = DrawingTools.PRENOMBOX;
        if (!this.zones[z.body!.pageNumber!]) {
          this.zones[ezone.pageNumber!] = [];
        }
        this.zones[ezone.pageNumber!].push(ezone);
      });
    }
    if (this.exam.idzoneId !== undefined) {
      this.zoneService.find(this.exam.idzoneId!).subscribe(z => {
        const ezone = z.body as CustomZone;
        ezone.type = DrawingTools.INEBOX;
        if (!this.zones[z.body!.pageNumber!]) {
          this.zones[ezone.pageNumber!] = [];
        }
        this.zones[ezone.pageNumber!].push(ezone);
      });
    }
    this.questionService.query({ examId: this.exam.id! }).subscribe(qs => {
      qs.body?.forEach(q => {
        if (q.id !== undefined) {
          this.questions.set(q.id, q);
        }
        this.zoneService.find(q.zoneId!).subscribe(z => {
          const ezone = z.body as CustomZone;
          ezone.type = DrawingTools.QUESTIONBOX;
          if (!this.zones[z.body!.pageNumber!]) {
            this.zones[ezone.pageNumber!] = [];
          }
          this.zones[ezone.pageNumber!].push(ezone);
        });
      });
    });
  }

  /**
   * Getting the questions corresponding to the given number (REST query) and adding them to `questions`
   */
  private getQuestion(numero: number): void {
    this.questionService.query({ examId: this.examId, numero }).subscribe(qs => {
      qs.body?.forEach(q => {
        if (q.id !== undefined) {
          this.questions.set(q.id, q);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.eventHandler.nextQuestionNumeros = Array.from(this.questions).map(([key, value]) => value.numero!);
    });
  }

  public ngAfterViewInit(): void {
    const container = document.querySelector('#viewerContainer');
    this.scrollbar = new PerfectScrollbar(container!, this.config);

    const sidebar = document.querySelector('#thumbnailView') as HTMLElement;
    if (sidebar) {
      this.scrollbar = new PerfectScrollbar(sidebar, this.config);
    }
  }

  pageRendered(evt: any) {
    const page = evt.pageNumber;
    if (!this.eventHandler.pages[page]) {
      const pageHandler = new PageHandler(evt.source, page, this.eventHandler);
      this.eventHandler.pages[page] = pageHandler;
    }

    const canvas = this.eventHandler.pages[page].updateCanvas(evt.source);
    if (this.zones[page] !== undefined) {
      this.zones[page].forEach(z => {
        switch (z.type) {
          case DrawingTools.NOMBOX: {
            this.translateService.get('scanexam.nomuc1').subscribe(e => {
              const r = this.fabricShapeService.createBoxFromScratch(
                canvas,
                {
                  x: (z.xInit! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                  y: (z.yInit! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                },
                (z.width! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                (z.height! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                e,
                DrawingColours.RED
              );
              this.eventHandler.modelViewpping.set(r.id, z.id!);
            });
            break;
          }
          case DrawingTools.PRENOMBOX: {
            this.translateService.get('scanexam.prenomuc1').subscribe(e => {
              const r = this.fabricShapeService.createBoxFromScratch(
                canvas,
                {
                  x: (z.xInit! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                  y: (z.yInit! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                },
                (z.width! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                (z.height! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                e,
                DrawingColours.RED
              );
              this.eventHandler.modelViewpping.set(r.id, z.id!);
            });
            break;
          }
          case DrawingTools.INEBOX: {
            this.translateService.get('scanexam.ineuc1').subscribe(e => {
              const r = this.fabricShapeService.createBoxFromScratch(
                canvas,
                {
                  x: (z.xInit! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                  y: (z.yInit! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                },
                (z.width! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                (z.height! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                e,
                DrawingColours.RED
              );
              this.eventHandler.modelViewpping.set(r.id, z.id!);
            });
            break;
          }
          case DrawingTools.QUESTIONBOX: {
            this.translateService.get('scanexam.questionuc1').subscribe(e1 => {
              this.questionService.query({ zoneId: z.id }).subscribe(e => {
                if (e.body !== undefined && e.body!.length > 0) {
                  /* if (this.eventHandler.nextQuestionNumero <= e.body![0].numero!) {
                    this.eventHandler.nextQuestionNumero = e.body![0].numero! + 1;
                  }*/
                  this.eventHandler.nextQuestionNumeros.push(e.body![0].numero!);

                  const r = this.fabricShapeService.createBoxFromScratch(
                    canvas,
                    {
                      x: (z.xInit! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                      y: (z.yInit! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                    },
                    (z.width! * this.eventHandler.pages[page].pageViewer.canvas.clientWidth) / 100000,
                    (z.height! * this.eventHandler.pages[page].pageViewer.canvas.clientHeight) / 100000,
                    e1 + e.body![0].numero,
                    DrawingColours.GREEN
                  );
                  this.eventHandler.modelViewpping.set(r.id, z.id!);
                }
              });
            });

            break;
          }
        }
      });
    }
  }
}
