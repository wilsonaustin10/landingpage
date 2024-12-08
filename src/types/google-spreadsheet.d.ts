declare module 'google-spreadsheet' {
  export class GoogleSpreadsheet {
    constructor(
      sheetId: string,
      auth:
        | { apiKey?: string }
        | { client_email: string; private_key: string }
        | { auth: { client_email: string; private_key: string } }
    );
    useServiceAccountAuth(credentials: { client_email: string; private_key: string }): Promise<void>;
    loadInfo(): Promise<void>;
    title: string;
    sheetsByIndex: any[];
  }
}
