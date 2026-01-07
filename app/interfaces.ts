export interface EncryptionKeyConfig {
  ENCRYPTION_KEY: string;
}

export interface PwPusherApiConfig {
  PWPUSHER_API_URL: string;
}

export interface ServerInventoryConfig {
  SERVERINVENTORY: string;
}

export interface IGlobalSettings {
  ENCRYPTION_KEY: string;
  PWPUSHER_API_URL: string;
  SERVERINVENTORY: string;
}

// export type AppConfigItem =
//   | EncryptionKeyConfig
//   | PwPusherApiConfig
//   | ServerInventoryConfig;

// export type AppConfigArray = AppConfigItem[];

export interface GetAppConfigRow {
  ConfigJson: string;
}
