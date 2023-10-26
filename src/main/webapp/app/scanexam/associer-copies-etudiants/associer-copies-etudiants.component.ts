/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-console */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ExamService } from '../../entities/exam/service/exam.service';
import { ZoneService } from '../../entities/zone/service/zone.service';
import { CourseService } from 'app/entities/course/service/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { IExam } from 'app/entities/exam/exam.model';
import { ICourse } from 'app/entities/course/course.model';
import { IScan } from '../../entities/scan/scan.model';
import { IZone } from 'app/entities/zone/zone.model';
import { AlignImagesService } from '../services/align-images.service';
import { ITemplate } from 'app/entities/template/template.model';
import { StudentService } from 'app/entities/student/service/student.service';
import { IStudent } from '../../entities/student/student.model';
import { ExamSheetService } from 'app/entities/exam-sheet/service/exam-sheet.service';
import { IExamSheet } from '../../entities/exam-sheet/exam-sheet.model';
import { v4 as uuid } from 'uuid';
import { faHouseSignal } from '@fortawesome/free-solid-svg-icons';
import { Listbox } from 'primeng/listbox';
import { PreferenceService } from '../preference-page/preference.service';
import { CacheServiceImpl } from '../db/CacheServiceImpl';
import { ShortcutInput } from 'ng-keyboard-shortcuts';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DoPredictionsInputSamePage } from 'app/opencv.worker';

export interface IPage {
  image?: ImageData;
  page?: number;
  width?: number;
  height?: number;
}

export interface ICluster {
  images: IImageCluster[];
  nbrCluster: number;
}

export interface IImageCluster {
  image: ArrayBuffer;
  imageIndex: number;
  studentIndex: number;
  width?: number;
  height?: number;
}

export interface ImageZone {
  t?: ImageData;
  i: ImageData;
  w: number;
  h: number;
}

