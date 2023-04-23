export interface AddInformationRequestBody {
  type: number;
  information: string;
};

export function instanceOfAddInformationRequestBody(object: any): object is AddInformationRequestBody {
  return 'type' in object &&
  'information' in object;
}
