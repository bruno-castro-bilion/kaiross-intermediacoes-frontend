export interface UploadRequestPayload { fileName: string; contentType: string; }
export interface UploadResponse { url: string; fileKey: string; }
export interface FileUploadResult { success: boolean; fileUrl?: string; fileKey?: string; error?: string; }
