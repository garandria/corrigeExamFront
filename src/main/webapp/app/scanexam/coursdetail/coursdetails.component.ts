/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';
// import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import { faMotorcycle as fasMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap as faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { faBookOpenReader as faBookOpenReader } from '@fortawesome/free-solid-svg-icons';
import { CourseService } from '../../entities/course/service/course.service';
import { ICourse } from '../../entities/course/course.model';
import { IExam } from '../../entities/exam/exam.model';
import { ExamService } from '../../entities/exam/service/exam.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { DialogService } from 'primeng/dynamicdialog';
import { SharecourseComponent } from '../sharecourse/sharecourse.component';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, scan } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

export interface CacheUploadNotification {
  setMessage(v: string): void;
  setSubMessage(v: string): void;
  setBlocked(v: boolean): void;
  setProgress(v: number): void;
}

export interface CacheDownloadNotification {
  setMessage(v: string): void;
  setSubMessage(v: string): void;
  setBlocked(v: boolean): void;
  setProgress(v: number): void;
  setShowAssociation(v: boolean): void;
  setShowCorrection(v: boolean): void;
}

@Component({
  selector: 'jhi-coursdetails',
  templateUrl: './coursdetails.component.html',
  styleUrls: ['./coursdetails.component.scss'],
  providers: [ConfirmationService, DialogService],
})
export class CoursdetailsComponent implements OnInit {
  farCircle = farCircle as IconProp;
  fasMotorcycle = fasMotorcycle as IconProp;
  faGraduationCap = faGraduationCap as IconProp;
  faBookOpenReader = faBookOpenReader as IconProp;
  exams!: IExam[];
  course: ICourse | undefined;
  dockItems!: any[];
  courseId = '';
  layoutsidebarVisible = false;
  includeStudentsData = true;

  blocked = false;
  message = '';

  constructor(
    protected applicationConfigService: ApplicationConfigService,

    public courseService: CourseService,
    public examService: ExamService,
    protected activatedRoute: ActivatedRoute,
    public confirmationService: ConfirmationService,
    public router: Router,
    public appConfig: ApplicationConfigService,
    public dialogService: DialogService,
    private translateService: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.get('courseid') !== null) {
        this.courseId = params.get('courseid')!;
        this.translateService.get('scanexam.creerexam').subscribe(() => {
          this.initCmpt();
        });
        this.translateService.onLangChange.subscribe(() => {
          this.initCmpt();
        });

        this.examService.query({ courseId: params.get('courseid') }).subscribe(data => {
          this.exams = data.body!;
        });
        this.courseService.find(+params.get('courseid')!).subscribe(
          e => (this.course = e.body!),
          () => {
            this.router.navigateByUrl('/');
          }
        );
      }
    });
  }

  // component.ts
  // getFileName not necessary, you can just set this as a string if you wish
  getFileName(response: HttpResponse<Blob>): string {
    let filename: string;
    try {
      const contentDisposition: string = response.headers.get('content-disposition')!;
      const r = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      filename = r.exec(contentDisposition)![1];
    } catch (e) {
      filename = this.courseId + '.json';
    }
    return filename;
  }

  exportCourse(): void {
    let endpoint = 'api/exportCourse/';
    if (!this.includeStudentsData) {
      endpoint = 'api/exportCourseWithoutStudentData/';
    }
    this.layoutsidebarVisible = false;
    this.message = this.translateService.instant('scanexam.exportencours');
    this.blocked = true;

    this.http
      .get<Blob>(this.applicationConfigService.getEndpointFor(`${endpoint}${this.courseId}`), {
        observe: 'response',
        responseType: 'blob' as 'json',
      })
      .subscribe(response => {
        // this.downLoadFile(s, "application/json")
        const filename: string = this.getFileName(response);
        const binaryData = [];
        binaryData.push(response.body!);
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'blob' }));
        downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);

        this.blocked = false;
        this.message = '';

        downloadLink.click();
      });
  }
  initCmpt(): void {
    this.dockItems = [
      {
        label: this.translateService.instant('scanexam.gobacktomodulelist'),
        icon: this.appConfig.getFrontUrl() + 'content/images/left-arrow.svg',
        title: this.translateService.instant('scanexam.gobacktomodulelistdetail'),
        command1: () => {
          this.gobacktomodulelist();
        },
      },
      {
        label: this.translateService.instant('scanexam.creerexam'),
        icon: this.appConfig.getFrontUrl() + 'content/images/exam.svg',
        title: this.translateService.instant('scanexam.creerexam'),
        route: '/creerexam/' + this.courseId,
      },
      {
        label: this.translateService.instant('scanexam.enregistreretudiant'),
        icon: this.appConfig.getFrontUrl() + 'content/images/students.svg',
        title: this.translateService.instant('scanexam.enregistreretudiant'),
        route: '/registerstudents/' + this.courseId,
      },
      {
        label: this.translateService.instant('scanexam.shareue'),
        icon: this.appConfig.getFrontUrl() + 'content/images/share-button-svgrepo-com.svg',
        title: this.translateService.instant('scanexam.shareuedetail'),
        command1: () => {
          this.showShare();
        },
      },
      {
        label: this.translateService.instant('scanexam.removeue'),
        icon: this.appConfig.getFrontUrl() + 'content/images/remove-rubbish.svg',
        title: this.translateService.instant('scanexam.removeuedetail'),
        command1: () => {
          this.confirmeDelete();
        },
      },
      {
        label: this.translateService.instant('scanexam.export'),
        icon: this.appConfig.getFrontUrl() + 'content/images/import-export-outline-icon.svg',
        title: this.translateService.instant('scanexam.exportcoursetooltip'),
        command1: () => {
          this.layoutsidebarVisible = true;
        },
      },
    ];
  }

  confirmeDelete(): any {
    this.translateService.get('scanexam.removeverify').subscribe(data => {
      this.confirmationService.confirm({
        message: data,
        accept: () => {
          // eslint-disable-next-line no-console
          if (this.course !== undefined) {
            this.courseService.delete(this.course.id!).subscribe(e => {
              // eslint-disable-next-line no-console
              this.router.navigateByUrl('/');
            });
          }
        },
      });
    });
  }

  showShare(): void {
    this.translateService.get('scanexam.sharecourse').subscribe(data1 => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.course !== undefined) {
        const ref = this.dialogService.open(SharecourseComponent, {
          data: {
            courseid: this.course.id,
          },
          header: data1,
          width: '70%',
        });
      }
    });
  }

  gobacktomodulelist(): void {
    this.router.navigateByUrl('/');
  }

  onCourseNameChanged(newName: string): void {
    const oldName = this.course!.name;

    this.course!.name = newName;

    firstValueFrom(this.courseService.update(this.course!)).catch(() => {
      this.course!.name = oldName;
    });
  }
}
