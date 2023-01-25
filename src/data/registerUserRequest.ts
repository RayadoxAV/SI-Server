export interface RegisterUserRequestBody {
  nombreUsuario: string,
  password: string,
  nombres: string,
  pApellido: string,
  sApellido: string,
  role: number
};

export function instanceOfRegisterUserRequestBody(object: any): object is RegisterUserRequestBody {
  return 'nombreUsuario' in object &&
  'password' in object &&
  'nombres' in object &&
  'pApellido' in object &&
  'sApellido' in object &&
  'role' in object;
}
