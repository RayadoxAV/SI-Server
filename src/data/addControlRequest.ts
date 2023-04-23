export interface AddControlRequestBody {
  idAlumno: number;
  controlType: number;
};

export function instanceOfAddControlRequestBody(object: any): object is AddControlRequestBody {
  return 'idAlumno' in object &&
  'controlType' in object;
}
