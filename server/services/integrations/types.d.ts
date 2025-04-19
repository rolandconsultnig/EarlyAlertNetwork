// Type definitions for modules without declaration files

declare module 'fb' {
  interface FacebookOptions {
    appId?: string;
    appSecret?: string;
    accessToken?: string;
    scope?: string;
    version?: string;
  }
  
  interface FacebookResponse {
    id?: string;
    error?: {
      message: string;
      code: number;
      type: string;
    };
    [key: string]: any;
  }
  
  class FB {
    static options(options: FacebookOptions): void;
    static api(path: string, method: string, params: any, callback: (response: FacebookResponse) => void): void;
    static getAccessToken(): string;
    static setAccessToken(token: string): void;
    static getAppId(): string;
    static setAppId(id: string): void;
    static getAppSecret(): string;
    static setAppSecret(secret: string): void;
  }
  
  export = FB;
}