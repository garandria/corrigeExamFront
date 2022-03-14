/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IStudentResponse, StudentResponse } from '../student-response.model';
import { StudentResponseService } from '../service/student-response.service';
import { IQuestion } from 'app/entities/question/question.model';
import { QuestionService } from 'app/entities/question/service/question.service';
import { IStudent } from 'app/entities/student/student.model';
import { StudentService } from 'app/entities/student/service/student.service';

type SelectableEntity = IQuestion | IStudent;

@Component({
  selector: 'jhi-student-response-update',
  templateUrl: './student-response-update.component.html',
})
export class StudentResponseUpdateComponent implements OnInit {
  isSaving = false;
  questions: IQuestion[] = [];
  students: IStudent[] = [];

  editForm = this.fb.group({
    id: [],
    note: [],
    questionId: [],
    studentId: [],
  });

  constructor(
    protected studentResponseService: StudentResponseService,
    protected questionService: QuestionService,
    protected studentService: StudentService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ studentResponse }) => {
      this.updateForm(studentResponse);

      this.questionService.query().subscribe((res: HttpResponse<IQuestion[]>) => (this.questions = res.body || []));

      this.studentService.query().subscribe((res: HttpResponse<IStudent[]>) => (this.students = res.body || []));
    });
  }

  updateForm(studentResponse: IStudentResponse): void {
    this.editForm.patchValue({
      id: studentResponse.id,
      note: studentResponse.note,
      questionId: studentResponse.questionId,
      studentId: studentResponse.studentId,
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const studentResponse = this.createFromForm();
    if (studentResponse.id !== undefined) {
      this.subscribeToSaveResponse(this.studentResponseService.update(studentResponse));
    } else {
      this.subscribeToSaveResponse(this.studentResponseService.create(studentResponse));
    }
  }

  private createFromForm(): IStudentResponse {
    return {
      ...new StudentResponse(),
      id: this.editForm.get(['id'])!.value,
      note: this.editForm.get(['note'])!.value,
      questionId: this.editForm.get(['questionId'])!.value,
      studentId: this.editForm.get(['studentId'])!.value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStudentResponse>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: SelectableEntity): any {
    return item.id;
  }
}
