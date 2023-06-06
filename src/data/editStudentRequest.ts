export interface EditStudentRequestBody {
  nombreAlumno: string;
  pApellido: string;
  sApellido: string;
  fechaNac: string;
  curp: string;
  telefono: string;
  direccion: string;
  colonia: string;
  localidad: string;
  grado: number;
  grupo: string;
};

export function instanceOfEditStudentRequestBody(object: any): object is EditStudentRequestBody {
  return 'nombreAlumno' in object &&
  'pApellido' in object &&
  'sApellido' in object &&
  'fechaNac' in object &&
  'curp' in object &&
  'telefono' in object &&
  'direccion' in object &&
  'colonia' in object &&
  'localidad' in object &&
  'grado' in object &&
  'grupo' in object
}
