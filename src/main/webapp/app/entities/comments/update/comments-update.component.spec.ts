import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { CommentsService } from '../service/comments.service';
import { IComments, Comments } from '../comments.model';
import { IStudentResponse } from 'app/entities/student-response/student-response.model';
import { StudentResponseService } from 'app/entities/student-response/service/student-response.service';

import { CommentsUpdateComponent } from './comments-update.component';

describe('Comments Management Update Component', () => {
  let comp: CommentsUpdateComponent;
  let fixture: ComponentFixture<CommentsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let commentsService: CommentsService;
  let studentResponseService: StudentResponseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [CommentsUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(CommentsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CommentsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    commentsService = TestBed.inject(CommentsService);
    studentResponseService = TestBed.inject(StudentResponseService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call StudentResponse query and add missing value', () => {
      const comments: IComments = { id: 456 };
      const studentResponse: IStudentResponse = { id: 87940 };
      comments.studentResponse = studentResponse;

      const studentResponseCollection: IStudentResponse[] = [{ id: 94867 }];
      jest.spyOn(studentResponseService, 'query').mockReturnValue(of(new HttpResponse({ body: studentResponseCollection })));
      const additionalStudentResponses = [studentResponse];
      const expectedCollection: IStudentResponse[] = [...additionalStudentResponses, ...studentResponseCollection];
      jest.spyOn(studentResponseService, 'addStudentResponseToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ comments });
      comp.ngOnInit();

      expect(studentResponseService.query).toHaveBeenCalled();
      expect(studentResponseService.addStudentResponseToCollectionIfMissing).toHaveBeenCalledWith(
        studentResponseCollection,
        ...additionalStudentResponses
      );
      expect(comp.studentResponsesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const comments: IComments = { id: 456 };
      const studentResponse: IStudentResponse = { id: 45308 };
      comments.studentResponse = studentResponse;

      activatedRoute.data = of({ comments });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(comments));
      expect(comp.studentResponsesSharedCollection).toContain(studentResponse);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Comments>>();
      const comments = { id: 123 };
      jest.spyOn(commentsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ comments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: comments }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(commentsService.update).toHaveBeenCalledWith(comments);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Comments>>();
      const comments = new Comments();
      jest.spyOn(commentsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ comments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: comments }));
      saveSubject.complete();

      // THEN
      expect(commentsService.create).toHaveBeenCalledWith(comments);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Comments>>();
      const comments = { id: 123 };
      jest.spyOn(commentsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ comments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(commentsService.update).toHaveBeenCalledWith(comments);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackStudentResponseById', () => {
      it('Should return tracked StudentResponse primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackStudentResponseById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});