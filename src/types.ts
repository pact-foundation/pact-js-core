import needle from 'needle';
import { LogLevel } from './logger/types';

export interface MessageOptions {
  content?: string;
  dir?: string;
  consumer?: string;
  provider?: string;
  pactFileWriteMode?: 'overwrite' | 'update' | 'merge';
  spec?: number;
}

export interface PublisherOptions {
  pactFilesOrDirs: string[];
  pactBroker: string;
  consumerVersion: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  pactBrokerToken?: string;
  tags?: string[];
  verbose?: boolean;
  timeout?: number;
  buildUrl?: string;
  branch?: string;
  autoDetectVersionProperties?: boolean;
}

export interface ServiceOptions {
  port?: number;
  ssl?: boolean;
  cors?: boolean;
  host?: string;
  sslcert?: string;
  sslkey?: string;
  log?: string;
  logLevel?: LogLevel;
  timeout?: number;
}

export interface HTTPConfig extends Omit<needle.NeedleOptions, 'headers'> {
  headers: {
    'X-Pact-Mock-Service': string;
    'Content-Type': string;
  };
}
