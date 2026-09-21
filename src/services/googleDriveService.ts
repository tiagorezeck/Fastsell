"use client";

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export class GoogleDriveService {
  private tokenClient: any;
  private accessToken: string | null = null;

  async init(clientId: string) {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error) {
              reject(response);
            }
            this.accessToken = response.access_token;
            resolve();
          },
        });
      };
      document.head.appendChild(script);
    });
  }

  async authenticate() {
    return new Promise<string>((resolve) => {
      this.tokenClient.callback = (response: any) => {
        this.accessToken = response.access_token;
        resolve(response.access_token);
      };
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  async findOrCreateFile(fileName: string) {
    if (!this.accessToken) await this.authenticate();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Criar novo arquivo
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        mimeType: 'application/json',
      }),
    });
    const newFile = await createResponse.json();
    return newFile.id;
  }

  async saveFile(fileId: string, content: any) {
    if (!this.accessToken) await this.authenticate();

    const metadata = {
      name: 'fastsell_db.json',
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

    await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: form,
      }
    );
  }

  async loadFile(fileId: string) {
    if (!this.accessToken) await this.authenticate();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    return await response.json();
  }
}

export const driveService = new GoogleDriveService();