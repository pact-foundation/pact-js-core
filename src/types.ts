import needle from 'needle';

export interface HTTPConfig extends Omit<needle.NeedleOptions, 'headers'> {
  headers: {
    'X-Pact-Mock-Service': string;
    'Content-Type': string;
  };
}
