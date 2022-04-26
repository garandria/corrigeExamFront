/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ITextComment, TextComment } from '../text-comment.model';
import { TextCommentService } from '../service/text-comment.service';
import { IQuestion } from 'app/entities/question/question.model';
import { QuestionService } from 'app/entities/question/service/question.service';

@Component({
  selector: 'jhi-text-comment-update',
  templateUrl: './text-comment-update.component.html',
})
export class TextCommentUpdateComponent implements OnInit {
  isSaving = false;

  questions: IQuestion[] = [];

  editForm = this.fb.group({
    id: [],
    text: [],
    zonegeneratedid: [],
    questionId: [],
  });

  constructor(
    protected textCommentService: TextCommentService,
    protected questionService: QuestionService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ textComment }) => {
      this.updateForm(textComment);
      this.questionService.query().subscribe((res: HttpResponse<IQuestion[]>) => (this.questions = res.body || []));
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const textComment = this.createFromForm();
    if (textComment.id !== undefined) {
      this.subscribeToSaveResponse(this.textCommentService.update(textComment));
    } else {
      this.subscribeToSaveResponse(this.textCommentService.create(textComment));
    }
  }

  trackById(index: number, item: IQuestion): any {
    return item.id;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITextComment>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(textComment: ITextComment): void {
    this.editForm.patchValue({
      id: textComment.id,
      text: textComment.text,
      zonegeneratedid: textComment.zonegeneratedid,
      questionId: textComment.questionId,
    });
  }

  protected createFromForm(): ITextComment {
    return {
      ...new TextComment(),
      id: this.editForm.get(['id'])!.value,
      text: this.editForm.get(['text'])!.value,
      zonegeneratedid: this.editForm.get(['zonegeneratedid'])!.value,
      questionId: this.editForm.get(['questionId'])!.value,
    };
  }
}