@Component({
  selector: 'jhi-associer-copies-etudiants',
  templateUrl: './associer-copies-etudiants.component.html',
  styleUrls: ['./associer-copies-etudiants.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class AssocierCopiesEtudiantsComponent implements OnInit, AfterViewInit {
  @ViewChild('list')
  list!: Listbox;
  faHouseSignal = faHouseSignal;
  blocked = false;
  examId = '';
  exam!: IExam;
  course!: ICourse;
  scan!: IScan;
  template!: ITemplate;
  pdfcontent!: string;
  zonenom!: IZone;
  setZoneNom: (z: IZone) => void = (z: IZone) => (this.zonenom = z);
  zoneprenom!: IZone;
  setZonePrenom: (z: IZone) => void = (z: IZone) => (this.zoneprenom = z);
  zoneine!: IZone;
  setZoneINE: (z: IZone) => void = (z: IZone) => (this.zoneine = z);
  nomDataURL: any;
  prenomDataURL: any;
  ineDataURL: any;
  widthnom = 0;
  heightnom = 0;
  widthprenom = 0;
  heightprenom = 0;
  widthine = 0;
  heightine = 0;
  cvState!: string;
  currentStudent = 0;
  nbreFeuilleParCopie = 0;
  numberPagesInScan = 0;
  selectionStudents: any[] = [];
  freeStudent: any[] = [];
  selectionStudentsString: () => string = () => this.selectionStudents.map(s => s.name + ' ' + s.firstname).join(' - ');
  showRecognizedStudent: () => string = () =>
    this.recognizedStudent?.name +
    ' ' +
    this.recognizedStudent?.firstname +
    ' (' +
    this.recognizedStudent?.ine +
    ') [precision=' +
    this.predictionprecision +
    ']';

  students: IStudent[] = [];
  assisted = true;
  baseTemplate = true;
  studentsOptions: () => SelectItem[] = () => this.getStudentOptions();

  getStudentOptions(): SelectItem[] {
    if (this.list?._options !== undefined && this.list._options!.length > 0) {
      this.filterLocalStudentList();
    }
    return this.students.map(student => ({
      value: student,
      label: student.name + ' - ' + student.firstname + ' - (' + student.ine + ')',
    }));
  }
  filterbindstudent = true;

  private editedImage: HTMLCanvasElement | undefined;
  _showNomImage = false;
  public get showNomImage(): boolean {
    return this._showNomImage;
  }
  public set showNomImage(s: boolean) {
    this._showNomImage = s;
  }
  public setShowNomImage: (s: boolean) => void = s => (this._showNomImage = s);

  @ViewChild('nomImage')
  nomImage: ElementRef | undefined;
  @ViewChild('nomImageReco')
  nomImageReco: ElementRef | undefined;
  _showPrenomImage = false;
  public get showPrenomImage(): boolean {
    return this._showPrenomImage;
  }
  public set showPrenomImage(s: boolean) {
    this._showPrenomImage = s;
  }
  public setShowPrenomImage: (s: boolean) => void = s => (this._showPrenomImage = s);

  @ViewChild('prenomImage')
  prenomImage: ElementRef | undefined;
  @ViewChild('prenomImageReco')
  prenomImageReco: ElementRef | undefined;
  _showINEImage = false;
  public get showINEImage(): boolean {
    return this._showINEImage;
  }
  public set showINEImage(s: boolean) {
    this._showINEImage = s;
  }
  public setShowINEImage: (s: boolean) => void = s => (this._showINEImage = s);

  @ViewChild('ineImage')
  ineImage: ElementRef | undefined;
  @ViewChild('ineImageReco')
  ineImageReco: ElementRef | undefined;
  debug = false;
  noalign = false;
  factor = 1;

  debugOptions = [
    { label: 'Off', value: false },
    { label: 'On', value: true },
  ];
  recognizedStudent: IStudent | undefined;
  predictionprecision = 0;

  activeIndex = 1;

  responsiveOptions2: any[] = [
    {
      breakpoint: '1500px',
      numVisible: 5,
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  displayBasic = false;
  images: any[] = [];

  shortcuts: ShortcutInput[] = [];

  constructor(
    public examService: ExamService,
    public zoneService: ZoneService,
    public courseService: CourseService,
    public studentService: StudentService,
    protected activatedRoute: ActivatedRoute,
    public confirmationService: ConfirmationService,
    public router: Router,
    private alignImagesService: AlignImagesService,
    public messageService: MessageService,
    public sheetService: ExamSheetService,
    private preferenceService: PreferenceService,
    private db: CacheServiceImpl,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.filterbindstudent = this.preferenceService.getFilterStudentPreference();
    this.activatedRoute.paramMap.subscribe(params => {
      this.recognizedStudent = undefined;
      this.blocked = true;
      if (params.get('examid') !== null) {
        if (this.examId !== params.get('examid')!) {
          this.examId = params.get('examid')!;
          this.images = [];
          // this.loadAllPages();

          if (params.get('currentStudent') !== null) {
            this.currentStudent = +params.get('currentStudent')! - 1;

            // const startTime = performance.now();
            // Step 1 Query templates
            this.db
              .countPageTemplate(+this.examId)

              .then(e2 => {
                this.nbreFeuilleParCopie = e2;

                this.activeIndex = this.currentStudent! * this.nbreFeuilleParCopie!;
                // Step 2 Query Scan in local DB
                /* let endTime = performance.now();
              let totalTime = endTime - startTime; // ti
              console.log(' step 1 ' + totalTime);*/
                this.factor = 1;
                this.noalign = false;
                this.db.countAlignImage(+this.examId).then(e1 => {
                  /* endTime = performance.now();
                  totalTime = endTime - startTime; // ti
                  //   console.log(' step 2 ' + totalTime);*/

                  this.numberPagesInScan = e1;
                  this.examService.find(+this.examId).subscribe(data => {
                    // Step 3 Query Exam
                    /* endTime = performance.now();
                    totalTime = endTime - startTime; // ti
                    //  console.log(' step 3 ' + totalTime);*/

                    this.exam = data.body!;
                    this.courseService.find(this.exam.courseId!).subscribe(e => (this.course = e.body!));
                    // Step 4 Query Students for Exam
                    this.refreshStudentList().then(() => this.testLoadImage());
                  });
                });
              });
          } else {
            const c = this.currentStudent + 1;
            this.router.navigateByUrl('/studentbindings/' + this.examId! + '/' + c);
          }
        } else {
          this.currentStudent = +params.get('currentStudent')! - 1;
          this.activeIndex = this.currentStudent! * this.nbreFeuilleParCopie!;
          this.getFilterStudent();
          this.testLoadImage().then(() => {
            this.blocked = false;
          });
        }
      }
    });
  }
  ngAfterViewInit(): void {
    this.shortcuts.push(
      {
        // ArrowRight
        key: ['ctrl + right', 'meta + right'],
        label: 'Navigation',
        description: this.translateService.instant('scanexam.nextstudent'),
        command: () => this.nextStudent(),
        preventDefault: true,
      },
      {
        // ArrowLeft
        key: ['ctrl + left', 'meta + left'],
        label: 'Navigation',
        description: this.translateService.instant('scanexam.previousstudent'),
        command: () => this.previousStudent(),
        preventDefault: true,
      },
    );
  }

  async testLoadImage(): Promise<void> {
    let z1, z2, z3;
    if (this.exam.namezoneId) {
      z1 = (await firstValueFrom(this.zoneService.find(this.exam.namezoneId))).body;
    }
    if (this.exam.firstnamezoneId) {
      z2 = (await firstValueFrom(this.zoneService.find(this.exam.firstnamezoneId))).body;
    }
    if (this.exam.idzoneId) {
      z3 = (await firstValueFrom(this.zoneService.find(this.exam.idzoneId))).body;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    let candidateFirstName = this.freeStudent.map(student => student.firstname!);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    let candidateName = this.freeStudent.map(student => student.name!);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    let candidateIne = this.freeStudent.map(student => student.ine!);
    if (!this.filterbindstudent) {
      candidateFirstName = this.students.map(student => student.firstname!);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      candidateName = this.students.map(student => student.name!);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      candidateIne = this.students.map(student => student.ine!);
    }
    const r: DoPredictionsInputSamePage = {
      align: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      candidateFirstName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      candidateName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      candidateIne,
      examId: +this.examId,
      indexDb: true,
      factor: this.factor,
      pagesToAnalyze: [this.currentStudent! * this.nbreFeuilleParCopie! + z1!.pageNumber!],
      pageTemplate: z1!.pageNumber!,
      nameZone: z1!,
      firstnameZone: z2!,
      ineZone: z3!,
      removeHorizontal: this.preferenceService.getPreference().removeHorizontalName,
      looking4missing: true,
      preferences: this.preferenceService.getPreference(),
    };
    this.alignImagesService.doPredictions(r).subscribe(r5 => {
      if (r5.length === 1) {
        const r1 = r5[0];
        if (r1.nameZone) {
          const r3 = new ImageData(new Uint8ClampedArray(r1.nameZone), r1.nameZoneW!, r1.nameZoneH!);
          this.displayImage(
            {
              i: r3,
              h: r1.nameZoneH!,
              w: r1.nameZoneW!,
            },
            this.nomImage,
            this.setShowNomImage,
          );
        }

        if (r1.firstnameZone) {
          const r3 = new ImageData(new Uint8ClampedArray(r1.firstnameZone), r1.firstnameZoneW!, r1.firstnameZoneH!);
          this.displayImage(
            {
              i: r3,
              h: r1.firstnameZoneH!,
              w: r1.firstnameZoneW!,
            },
            this.prenomImage,
            this.setShowPrenomImage,
          );
        }
        if (r1.ineZone) {
          const r3 = new ImageData(new Uint8ClampedArray(r1.ineZone), r1.ineZoneW!, r1.ineZoneH!);
          this.displayImage(
            {
              i: r3,
              h: r1.ineZoneH!,
              w: r1.ineZoneW!,
            },
            this.ineImage,
            this.setShowINEImage,
          );
        }
        const solutionName = r1.name;
        const solutionFirstname = r1.firstname;
        const solutionINE = r1.ine;
        const solutionNameProb = r1.namePrecision!;
        const solutionFirstnameProb = r1.firstnamePrecision!;
        const solutionINEProb = r1.inePrecision!;
        console.log(solutionName, solutionNameProb);
        console.log(solutionFirstname, solutionFirstnameProb);
        console.log(solutionINE, solutionINEProb);
        if (
          solutionName !== undefined &&
          solutionFirstname !== undefined &&
          solutionINE !== undefined &&
          solutionName.length > 0 &&
          solutionFirstname.length > 0 &&
          solutionINE.length > 0
        ) {
          let sts = this.students.filter(
            student =>
              (solutionName as string).toLowerCase() === student.name?.toLowerCase() &&
              (solutionFirstname as string).toLowerCase() === student.firstname?.toLowerCase() &&
              (solutionINE as string).toLowerCase() === student.ine?.toLowerCase(),
          );
          if (sts.length > 0) {
            // Full match
            this.recognizedStudent = sts[0];
            this.predictionprecision =
              ((+solutionNameProb! as number) + (+solutionFirstnameProb! as number) + (+solutionINEProb! as number)) / 3;
          }
          if (this.recognizedStudent === undefined) {
            // INE Good Match
            if (solutionINEProb > 0.28) {
              sts = this.students.filter(student => (solutionINE as string).toLowerCase() === student.ine?.toLowerCase());
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = solutionINEProb as number;
              }
            }
            // Only Name and FirstName (No INE)
            if (this.recognizedStudent === undefined && +solutionINEProb < +solutionFirstnameProb && +solutionINEProb < +solutionNameProb) {
              let sts1 = this.students.filter(
                student =>
                  (solutionName as string).toLowerCase() === student.name?.toLowerCase() &&
                  (solutionFirstname as string).toLowerCase() === student.firstname?.toLowerCase(),
              );
              if (sts1.length > 0) {
                this.recognizedStudent = sts1[0];
                this.predictionprecision = ((solutionNameProb as number) + (solutionFirstnameProb as number)) / 2;
              }
            }
            // Only INE and FirstName (No Name)
            if (
              this.recognizedStudent === undefined &&
              +solutionNameProb < +solutionFirstnameProb &&
              +solutionNameProb < +solutionINEProb
            ) {
              let sts1 = this.students.filter(
                student =>
                  (solutionFirstname as string).toLowerCase() === student.firstname?.toLowerCase() &&
                  (solutionINE as string).toLowerCase() === student.ine?.toLowerCase(),
              );
              if (sts1.length > 0) {
                this.recognizedStudent = sts1[0];
                this.predictionprecision = ((solutionFirstnameProb as number) + (solutionINEProb as number)) / 2;
              }
            }
            // Only INE and Name (No FirstName)
            if (
              this.recognizedStudent === undefined &&
              +solutionFirstnameProb < +solutionNameProb &&
              +solutionFirstnameProb < +solutionINEProb
            ) {
              sts = this.students.filter(
                student =>
                  (solutionName as string).toLowerCase() === student.name?.toLowerCase() &&
                  (solutionINE as string).toLowerCase() === student.ine?.toLowerCase(),
              );
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = ((solutionNameProb as number) + (solutionINEProb as number)) / 2;
              }
            }
            if (this.recognizedStudent === undefined && +solutionNameProb >= 0.44 && solutionFirstnameProb < solutionNameProb) {
              sts = this.students.filter(student => (solutionName as string).toLowerCase() === student.name?.toLowerCase());
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = (solutionNameProb as number) / 3;
              }
            }
            if (this.recognizedStudent === undefined && +solutionFirstnameProb >= 0.44 && solutionNameProb < solutionFirstnameProb) {
              sts = this.students.filter(student => (solutionFirstname as string).toLowerCase() === student.firstname?.toLowerCase());
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = (solutionFirstnameProb as number) / 3;
              }
            }
          }
        } else if (
          solutionName !== undefined &&
          solutionFirstname !== undefined &&
          solutionName.length > 0 &&
          solutionFirstname.length > 0
        ) {
          let sts = this.students.filter(
            student =>
              (solutionName as string).toLowerCase() === student.name?.toLowerCase() &&
              (solutionFirstname as string).toLowerCase() === student.firstname?.toLowerCase(),
          );
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = ((solutionNameProb as number) + (solutionFirstnameProb as number)) / 2;
          }
        } else if (solutionName !== undefined && solutionINE !== undefined && solutionName.length > 0 && solutionINE.length > 0) {
          let sts = this.students.filter(
            student =>
              (solutionName as string).toLowerCase() === student.name?.toLowerCase() &&
              (solutionINE as string).toLowerCase() === student.ine?.toLowerCase(),
          );
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = ((solutionNameProb as number) + (solutionINEProb as number)) / 2;
          }
        } else if (solutionINE !== undefined && solutionINE.length > 0 && +solutionINEProb > 0.25) {
          let sts = this.students.filter(student => (solutionINE as string).toLowerCase() === student.ine?.toLowerCase());
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = solutionINEProb as number;
          }
        } else if (solutionName !== undefined && solutionName.length > 0 && +solutionNameProb > 0.25) {
          let sts = this.students.filter(student => (solutionName as string).toLowerCase() === student.name?.toLowerCase());
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = solutionNameProb as number;
          }
        }
      }
    });
  }

  /*  loadImageAndPredict(): void {

    this.testLoadImage();


    const promiseload: Promise<ImageZone | null>[] = [];
    // Step 4 Query zone
    const p0 = this.loadZone(this.exam.namezoneId, this.setZoneNom, true, this.setShowNomImage, this.nomImage, this.currentStudent);

    promiseload.push(p0);

    const p1 = this.loadZone(
      this.exam.firstnamezoneId,
      this.setZonePrenom,
      true,
      this.setShowPrenomImage,
      this.prenomImage,
      this.currentStudent,
    );
    promiseload.push(p1);
    const p2 = this.loadZone(
      this.exam.idzoneId,
      this.setZoneINE,
      true,
      this.setShowINEImage,
      this.ineImage,
      this.currentStudent,
    );
    promiseload.push(p2);






    Promise.all(promiseload).then(value => {



      this.blocked = false;
      const ppredics: Promise<(string | number)[]>[] = [];
      ppredics.push(
        this.predictText(
          value[0]!,
          true,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          this.freeStudent.map(student => student.name!),
          //  this.nomImageReco!
        ),
      );
      ppredics.push(
        this.predictText(
          value[1]!,
          true,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          this.freeStudent.map(student => student.firstname!),
          // this.prenomImageReco!
        ),
      );

      ppredics.push(
        this.predictText(
          value[2]!,
          false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          this.freeStudent.map(student => student.ine!),
          //   this.ineImageReco!
        ),
      );
      Promise.all(ppredics).then((predicts) => {
        const solutionName = predicts[0];
        const solutionFirstname = predicts[1];
        const solutionINE = predicts[2];
        console.log(solutionName);
        console.log(solutionFirstname);
        console.log(solutionINE);
        if (
          solutionName !== undefined &&
          solutionFirstname !== undefined &&
          solutionINE !== undefined &&
          solutionName.length > 0 &&
          solutionFirstname.length > 0 &&
          solutionINE.length > 0
        ) {
          let sts = this.students.filter(
            student =>
              (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase() &&
              (solutionFirstname[0] as string).toLowerCase() === student.firstname?.toLowerCase() &&
              (solutionINE[0] as string).toLowerCase() === student.ine?.toLowerCase(),
          );
          if (sts.length > 0) {
            // Full match
            this.recognizedStudent = sts[0];
            this.predictionprecision = ((+solutionName[1] as number) +
              (+solutionFirstname[1] as number) +
             (+solutionINE[1] as number)) / 3;
          }
          if (this.recognizedStudent === undefined)
          {
            // INE Good Match
            if (+solutionINE[1] > 0.28) {
              sts = this.students.filter(student => (solutionINE[0] as string).toLowerCase() === student.ine?.toLowerCase());
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = solutionINE[1] as number;
              }
            }
            // Only Name and FirstName (No INE)
            if (this.recognizedStudent === undefined &&
              +solutionINE[1] < +solutionFirstname[1] &&
              +solutionINE[1] < +solutionName[1]) {
              let sts1 = this.students.filter(
                student =>
                  (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase() &&
                  (solutionFirstname[0] as string).toLowerCase() === student.firstname?.toLowerCase(),
              );
              if (sts1.length > 0) {
                this.recognizedStudent = sts1[0];
                this.predictionprecision = ((solutionName[1] as number) + (solutionFirstname[1] as number)) / 2;
              }
            }
            // Only INE and FirstName (No Name)
            if (this.recognizedStudent === undefined &&
              +solutionName[1] < +solutionFirstname[1] &&
              +solutionName[1] < +solutionINE[1]) {
              let sts1 = this.students.filter(
                student =>
                  (solutionFirstname[0] as string).toLowerCase() === student.firstname?.toLowerCase() &&
                  (solutionINE[0] as string).toLowerCase() === student.ine?.toLowerCase(),
              );
              if (sts1.length > 0) {
                this.recognizedStudent = sts1[0];
                this.predictionprecision = ((solutionFirstname[1] as number) + (solutionINE[1] as number)) / 2;
              }
            }
            // Only INE and Name (No FirstName)
            if (
              this.recognizedStudent === undefined &&
              +solutionFirstname[1] < +solutionName[1] &&
              +solutionFirstname[1] < +solutionINE[1]
            ) {
              sts = this.students.filter(
                student =>
                  (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase() &&
                  (solutionINE[0] as string).toLowerCase() === student.ine?.toLowerCase(),
              );
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = ((solutionName[1] as number) + (solutionINE[1] as number)) / 2;
              }
            }
            if (this.recognizedStudent === undefined && +solutionName[1] >= 0.44 && solutionFirstname[1] < solutionName[1]) {
              sts = this.students.filter(student => (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase());
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = (solutionName[1] as number) / 3;
              }
            }
            if (this.recognizedStudent === undefined && +solutionFirstname[1] >= 0.44 && solutionName[1] < solutionFirstname[1]) {
              sts = this.students.filter(student => (solutionFirstname[0] as string).toLowerCase() === student.firstname?.toLowerCase());
              if (sts.length > 0) {
                this.recognizedStudent = sts[0];
                this.predictionprecision = (solutionFirstname[1] as number) / 3;
              }
            }
          }
        } else if (
          solutionName !== undefined &&
          solutionFirstname !== undefined &&
          solutionName.length > 0 &&
          solutionFirstname.length > 0
        ) {
          let sts = this.students.filter(
            student =>
              (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase() &&
              (solutionFirstname[0] as string).toLowerCase() === student.firstname?.toLowerCase(),
          );
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = ((solutionName[1] as number) + (solutionFirstname[1] as number)) / 2;
          }
        }
        else if ( solutionName !== undefined && solutionINE !== undefined && solutionName.length > 0 && solutionINE.length > 0) {
          let sts = this.students.filter(
            student =>
              (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase() &&
              (solutionINE[0] as string).toLowerCase() === student.ine?.toLowerCase(),
          );
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = ((solutionName[1] as number) + (solutionINE[1] as number)) / 2;
          }
        } else if (solutionINE !== undefined && solutionINE.length > 0 && +solutionINE[1] > 0.25) {
          let sts = this.students.filter(student => (solutionINE[0] as string).toLowerCase() === student.ine?.toLowerCase());
          if (sts.length > 0) {
            this.recognizedStudent = sts[0];
            this.predictionprecision = solutionINE[1] as number;
          }
        }
          else if (solutionName !== undefined && solutionName.length > 0 && +solutionName[1] > 0.25) {
            let sts = this.students.filter(student => (solutionName[0] as string).toLowerCase() === student.name?.toLowerCase());
            if (sts.length > 0) {
              this.recognizedStudent = sts[0];
              this.predictionprecision = solutionName[1] as number;
            }
          }



      });
    });
  }*/
  reloadImageGrowFactor(event: any): void {
    if (event.value !== this.factor) {
      this.factor = event.value;
      this.testLoadImage();
    }
  }

  // reloadImage1(): void {
  /*   this.blocked = true;

    const promiseload: Promise<ImageZone | null>[] = [];
    const p0 = this.loadZone(this.exam.namezoneId, this.setZoneNom, true, this.setShowNomImage, this.nomImage, this.currentStudent);

    promiseload.push(p0);

    const p1 = this.loadZone(
      this.exam.firstnamezoneId,
      this.setZonePrenom,
      true,
      this.setShowPrenomImage,
      this.prenomImage,
      this.currentStudent,
    );
    promiseload.push(p1);
    const p2 = this.loadZone(this.exam.idzoneId, this.setZoneINE, true, this.setShowINEImage, this.ineImage, this.currentStudent);
    promiseload.push(p2);

    Promise.all(promiseload).then(() => (this.blocked = false));
    // this.loadAllPages();*/
  // }
  /*
  async predictText(
    p: ImageZone,
    zoneletter: boolean,
    candidatematch: string[] ,
  ): Promise<(string | number)[]> {
    return new Promise<(string | number)[]>(resolve => {
      if (p !== null && p !== undefined && this.assisted) {
        if (p.t !== undefined) {
          const c = { template: p.t!, image: p.i, match: candidatematch, preference: this.preferenceService.getPreference() };
          //        this.alignImagesService.prediction(c, zoneletter).subscribe(result => {
          this.alignImagesService.prediction(c, zoneletter).subscribe(result => {
            //          const ctx2 = debugimageRef?.nativeElement.getContext('2d');
            //          ctx2.putImageData(result.debug, 0, 0);
            resolve(result.solution!);
          });
        } else {
          const c = { image: p.i, match: candidatematch, preference: this.preferenceService.getPreference() };
          //        this.alignImagesService.prediction(c, zoneletter).subscribe(result => {
          this.alignImagesService.prediction(c, zoneletter).subscribe(result => {
            //          const ctx2 = debugimageRef?.nativeElement.getContext('2d');
            //          ctx2.putImageData(result.debug, 0, 0);
            resolve(result.solution!);
          });
        }
      } else {
        resolve([]);
      }
    });
  }
  */
  @HostListener('window:keydown.control.Enter', ['$event'])
  async selectRecogniezStudent(): Promise<void> {
    this.selectionStudents = [this.recognizedStudent];
    await this.bindStudent();
    if ((this.currentStudent + 1) * this.nbreFeuilleParCopie < this.numberPagesInScan) {
      this.currentStudent = this.currentStudent + 1;
      this.goToStudent(this.currentStudent);
    }
  }
  /*
  async loadZone(
    zoneId: number | undefined,
    z: (zone: IZone) => void,
    showImage: boolean,
    showImageRef: (s: boolean) => void,
    imageRef: ElementRef<any> | undefined,
    currentStudent: number,
  ): Promise<ImageZone | null> {
    return new Promise<ImageZone | null>(resolve => {
      if (zoneId) {
        this.zoneService.find(zoneId).subscribe(e => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          z(e.body!);
          this.getAllImage4Zone(currentStudent! * this.nbreFeuilleParCopie! + e.body!.pageNumber!, e.body!).then(p => {
            if (showImage) {
              this.displayImage(p, imageRef, showImageRef);
            }
            resolve(p);
          });
        });
      } else {
        resolve(null);
      }
    });
  }*/
  /*
  async getAllImage4Zone(pageInscan: number, zone: IZone): Promise<ImageZone> {
    if (this.noalign) {
      return new Promise(resolve => {
        // const startTime = performance.now();
        this.db.getFirstNonAlignImage(+this.examId, pageInscan).then(e2 => {
          const image = JSON.parse(e2!.value, this.reviver);
          this.loadImage(image.pages, pageInscan).then(v => {
            let finalW = (zone.width! * v.width! * this.factor) / 100000;
            let finalH = (zone.height! * v.height! * this.factor) / 100000;
            let initX =
              (zone.xInit! * v.width!) / 100000 - ((zone.width! * v.width! * this.factor) / 100000 - (zone.width! * v.width!) / 100000) / 2;
            if (initX < 0) {
              finalW = finalW + initX;
              initX = 0;
            }
            let initY =
              (zone.yInit! * v.height!) / 100000 -
              ((zone.height! * v.height! * this.factor) / 100000 - (zone.height! * v.height!) / 100000) / 2;
            if (initY < 0) {
              finalH = finalH + initY;
              initY = 0;
            }
            this.alignImagesService
              .imageCrop({
                image: v.image!.data.buffer,
                imageWidth: v.image!.width,
                imageHeight: v.image!.height,
                x: initX,
                y: initY,
                width: finalW,
                height: finalH,
              })
              .subscribe(res => resolve({ i: new ImageData(new Uint8ClampedArray(res), finalW, finalH), w: finalW, h: finalH }));
          });
        });
      });
    } else {
      return new Promise(resolve => {
        // const startTime = performance.now();
        this.db.getFirstAlignImage(+this.examId, pageInscan).then(e2 => {
          const image = JSON.parse(e2!.value, this.reviver);
          this.loadImage(image.pages, pageInscan).then(v => {
            let finalW = (zone.width! * v.width! * this.factor) / 100000;
            let finalH = (zone.height! * v.height! * this.factor) / 100000;
            let initX =
              (zone.xInit! * v.width!) / 100000 - ((zone.width! * v.width! * this.factor) / 100000 - (zone.width! * v.width!) / 100000) / 2;
            if (initX < 0) {
              finalW = finalW + initX;
              initX = 0;
            }
            let initY =
              (zone.yInit! * v.height!) / 100000 -
              ((zone.height! * v.height! * this.factor) / 100000 - (zone.height! * v.height!) / 100000) / 2;
            if (initY < 0) {
              finalH = finalH + initY;
              initY = 0;
            }
            this.alignImagesService
              .imageCrop({
                image: v.image!.data.buffer,
                imageWidth: v.image!.width,
                imageHeight: v.image!.height,
                x: initX,
                y: initY,
                width: finalW,
                height: finalH,
              })
              .subscribe(res => {
                let page1 = pageInscan % this.nbreFeuilleParCopie;
                if (page1 === 0) {
                  page1 = this.nbreFeuilleParCopie;
                }
                this.db.getFirstTemplate(+this.examId, page1).then(e3 => {
                  if (!this.baseTemplate) {
                    resolve({ i: new ImageData(new Uint8ClampedArray(res), finalW, finalH), w: finalW, h: finalH });
                  } else {
                    const image1 = JSON.parse(e3!.value, this.reviver);
                    this.loadImage(image1.pages, pageInscan % this.nbreFeuilleParCopie).then(v1 => {
                      let finalW1 = (zone.width! * v1.width! * this.factor) / 100000;
                      let finalH1 = (zone.height! * v1.height! * this.factor) / 100000;
                      let initX1 =
                        (zone.xInit! * v1.width!) / 100000 -
                        ((zone.width! * v1.width! * this.factor) / 100000 - (zone.width! * v1.width!) / 100000) / 2;
                      if (initX1 < 0) {
                        finalW1 = finalW1 + initX1;
                        initX1 = 0;
                      }
                      let initY1 =
                        (zone.yInit! * v1.height!) / 100000 -
                        ((zone.height! * v1.height! * this.factor) / 100000 - (zone.height! * v1.height!) / 100000) / 2;
                      if (initY1 < 0) {
                        finalH1 = finalH1 + initY1;
                        initY1 = 0;
                      }
                      this.alignImagesService
                        .imageCrop({
                          image: v1.image!.data.buffer,
                          imageWidth: v1.image!.width,
                          imageHeight: v1.image!.height,

                          x: initX1,
                          y: initY1,
                          width: finalW1,
                          height: finalH1,
                        })
                        .subscribe(res1 => {
                          resolve({
                            t: new ImageData(new Uint8ClampedArray(res1), finalW1, finalH1),
                            i: new ImageData(new Uint8ClampedArray(res), finalW, finalH),
                            w: finalW,
                            h: finalH,
                          });
                        });
                    });
                  }
                });
              });
          });
        });
      });
    }
  }*/

  displayImage(v: ImageZone, imageRef: ElementRef<any> | undefined, show: (s: boolean) => void): void {
    if (imageRef !== undefined) {
      imageRef!.nativeElement.width = v.w;
      imageRef!.nativeElement.height = v.h;
      const ctx1 = imageRef!.nativeElement.getContext('2d');

      ctx1.putImageData(v.i, 0, 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      show(true);
    }
  }

  selectedColor(item: any): string {
    const list = this.list._options!.filter(
      s =>
        s.value.examSheets === null ||
        s.value.examSheets!.length === 0 ||
        !s.value.examSheets?.some((ex: any) => ex?.scanId === this.exam.scanfileId) ||
        s.value.examSheets?.some((ex: any) => ex?.scanId === this.exam.scanfileId && ex?.pagemin === -1 && ex?.pagemax === -1),
    );
    const list1 = this.list._options!.filter(
      s =>
        s.value.examSheets?.some(
          (ex: any) => ex?.scanId === this.exam.scanfileId && ex?.pagemin === this.currentStudent * this.nbreFeuilleParCopie,
        ),
    );

    if (list.filter(e => e.label === item.label).length >= 1) {
      return 'text-green-400';
    } else if (list1.filter(e => e.label === item.label).length >= 1) {
      return '';
    } else {
      return 'text-red-400';
    }
  }

  goToStudent(i: number): void {
    this.list._filterValue = '';
    this.list._filteredOptions = this.list._options;

    if (i * this.nbreFeuilleParCopie < this.numberPagesInScan) {
      this.router.navigateByUrl('studentbindings/' + this.examId + '/' + (i + 1));
    }
  }

  /* reShow1(): void {
     this.getAllImage4Zone(this.currentStudent! * this.nbreFeuilleParCopie! + this.zonenom.pageNumber!, this.zonenom).then(p =>
      this.displayImage(p, this.nomImage, this.setShowNomImage),
    );
    this.getAllImage4Zone(this.currentStudent! * this.nbreFeuilleParCopie! + this.zoneprenom.pageNumber!, this.zoneprenom).then(p =>
      this.displayImage(p, this.prenomImage, this.setShowPrenomImage),
    );
    this.getAllImage4Zone(this.currentStudent! * this.nbreFeuilleParCopie! + this.zoneine.pageNumber!, this.zoneine).then(p =>
      this.displayImage(p, this.ineImage, this.setShowINEImage),
    );

    const filterStudent = this.students.filter(
      s => s.examSheets?.some(ex => ex?.scanId === this.exam.scanfileId && ex?.pagemin === this.currentStudent * this.nbreFeuilleParCopie),
    );
    this.selectionStudents = filterStudent;
  }*/

  /* async loadImage(file: any, page1: number): Promise<IPage> {
    return new Promise(resolve => {
      const i = new Image();
      i.onload = () => {
        this.editedImage = <HTMLCanvasElement>document.createElement('canvas');
        this.editedImage.width = i.width;
        this.editedImage.height = i.height;
        const ctx = this.editedImage.getContext('2d');
        ctx!.drawImage(i, 0, 0);
        const inputimage = ctx!.getImageData(0, 0, i.width, i.height);
        resolve({ image: inputimage, page: page1, width: i.width, height: i.height });
      };
      i.src = file;
    });
  }*/

  nextStudent(): void {
    if (this.currentStudent + 1 < this.numberPagesInScan / this.nbreFeuilleParCopie) {
      this.selectionStudents = [];
      this.goToStudent(this.currentStudent + 1);
    }
  }
  previousStudent(): void {
    if (this.currentStudent - 1 >= 0) {
      this.selectionStudents = [];
      this.goToStudent(this.currentStudent - 1);
    }
  }

  onPageChange($event: any): void {
    this.selectionStudents = [];
    this.goToStudent($event.page);
  }

  selectStudent4Copie($event: any): void {
    this.selectionStudents = $event.value;
  }

  public alignementChange(): any {
    // this.loadAllPages();
    // this.exportAsImage();
  }

  private reviver(key: any, value: any): any {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  gotoUE(): any {
    this.router.navigateByUrl('/exam/' + this.examId);
  }

  async refreshStudentList(): Promise<void> {
    this.blocked = true;
    const studentsbody = await firstValueFrom(this.studentService.query({ courseId: this.exam.courseId }));
    this.students = studentsbody.body!;
    this.refreshLocalStudentList();
    this.blocked = false;
  }

  filterLocalStudentList(): void {
    if (this.filterbindstudent) {
      this.list._filteredOptions = this.list._options!.filter(
        s =>
          s.value.examSheets === null ||
          s.value.examSheets!.length === 0 ||
          !s.value.examSheets?.some((ex: any) => ex?.scanId === this.exam.scanfileId) ||
          s.value.examSheets?.some((ex: any) => ex?.scanId === this.exam.scanfileId && ex?.pagemin === -1 && ex?.pagemax === -1) ||
          s.value.examSheets?.some(
            (ex: any) => ex?.scanId === this.exam.scanfileId && ex?.pagemin === this.currentStudent * this.nbreFeuilleParCopie,
          ),
      );
    } else {
      // this.list._filterValue = '';
      this.list._filteredOptions = this.list._options;
    }
  }

  refreshLocalStudentList(): void {
    this.list._filterValue = '';

    this.preferenceService.saveFilterStudentPreference(this.filterbindstudent);
    this.filterLocalStudentList();

    // Step 5 Bind All copies
    this.getFilterStudent();
  }

  getFilterStudent(): void {
    const filterStudent = this.students.filter(
      s => s.examSheets?.some(ex => ex?.scanId === this.exam.scanfileId && ex?.pagemin === this.currentStudent * this.nbreFeuilleParCopie),
    );
    this.selectionStudents = filterStudent;
    const freeStudent = this.students.filter(
      s =>
        s.examSheets === null ||
        s.examSheets!.length === 0 ||
        !s.examSheets?.some((ex: any) => ex?.scanId === this.exam.scanfileId) ||
        s.examSheets?.some((ex: any) => ex?.scanId === this.exam.scanfileId && ex?.pagemin === -1 && ex?.pagemax === -1) ||
        s.examSheets?.some(
          (ex: any) => ex?.scanId === this.exam.scanfileId && ex?.pagemin === this.currentStudent * this.nbreFeuilleParCopie,
        ),
    );
    this.freeStudent = freeStudent;
  }

  async selectStudents(event: IStudent): Promise<void> {
    this.blocked = true;
    this.selectionStudents = [event];

    await this.bindStudent();
    if ((this.currentStudent + 1) * this.nbreFeuilleParCopie < this.numberPagesInScan) {
      this.currentStudent = this.currentStudent + 1;
      this.blocked = false;

      this.goToStudent(this.currentStudent);
    } else {
      this.blocked = false;
    }
  }
  async bindStudentOnClick(): Promise<void> {
    this.blocked = true;
    await this.bindStudent();
    this.blocked = false;
  }

  async bindStudent(): Promise<void> {
    const examSheet4CurrentStudent: IExamSheet[] = (
      this.students.filter(s => this.selectionStudents.map((s1: IStudent) => s1.id)!.includes(s.id)).map(s => s.examSheets) as any
    )
      .flat()
      .filter((ex: any) => ex?.scanId === this.exam.scanfileId);
    // Récupère la sheet courante.
    const examSheet4CurrentPage: IExamSheet[] = (
      this.students
        .filter(
          s =>
            s.examSheets?.some(ex => ex?.scanId === this.exam.scanfileId && ex.pagemin === this.currentStudent * this.nbreFeuilleParCopie),
        )
        .map(s => s.examSheets) as any
    ).flat();
    let promises: Promise<any>[] = [];
    // Passe cette sheet à -1 -1. sémantique plus associé

    examSheet4CurrentPage
      .filter(ex => !examSheet4CurrentStudent.map(ex1 => ex1.id).includes(ex!.id))
      .forEach(ex => {
        ex!.pagemin = -1;
        ex!.pagemax = -1;
        const p = firstValueFrom(this.sheetService.update(ex!));
        /*          new Promise<void>(res => {
            this.sheetService.update(ex!).subscribe(() => {
              res();
            });
          });*/
        promises.push(p);
      });

    // Pour l'étudiant sélectionné. récupère la sheet. Si elle exite, on met à jour les bonnes pages sinon on crée la page.

    const selectedStudent = this.students.filter(s => this.selectionStudents.map((s1: IStudent) => s1.id)!.includes(s.id));
    for (const student of selectedStudent) {
      const examS4Student = student.examSheets?.filter((ex: IExamSheet) => ex?.scanId === this.exam.scanfileId);
      if (examS4Student !== undefined && examS4Student.length > 0) {
        examS4Student.forEach((ex: IExamSheet) => {
          ex.pagemin = this.currentStudent * this.nbreFeuilleParCopie;
          ex.pagemax = (this.currentStudent + 1) * this.nbreFeuilleParCopie - 1;
          const p1 = firstValueFrom(this.sheetService.update(ex));
          promises.push(p1);
        });
      } else {
        const sheet: IExamSheet = {
          name: uuid(),
          pagemin: this.currentStudent * this.nbreFeuilleParCopie,
          pagemax: (this.currentStudent + 1) * this.nbreFeuilleParCopie - 1,
          scanId: this.exam.scanfileId,
          students: this.selectionStudents,
        };
        const e = await firstValueFrom(this.sheetService.create(sheet));
        const p1s: Promise<any>[] = [];
        this.selectionStudents.forEach(s1 => {
          s1.examSheets?.push(e.body!);
          const p1 = firstValueFrom(this.studentService.update(s1));
          p1s.push(p1);
        });
        promises.push(Promise.all(p1s));
      }
    }

    await Promise.all(promises);
    await this.refreshStudentList();
  }

  showGalleria(): void {
    this.blocked = true;
    this.loadAllPages().then(() => {
      this.blocked = false;
      this.displayBasic = true;
    });
  }
  @HostListener('document:keydown.escape', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onKeydownHandler(event: KeyboardEvent): void {
    this.displayBasic = false;
  }

  loadAllPages(): Promise<void> {
    this.images = [];
    return new Promise<void>(resolve => {
      this.db.countNonAlignImage(+this.examId!).then(page => {
        if (page > 30) {
          this.activeIndex = 0;
          this.db.countPageTemplate(+this.examId!).then(page1 => {
            if (this.noalign) {
              this.db
                .getNonAlignImageBetweenAndSortByPageNumber(
                  +this.examId!,
                  this.currentStudent * page1 + 1,
                  (this.currentStudent + 1) * page1,
                )
                .then(e1 => {
                  e1.forEach(e => {
                    const image = JSON.parse(e!.value, this.reviver);
                    this.images.push({
                      src: image.pages,
                      alt: 'Description for Image 2',
                      title: 'Exam',
                    });
                  });

                  resolve();
                });
            } else {
              this.db
                .getAlignImageBetweenAndSortByPageNumber(+this.examId!, this.currentStudent * page1 + 1, (this.currentStudent + 1) * page1)
                .then(e1 => {
                  e1.forEach(e => {
                    const image = JSON.parse(e!.value, this.reviver);
                    this.images.push({
                      src: image.pages,
                      alt: 'Description for Image 2',
                      title: 'Exam',
                    });
                  });
                  resolve();
                });
            }
          });
        } else {
          if (this.noalign) {
            this.db.getNonAlignSortByPageNumber(+this.examId!).then(e1 => {
              e1.forEach(e => {
                const image = JSON.parse(e!.value, this.reviver);

                this.images.push({
                  src: image.pages,
                  alt: 'Description for Image 2',
                  title: 'Exam',
                });
              });
              resolve();
            });
          } else {
            this.db.getAlignSortByPageNumber(+this.examId!).then(e1 => {
              e1.forEach(e => {
                const image = JSON.parse(e!.value, this.reviver);
                this.images.push({
                  src: image.pages,
                  alt: 'Description for Image 2',
                  title: 'Exam',
                });
              });
              resolve();
            });
          }
        }
      });
    });
  }

  cleanBinding(): void {
    this.blocked = true;

    this.examService.deleteAllExamSheets(+this.examId).subscribe(() => {
      this.filterbindstudent = false;
      this.preferenceService.saveFilterStudentPreference(false);
      this.refreshStudentList();
      this.blocked = false;
    });
  }
}
