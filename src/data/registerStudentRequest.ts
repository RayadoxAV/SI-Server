
export interface RegisterStudentRequestBody {
  nombreAlumno: string,
  pApellido: string,
  sApellido: string,
  fechaNac: string,
  curp: string,
  telefono: string,
  direccion: string,
  colonia: string,
  localidad: string,
  grado: number,
  grupo: string,
  promedio: number,
  cantidadMiembros: string,
  miembrosFamilia: [Object],
  tipoFamilia: string,
  totalMiembrosTrabajan: number,
  alimentacion: number,
  medicamentos: number,
  transporte: number,
  gasolina: number,
  educacion: number,
  abono: number,
  celulares: number,
  servicioMedico: number,
  guarderia: number,
  agua: number,
  gasCilindro: number,
  energiaElectrica: number,
  telefonoInternet: number,
  cable: number,
  otros: number,
  totalEgresos: number,
  estadoVivienda: string,
  materialVivienda: string
};

export function instanceOfRegisterStudentRequestBody(object: any): object is RegisterStudentRequestBody {
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
  'grupo' in object &&
  'promedio' in object &&
  'cantidadMiembros' in object &&
  'miembrosFamilia' in object &&
  'tipoFamilia' in object &&
  'totalMiembrosTrabajan' in object &&
  'alimentacion' in object &&
  'medicamentos' in object &&
  'transporte' in object &&
  'gasolina' in object &&
  'educacion' in object &&
  'abono' in object &&
  'celulares' in object &&
  'servicioMedico' in object &&
  'guarderia' in object &&
  'agua' in object &&
  'gasCilindro' in object &&
  'energiaElectrica' in object &&
  'telefonoInternet' in object &&
  'cable' in object &&
  'otros' in object &&
  'totalEgresos' in object &&
  'estadoVivienda' in object &&
  'materialVivienda' in object;
}
