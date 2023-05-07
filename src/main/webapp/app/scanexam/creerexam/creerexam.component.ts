import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { Exam } from 'app/entities/exam/exam.model';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CourseService } from '../../entities/course/service/course.service';
import { ExamService } from '../../entities/exam/service/exam.service';
import { TemplateService } from '../../entities/template/service/template.service';
import { Template } from '../../entities/template/template.model';

@Component({
  selector: 'jhi-creerexam',
  templateUrl: './creerexam.component.html',
  styleUrls: ['./creerexam.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class CreerexamComponent implements OnInit {
  blocked = false;
  courseid: string | undefined = undefined;
  isSaving = false;
  coursName = '';
  faDownload = faDownload;
  editForm = this.fb.group({
    name: [null, [Validators.required]],
    content: [],
    contentContentType: [null, [Validators.required]],
    mark: [true],
    autoMapStudentCopyToList: [true],
  });

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    public confirmationService: ConfirmationService,
    private fb: UntypedFormBuilder,
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected courseService: CourseService,
    protected examService: ExamService,
    protected templateService: TemplateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('courseid');
      if (id !== null) {
        this.courseid = id;
        this.courseService.find(+this.courseid).subscribe(c => (this.coursName = c.body?.name ?? ''));
      }
    });
  }

  gotoUE(): void {
    if (this.courseid !== undefined) {
      this.router.navigateByUrl(`/course/${this.courseid}`);
    }
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('gradeScopeIsticApp.error', { ...err, key: 'error.file.' + err.key })),
    });
  }

  save(): void {
    this.isSaving = true;
    const template = new Template();
    template.name = `${String(this.editForm.get(['name'])!.value)}Template`;
    template.content = this.editForm.get(['content'])!.value;
    template.contentContentType = this.editForm.get(['contentContentType'])!.value;
    (template.mark = this.editForm.get(['mark'])!.value), (template.autoMapStudentCopyToList = true);

    this.templateService.create(template).subscribe(
      res => {
        const exam = new Exam();
        exam.name = this.editForm.get(['name'])!.value;
        exam.templateId = res.body?.id;
        exam.courseId = +this.courseid!;
        this.examService.create(exam).subscribe(
          () => {
            this.isSaving = false;
            this.gotoUE();
          },
          () => {
            this.isSaving = false;
          }
        );
      },
      () => {
        this.isSaving = false;
      }
    );
  }

  downloadTemplateWord(): void {
    window.open('content/templateWord.docx', '_blank');
  }
  downloadTemplateOdt(): void {
    window.open('content/templateExample.odt', '_blank');
  }
  downloadTemplateLatex(): void {
    window.open('content/latex-template.zip', '_blank');
  }
}
