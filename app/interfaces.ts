export interface EncryptionKeyConfig {
  ENCRYPTION_KEY: string;
}

export interface PwPusherApiConfig {
  PWPUSHER_API_URL: string;
}

export interface AppConfigDbConfig {
  APPCONFIGDB: string;
}

export type AppConfigItem =
  | EncryptionKeyConfig
  | PwPusherApiConfig
  | AppConfigDbConfig;

export type AppConfigArray = AppConfigItem[];

export interface GetAppConfigRow {
  ConfigJson: string;
}
