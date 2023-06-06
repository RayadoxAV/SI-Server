export interface AddSocioeconomicRequestBody {
  cantidadMiembros: string;
  miembrosFamilia: [any];
  tipoFamilia: string;
  totalMiembrosTrabajan: number;
  alimentacion: number;
  medicamentos: number;
  transporte: number;
  gasolina: number;
  educacion: number;
  abono: number;
  celulares: number;
  servicioMedico: number;
  guarderia: number;
  agua: number;
  gasCilindro: number;
  energiaElectrica: number;
  telefonoInternet: number;
  cable: number;
  otros: number;
  totalEgresos: number;
  estadoVivienda: string;
  materialVivienda: string;
};

export function instanceOfAddSocioeconomicStudyRequestBody(object: any): object is AddSocioeconomicRequestBody {
  return 'cantidadMiembros' in object &&
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
