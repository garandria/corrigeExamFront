import { IStudentResponse } from 'app/entities/student-response/student-response.model';

export interface ITextComment {
  id?: number;
  text?: string | null;
  description?: string | null;
  zonegeneratedid?: string | null;
  questionId?: number;
  studentResponses?: IStudentResponse[];
}

export class TextComment implements ITextComment {
  constructor(
    public id?: number,
    public text?: string | null,
    public description?: string | null,
    public zonegeneratedid?: string | null,
    public questionId?: number,
    public studentResponses?: IStudentResponse[]
  ) {}
}

export function getTextCommentIdentifier(textComment: ITextComment): number | undefined {
  return textComment.id;
}
