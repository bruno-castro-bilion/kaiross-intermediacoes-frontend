import axios from "axios";
import type {
  UploadRequestPayload,
  UploadResponse,
  FileUploadResult,
} from "./types";

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<FileUploadResult> {
  try {
    const uploadRequestPayload: UploadRequestPayload = {
      fileName: file.name,
      contentType: file.type,
    };

    const uploadResponse = await axios.post<UploadResponse>(
      "/api/files/upload",
      uploadRequestPayload,
    );

    const { url, fileKey } = uploadResponse.data;

    if (!url) {
      throw new Error("URL de upload não retornada pelo servidor");
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          console.error(
            "❌ Erro no upload de imagem:",
            xhr.status,
            xhr.statusText,
            xhr.responseText,
          );
          reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Erro de rede ao fazer upload"));
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    const fileUrl = url.split("?")[0];
    return { success: true, fileUrl, fileKey };
  } catch (error) {
    console.error("❌ Erro ao fazer upload do arquivo:", error);
    console.error(
      "❌ Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );

    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }

    let errorMessage = "Erro ao fazer upload do arquivo";

    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error("❌ Axios error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("❌ Final error message:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function uploadMultipleFiles(
  files: File[],
  onFileProgress?: (fileIndex: number, progress: number) => void,
): Promise<FileUploadResult[]> {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, (progress) => {
      if (onFileProgress) {
        onFileProgress(index, progress);
      }
    }),
  );

  return Promise.all(uploadPromises);
}
