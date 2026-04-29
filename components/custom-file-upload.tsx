"use client";

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import {
  Upload,
  X,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileImage,
  Check,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NextImage from "next/image";

interface UploadedFile {
  id: string;
  file?: File;
  fileName: string;
  fileType: "image" | "video" | "pdf" | "other";
  preview: string;
  loadProgress: number;
  uploadProgress: number;
  isLoading: boolean;
  isUploading: boolean;
  isComplete: boolean;
  fileUrl?: string;
}

interface ImageUploadProps {
  type?: "default" | "avatar";
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onUpload?: (
    results: { file: File; fileUrl?: string }[],
    croppedBlob?: Blob,
  ) => Promise<void> | void;
  className?: string;
  accept?: Record<string, string[]>;
  onClear?: () => void;
  onRemove?: (fileId: string) => void;
  initialUrls?: string[];
}

interface CropState {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

function getFileType(file: File): "image" | "video" | "pdf" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "other";
}

function getTypeFromUrl(url: string): "image" | "video" | "pdf" | "other" {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext))
    return "image";
  if (["mp4", "webm", "mov", "avi", "mkv", "flv"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "other";
}

function getNameFromUrl(url: string): string {
  return decodeURIComponent(url.split("?")[0].split("/").pop() ?? "arquivo");
}

export function ImageUpload({
  type = "default",
  multiple = false,
  maxFiles = 10,
  maxSize = 5,
  onUpload,
  className,
  onClear,
  onRemove,
  initialUrls,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(() => {
    if (!initialUrls?.length) return [];
    return initialUrls.map((url, i) => ({
      id: `existing-${i}-${url}`,
      file: undefined,
      fileName: getNameFromUrl(url),
      fileType: getTypeFromUrl(url),
      preview: url,
      loadProgress: 100,
      uploadProgress: 100,
      isLoading: false,
      isUploading: false,
      isComplete: true,
      fileUrl: url,
    }));
  });
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [cropFile, setCropFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [cropState, setCropState] = useState<CropState>({
    scale: 1,
    rotation: 0,
    position: { x: 0, y: 0 },
  });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCircleRef = useRef<HTMLDivElement>(null);

  const isAvatarMode = type === "avatar";
  const allowMultiple = multiple && !isAvatarMode;

  const loadFileWithProgress = useCallback(
    async (file: File): Promise<{ preview: string; id: string }> => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const fileType = getFileType(file);

      const newFile: UploadedFile = {
        id,
        file,
        fileName: file.name,
        fileType: getFileType(file),
        preview: "",
        loadProgress: 0,
        uploadProgress: 0,
        isLoading: true,
        isUploading: false,
        isComplete: false,
      };

      setFiles((prev) => [...prev, newFile].slice(0, maxFiles));

      if (fileType === "video" || fileType === "pdf") {
        const preview = URL.createObjectURL(file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, preview, loadProgress: 100, isLoading: false }
              : f,
          ),
        );
        return { preview, id };
      }

      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, loadProgress: progress } : f,
              ),
            );
          }
        };

        reader.onload = () => {
          const preview = reader.result as string;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? { ...f, preview, loadProgress: 100, isLoading: false }
                : f,
            ),
          );
          resolve({ preview, id });
        };

        reader.onerror = () => {
          setFiles((prev) => prev.filter((f) => f.id !== id));
          resolve({ preview: "", id });
        };

        reader.readAsDataURL(file);
      });
    },
    [maxFiles],
  );

  const onDropRejected = useCallback(
    async (fileRejections: FileRejection[]) => {
      const { showToast } = await import("@/components/custom-toast");

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errors = rejection.errors;

        if (errors.some((e) => e.code === "file-invalid-type")) {
          const acceptedFormats = Object.values(accept)
            .flat()
            .map((e) => e.replace(".", "").toUpperCase())
            .join(", ");
          showToast({
            type: "error",
            title: "Arquivo inválido",
            description: `Formato não suportado. Formatos aceitos: ${acceptedFormats}.`,
          });
        } else if (errors.some((e) => e.code === "file-too-large")) {
          showToast({
            type: "error",
            title: "Arquivo muito grande",
            description: `O arquivo deve ter no máximo ${maxSize}MB.`,
          });
        } else {
          showToast({
            type: "error",
            title: "Erro no upload",
            description: "Não foi possível carregar o arquivo.",
          });
        }
      }
    },
    [maxSize, accept],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isAvatarMode && acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(selectedFile);

        setCropFile({ file: selectedFile, preview: objectUrl });
        setCropState({
          scale: 1,
          rotation: 0,
          position: { x: 0, y: 0 },
        });
        setShowCropDialog(true);
      } else {
        for (const file of acceptedFiles) {
          await loadFileWithProgress(file);
        }
      }
    },
    [isAvatarMode, loadFileWithProgress],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxSize: maxSize * 1024 * 1024,
    multiple: allowMultiple,
    maxFiles: allowMultiple ? maxFiles : 1,
  });

  const uploadFileSingle = useCallback(
    async (fileId: string) => {
      const uploadedFile = files.find((f) => f.id === fileId);
      if (!uploadedFile || !uploadedFile.file)
        return { success: false, fileUrl: undefined };

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isUploading: true, uploadProgress: 0 } : f,
        ),
      );

      try {
        const { uploadFile } = await import("@/app/api/files/mutations");

        const result = await uploadFile(uploadedFile.file, (progress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, uploadProgress: progress } : f,
            ),
          );
        });

        if (result.success) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    isUploading: false,
                    isComplete: true,
                    fileUrl: result.fileUrl,
                  }
                : f,
            ),
          );
          return { success: true, fileUrl: result.fileUrl };
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, isUploading: false, isComplete: false }
                : f,
            ),
          );
          console.error("Erro ao fazer upload:", result.error);
          return { success: false, fileUrl: undefined };
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, isUploading: false, isComplete: false }
              : f,
          ),
        );
        return { success: false, fileUrl: undefined };
      }
    },
    [files],
  );

  const uploadAllFiles = useCallback(async () => {
    const pendingFiles = files.filter((f) => !f.isComplete && !f.isUploading);

    const uploadResults = await Promise.all(
      pendingFiles.map((f) => uploadFileSingle(f.id)),
    );

    if (onUpload) {
      const results = pendingFiles
        .filter((f) => !!f.file)
        .map((f, i) => ({
          file: f.file as File,
          fileUrl: uploadResults[i]?.fileUrl,
        }));
      await onUpload(results);
    }

    return uploadResults;
  }, [files, onUpload, uploadFileSingle]);

  const handleCropConfirm = useCallback(async () => {
    if (!canvasRef.current || !cropFile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = cropFile.preview;
    });

    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.clearRect(0, 0, outputSize, outputSize);

    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const circleSize = cropCircleRef.current?.clientWidth || 256;
    const posRatio = outputSize / circleSize;

    const baseScale = Math.max(outputSize / img.width, outputSize / img.height);
    const scaledWidth = img.width * baseScale;
    const scaledHeight = img.height * baseScale;

    ctx.save();

    ctx.translate(
      outputSize / 2 + cropState.position.x * posRatio,
      outputSize / 2 + cropState.position.y * posRatio,
    );

    ctx.scale(cropState.scale, cropState.scale);
    ctx.rotate((cropState.rotation * Math.PI) / 180);

    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight,
    );
    ctx.restore();

    const mimeType =
      cropFile.file.type === "image/jpeg" || cropFile.file.type === "image/jpg"
        ? "image/jpeg"
        : "image/png";
    const ext = mimeType === "image/jpeg" ? ".jpg" : ".png";
    const baseName = cropFile.file.name.replace(/\.[^.]+$/, "");

    canvas.toBlob(
      async (blob) => {
        if (blob && cropFile) {
          const croppedPreview = URL.createObjectURL(blob);

          const newFile: UploadedFile = {
            id: `avatar-${Date.now()}`,
            file: cropFile.file,
            fileName: cropFile.file.name,
            fileType: getFileType(cropFile.file),
            preview: croppedPreview,
            loadProgress: 100,
            uploadProgress: 0,
            isLoading: false,
            isUploading: true,
            isComplete: false,
          };

          setFiles([newFile]);
          setShowCropDialog(false);
          setCropFile(null);

          try {
            const { uploadFile } = await import("@/app/api/files/mutations");

            const fileToUpload = new File(
              [blob],
              `${baseName}-${Date.now()}${ext}`,
              {
                type: mimeType,
              },
            );

            const result = await uploadFile(fileToUpload, (progress) => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === newFile.id ? { ...f, uploadProgress: progress } : f,
                ),
              );
            });

            if (result.success) {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === newFile.id
                    ? {
                        ...f,
                        isUploading: false,
                        isComplete: true,
                        fileUrl: result.fileUrl,
                      }
                    : f,
                ),
              );

              if (onUpload) {
                await onUpload(
                  [{ file: cropFile.file, fileUrl: result.fileUrl }],
                  blob,
                );
              }
            } else {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === newFile.id
                    ? { ...f, isUploading: false, isComplete: false }
                    : f,
                ),
              );
              console.error("Erro ao fazer upload do avatar:", result.error);
            }
          } catch (error) {
            console.error("Erro ao fazer upload do avatar:", error);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === newFile.id
                  ? { ...f, isUploading: false, isComplete: false }
                  : f,
              ),
            );
          }
        }
      },
      mimeType,
      0.9,
    );
  }, [cropState, cropFile, onUpload]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({
      x: e.clientX - cropState.position.x,
      y: e.clientY - cropState.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    setCropState((prev) => ({
      ...prev,
      position: {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      },
    }));
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDraggingImage(true);
    setDragStart({
      x: touch.clientX - cropState.position.x,
      y: touch.clientY - cropState.position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingImage) return;
    const touch = e.touches[0];
    setCropState((prev) => ({
      ...prev,
      position: {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      },
    }));
  };

  const handleTouchEnd = () => {
    setIsDraggingImage(false);
  };

  const removeFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      if (file.file) URL.revokeObjectURL(file.preview);
      onRemove?.(file.fileName);
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const clearAllFiles = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    onClear?.();
  };

  const loadingCount = files.filter((f) => f.isLoading).length;
  const pendingCount = files.filter(
    (f) => !f.isComplete && !f.isUploading && !f.isLoading,
  ).length;
  const uploadingCount = files.filter((f) => f.isUploading).length;
  const completedCount = files.filter((f) => f.isComplete).length;

  const acceptedLabel = Object.values(accept)
    .flat()
    .map((e) => e.replace(".", "").toUpperCase())
    .join(", ");

  return (
    <>
      <div className={cn("w-full", className)}>
        {isAvatarMode && (
          <div className="mx-auto w-full max-w-45 sm:max-w-50">
            {files.length === 0 ? (
              <div
                {...getRootProps()}
                className={cn(
                  "relative aspect-square cursor-pointer rounded-full border-2 border-dashed transition-colors",
                  "hover:border-primary hover:bg-muted/50",
                  isDragActive
                    ? "border-primary bg-muted/50"
                    : "border-muted-foreground/25",
                )}
              >
                <input {...getInputProps()} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full sm:h-16 sm:w-16">
                    <ImageIcon className="text-muted-foreground h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground text-xs font-medium sm:text-sm">
                      {isDragActive ? "Solte aqui" : "Upload avatar"}
                    </p>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">
                      Até {maxSize}MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="border-border relative aspect-square overflow-hidden rounded-full border-2">
                  <NextImage
                    src={files[0].preview || "/placeholder.svg"}
                    alt="Avatar"
                    unoptimized
                    fill
                    className="object-cover"
                  />

                  {(files[0].isLoading || files[0].isUploading) && (
                    <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">
                          {files[0].isLoading ? "Carregando..." : "Enviando..."}
                        </p>
                        <div className="text-foreground text-lg font-bold sm:text-xl">
                          {files[0].isLoading
                            ? files[0].loadProgress
                            : files[0].uploadProgress}
                          %
                        </div>
                        <Progress
                          value={
                            files[0].isLoading
                              ? files[0].loadProgress
                              : files[0].uploadProgress
                          }
                          className="mt-2 h-1.5 w-20 sm:w-24"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {files[0].isComplete && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-green-600 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isAvatarMode && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 border-dashed transition-colors",
                "p-6 sm:p-8 lg:p-10",
                "hover:border-primary hover:bg-muted/50",
                isDragActive
                  ? "border-primary bg-muted/50"
                  : "border-muted-foreground/25",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14">
                  <Upload className="text-muted-foreground h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-medium sm:text-base">
                    {isDragActive
                      ? "Solte os arquivos aqui"
                      : allowMultiple
                        ? "Arraste ou clique para selecionar arquivos"
                        : "Arraste ou clique para selecionar um arquivo"}
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {acceptedLabel} até {maxSize}MB
                    {allowMultiple && ` (máx. ${maxFiles} arquivos)`}
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">
                      {files.length}
                    </span>{" "}
                    arquivo{files.length !== 1 && "s"}
                    {loadingCount > 0 && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        ({loadingCount} carregando)
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        ({completedCount} enviado{completedCount !== 1 && "s"})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {pendingCount > 0 && (
                      <Button
                        size="sm"
                        onClick={uploadAllFiles}
                        disabled={uploadingCount > 0 || loadingCount > 0}
                        className="text-xs sm:text-sm"
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {uploadingCount > 0
                          ? "Enviando..."
                          : loadingCount > 0
                            ? "Aguarde..."
                            : `Enviar ${pendingCount > 1 ? "todos" : ""}`}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFiles}
                      className="bg-transparent text-xs sm:text-sm"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>

                <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {files.map((uploadFile) => (
                    <div
                      key={uploadFile.id}
                      className="group bg-card relative overflow-hidden rounded-lg border"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 z-10 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>

                      <div className="bg-muted relative aspect-video">
                        {uploadFile.preview &&
                        uploadFile.fileType === "image" ? (
                          <NextImage
                            src={uploadFile.preview}
                            alt={uploadFile.fileName}
                            unoptimized
                            fill
                            className="object-cover"
                          />
                        ) : uploadFile.preview &&
                          uploadFile.fileType === "video" ? (
                          <video
                            src={uploadFile.preview}
                            className="absolute inset-0 h-full w-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="auto"
                          />
                        ) : uploadFile.preview &&
                          uploadFile.fileType === "pdf" ? (
                          <iframe
                            src={uploadFile.preview}
                            title={uploadFile.fileName}
                            className="pointer-events-none absolute inset-0 h-full w-full"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileImage className="text-muted-foreground/50 h-8 w-8" />
                          </div>
                        )}

                        {uploadFile.isLoading && (
                          <div className="bg-background/90 absolute inset-0 flex items-center justify-center">
                            <div className="w-full px-3 text-center">
                              <p className="text-muted-foreground mb-1 text-[10px]">
                                Carregando...
                              </p>
                              <div className="text-foreground text-sm font-bold">
                                {uploadFile.loadProgress}%
                              </div>
                              <Progress
                                value={uploadFile.loadProgress}
                                className="mt-1.5 h-1.5"
                              />
                            </div>
                          </div>
                        )}

                        {uploadFile.isUploading && (
                          <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                            <div className="w-full px-3 text-center">
                              <p className="text-muted-foreground mb-1 text-[10px]">
                                Enviando...
                              </p>
                              <div className="text-foreground text-sm font-bold">
                                {uploadFile.uploadProgress}%
                              </div>
                              <Progress
                                value={uploadFile.uploadProgress}
                                className="mt-1.5 h-1.5"
                              />
                            </div>
                          </div>
                        )}

                        {uploadFile.isComplete && (
                          <div className="absolute top-1 left-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <p
                          className="text-muted-foreground truncate text-xs"
                          title={uploadFile.fileName}
                        >
                          {uploadFile.fileName}
                        </p>
                        {uploadFile.file && (
                          <p className="text-muted-foreground/70 text-[10px]">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Ajustar Avatar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              ref={cropCircleRef}
              className="border-muted-foreground/50 bg-muted relative mx-auto h-48 w-48 cursor-move touch-none overflow-hidden rounded-full border-2 border-dashed sm:h-64 sm:w-64"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {cropFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cropFile.preview}
                  alt="Crop preview"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
                  style={{
                    transform: `translate(${cropState.position.x}px, ${cropState.position.y}px) scale(${cropState.scale}) rotate(${cropState.rotation}deg)`,
                    transformOrigin: "center",
                  }}
                />
              )}
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Arraste para reposicionar
            </p>

            <div className="space-y-4 px-2 sm:px-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <ZoomOut className="text-muted-foreground h-4 w-4 shrink-0" />
                <Slider
                  value={[cropState.scale]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) =>
                    setCropState((prev) => ({ ...prev, scale: value }))
                  }
                  className="flex-1"
                />
                <ZoomIn className="text-muted-foreground h-4 w-4 shrink-0" />
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <RotateCw className="text-muted-foreground h-4 w-4 shrink-0" />
                <Slider
                  value={[cropState.rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([value]) =>
                    setCropState((prev) => ({ ...prev, rotation: value }))
                  }
                  className="flex-1"
                />
                <span className="text-muted-foreground w-8 shrink-0 text-right text-xs sm:w-10">
                  {cropState.rotation}°
                </span>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropDialog(false);
                setCropFile(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button onClick={handleCropConfirm} className="w-full sm:w-auto">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
