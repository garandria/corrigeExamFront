/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-console */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ExamService } from '../../entities/exam/service/exam.service';
import { ZoneService } from '../../entities/zone/service/zone.service';
import { ScanService } from '../../entities/scan/service/scan.service';
import { CourseService } from 'app/entities/course/service/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { IExam } from 'app/entities/exam/exam.model';
import { ICourse } from 'app/entities/course/course.model';
import { IScan } from '../../entities/scan/scan.model';
import { IZone } from 'app/entities/zone/zone.model';
import { ScrollModeType, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { AlignImagesService } from '../services/align-images.service';
import { TemplateService } from '../../entities/template/service/template.service';
import { ITemplate } from 'app/entities/template/template.model';

export interface IPage {
  image?: ImageData;
  page?: number;
  width?: number;
  height?: number;
}

@Component({
  selector: 'jhi-associer-copies-etudiants',
  templateUrl: './associer-copies-etudiants.component.html',
  styleUrls: ['./associer-copies-etudiants.component.scss'],
  providers: [ConfirmationService],
})
export class AssocierCopiesEtudiantsComponent implements OnInit {
  examId = '';
  exam!: IExam;
  course!: ICourse;
  scan!: IScan;
  template!: ITemplate;
  pdfcontent!: string;
  zonenom!: IZone;
  zoneprenom!: IZone;
  zoneine!: IZone;
  nbreFeuilleParCopie = 6;
  nomDataURL: any;
  prenomDataURL: any;
  ineDataURL: any;
  public scrollMode: ScrollModeType = ScrollModeType.vertical;
  widthnom = 0;
  heightnom = 0;
  widthprenom = 0;
  heightprenom = 0;
  widthine = 0;
  heightine = 0;
  cvState!: string;
  private editedImage: HTMLCanvasElement | undefined;
  showNomImage = false;
  @ViewChild('nomImage')
  nomImage: ElementRef | undefined;
  showPrenomImage = false;
  @ViewChild('prenomImage')
  prenomImage: ElementRef | undefined;
  showINEImage = false;
  @ViewChild('ineImage')
  ineImage: ElementRef | undefined;
  @ViewChild('keypoints1')
  keypoints1: ElementRef | undefined;
  @ViewChild('keypoints2')
  keypoints2: ElementRef | undefined;
  @ViewChild('imageCompareMatches')
  imageCompareMatches: ElementRef | undefined;
  @ViewChild('imageAligned')
  imageAligned: ElementRef | undefined;
  templatePages: Map<number, IPage> = new Map();

  @ViewChild('outputImage')
  public outputCanvas: ElementRef | undefined;
  phase1 = false;
  constructor(
    private pdfService: NgxExtendedPdfViewerService,
    public examService: ExamService,
    public zoneService: ZoneService,
    public scanService: ScanService,
    public courseService: CourseService,
    public templateService: TemplateService,
    protected activatedRoute: ActivatedRoute,
    public confirmationService: ConfirmationService,
    public router: Router,
    private alignImagesService: AlignImagesService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.get('examid') !== null) {
        this.examId = params.get('examid')!;
        this.examService.find(+this.examId).subscribe(data => {
          this.exam = data.body!;
          this.courseService.find(this.exam.courseId!).subscribe(e => (this.course = e.body!));
          if (this.exam.namezoneId) {
            this.zoneService.find(this.exam.namezoneId).subscribe(e => (this.zonenom = e.body!));
          }
          if (this.exam.firstnamezoneId) {
            this.zoneService.find(this.exam.firstnamezoneId).subscribe(e => (this.zoneprenom = e.body!));
          }
          if (this.exam.idzoneId) {
            this.zoneService.find(this.exam.idzoneId).subscribe(e => (this.zoneine = e.body!));
          }
          if (this.exam.templateId) {
            this.templateService.find(this.exam.templateId).subscribe(e => {
              this.template = e.body!;
              this.pdfcontent = this.template.content!;
            });
          }
          /*          if (this.exam.scanfileId) {
            this.scanService.find(this.exam.scanfileId).subscribe(e => (this.scan = e.body!));
          }*/
        });
      }
    });
  }

  public pdfloaded(): void {
    if (!this.phase1) {
      const scale = { scale: 2 };
      console.log(this.pdfService.numberOfPages());
      for (let i = 1; i <= this.pdfService.numberOfPages(); i++) {
        this.pdfService.getPageAsImage(i, scale).then(dataURL => {
          this.loadImage(dataURL, i, (_image: ImageData, _page: number, _width: number, _height: number) => {
            this.templatePages.set(_page, {
              image: _image,
              page: _page,
              width: _width,
              height: _height,
            });
            if (_page === this.pdfService.numberOfPages()) {
              this.phase1 = true;
              if (this.exam.scanfileId) {
                this.scanService.find(this.exam.scanfileId).subscribe(e => {
                  this.scan = e.body!;
                  this.pdfcontent = this.scan.content!;
                });
              }
            }
          });
        });
      }
      // Phase 2;
    } else {
      if (this.pdfService.numberOfPages() !== 0) {
        this.exportAsImage();
      }
    }
  }

  public exportAsImage(): void {
    const scale = { scale: 2 };
    this.pdfService.getPageAsImage(this.zonenom.page!, scale).then(dataURL => {
      this.aligneImages(dataURL, this.zonenom.page!, (p: IPage) => {
        this.nomImage!.nativeElement.width = (this.zonenom.width! * p.width!) / 100000;
        this.nomImage!.nativeElement.height = (this.zonenom.height! * p.height!) / 100000;

        this.alignImagesService
          .imageCrop({
            image: p.image,
            x: (this.zonenom.xInit! * p.width!) / 100000,
            y: (this.zonenom.yInit! * p.height!) / 100000,
            width: (this.zonenom.width! * p.width!) / 100000,
            height: (this.zonenom.height! * p.height!) / 100000,
          })
          .subscribe(res => {
            const ctx1 = this.nomImage?.nativeElement.getContext('2d');
            ctx1.putImageData(res, 0, 0);
            this.showNomImage = true;
          });
      });
    });
    this.pdfService.getPageAsImage(this.zoneprenom.page!, scale).then(dataURL => {
      this.aligneImages(dataURL, this.zoneprenom.page!, (p: IPage) => {
        this.prenomImage!.nativeElement.width = (this.zoneprenom.width! * p.width!) / 100000;
        this.prenomImage!.nativeElement.height = (this.zoneprenom.height! * p.height!) / 100000;

        this.alignImagesService
          .imageCrop({
            image: p.image,
            x: (this.zoneprenom.xInit! * p.width!) / 100000,
            y: (this.zoneprenom.yInit! * p.height!) / 100000,
            width: (this.zoneprenom.width! * p.width!) / 100000,
            height: (this.zoneprenom.height! * p.height!) / 100000,
          })
          .subscribe(res => {
            const ctx1 = this.prenomImage?.nativeElement.getContext('2d');
            ctx1.putImageData(res, 0, 0);
            this.showPrenomImage = true;
          });
      });
    });
    if (this.zoneine !== undefined) {
      this.pdfService.getPageAsImage(this.zoneine.page!, scale).then(dataURL => {
        this.getImageDimensions(dataURL, false, (x: number, y: number) => {
          this.widthine = x;
          this.heightine = y;
          this.ineDataURL = dataURL;
        });
      });
    }
  }

  loadImage(file: any, page: number, cb: (image: ImageData, page: number, w: number, h: number) => void): void {
    const i = new Image();
    i.onload = () => {
      this.editedImage = <HTMLCanvasElement>document.createElement('canvas');
      this.editedImage.width = i.width;
      this.editedImage.height = i.height;
      const ctx = this.editedImage.getContext('2d');
      ctx!.drawImage(i, 0, 0);
      const inputimage = ctx!.getImageData(0, 0, i.width, i.height);
      cb(inputimage, page, i.width, i.height);
    };
    i.src = file;
  }

  aligneImages(file: any, pagen: number, cb: (page: IPage) => void): void {
    const i = new Image();
    i.onload = () => {
      this.editedImage = <HTMLCanvasElement>document.createElement('canvas');
      this.editedImage.width = i.width;
      this.editedImage.height = i.height;
      const ctx = this.editedImage.getContext('2d');
      ctx!.drawImage(i, 0, 0);
      const inputimage1 = ctx!.getImageData(0, 0, i.width, i.height);
      this.alignImagesService.imageAlignement({ imageA: this.templatePages.get(pagen)?.image, imageB: inputimage1 }).subscribe(e => {
        const ctx1 = this.imageCompareMatches?.nativeElement.getContext('2d');
        this.imageCompareMatches!.nativeElement.width = e.imageCompareMatchesWidth;
        this.imageCompareMatches!.nativeElement.height = e.imageCompareMatchesHeight;
        ctx1.putImageData(e.imageCompareMatches, 0, 0);

        const ctx2 = this.keypoints1?.nativeElement.getContext('2d');
        this.keypoints1!.nativeElement.width = e.keypoints1Width;
        this.keypoints1!.nativeElement.height = e.keypoints1Height;
        ctx2.putImageData(e.keypoints1, 0, 0);
        const ctx3 = this.keypoints2?.nativeElement.getContext('2d');
        this.keypoints2!.nativeElement.width = e.keypoints2Width;
        this.keypoints2!.nativeElement.height = e.keypoints2Height;
        ctx3.putImageData(e.keypoints2, 0, 0);
        const ctx4 = this.imageAligned?.nativeElement.getContext('2d');
        this.imageAligned!.nativeElement.width = e.imageAlignedWidth;
        this.imageAligned!.nativeElement.height = e.imageAlignedHeight;
        ctx4.putImageData(e.imageAligned, 0, 0);
        cb({
          image: e.imageAligned,
          page: pagen,
          width: i.width,
          height: i.height,
        });
      });
    };
    i.src = file;
  }

  getImageDimensions(file: any, create: boolean, cb: (w: number, h: number) => void): void {
    const i = new Image();
    i.onload = () => {
      //      this.canvasEl = this.canvas!.nativeElement;
      //      this.ctx = this.canvas?.nativeElement.getContext('2d');
      //      this.canvasEl.width = i.width;
      //      this.canvasEl.height = i.height;
      //      this.ctx!.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      //      this.ctx!.drawImage(i, 0, 0, i.width, i.height);
      if (create) {
        this.editedImage = <HTMLCanvasElement>document.createElement('canvas');
        this.editedImage.width = i.width;
        this.editedImage.height = i.height;
        const ctx = this.editedImage.getContext('2d');
        ctx!.drawImage(i, 0, 0);
        const inputimage1 = ctx!.getImageData(0, 0, i.width, i.height);
        // this.outputCanvas!.nativeElement.width =  i.width;
        // this.outputCanvas!.nativeElement.height = i.height;

        /*        this.alignImagesService.imageCrop({image:inputimage, x: 100,y:100, width:200, height:200}).subscribe(e => {
          const ctx1 = this.outputCanvas?.nativeElement.getContext('2d');
          ctx1.putImageData(e, 0, 0);
        });*/
        this.alignImagesService.imageAlignement({ imageA: inputimage1, imageB: inputimage1 }).subscribe(e => {
          const ctx1 = this.imageCompareMatches?.nativeElement.getContext('2d');
          console.log(e.imageCompareMatchesWidth);
          console.log(e.imageCompareMatchesHeight);

          this.imageCompareMatches!.nativeElement.width = e.imageCompareMatchesWidth;
          this.imageCompareMatches!.nativeElement.height = e.imageCompareMatchesHeight;
          ctx1.putImageData(e.imageCompareMatches, 0, 0);

          const ctx2 = this.keypoints1?.nativeElement.getContext('2d');
          this.keypoints1!.nativeElement.width = e.keypoints1Width;
          this.keypoints1!.nativeElement.height = e.keypoints1Height;
          ctx2.putImageData(e.keypoints1, 0, 0);
          const ctx3 = this.keypoints2?.nativeElement.getContext('2d');
          this.keypoints2!.nativeElement.width = e.keypoints2Width;
          this.keypoints2!.nativeElement.height = e.keypoints2Height;
          ctx3.putImageData(e.keypoints2, 0, 0);
          const ctx4 = this.imageAligned?.nativeElement.getContext('2d');
          this.imageAligned!.nativeElement.width = e.imageAlignedWidth;
          this.imageAligned!.nativeElement.height = e.imageAlignedHeight;
          ctx4.putImageData(e.imageAligned, 0, 0);
        });
      }
      cb(i.width, i.height);
    };
    i.src = file;
  }
}
