export interface EditUserRequestBody {
  nombreUsuario: string,
  nombres: string,
  pApellido: string,
  sApellido: string,
  role: number,
  status: number
};

export function instanceOfEditUserRequestBody(object: any): object is EditUserRequestBody {
  return 'nombreUsuario' in object &&
  'nombres' in object &&
  'pApellido' in object &&
  'sApellido' in object &&
  'role' in object &&
  'status' in object;
}
