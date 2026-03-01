"use client";

import { useCallback, useRef, useState } from "react";

import { hasSupabaseAuth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/client";

export interface UploadFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  errors: Array<{ message: string }>;
}

export interface UseSupabaseUploadProps {
  bucketName: string;
  path?: string;
  allowedMimeTypes?: readonly string[];
  maxFiles?: number;
  maxFileSize?: number;
}

export interface UseSupabaseUploadReturn {
  files: UploadFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  loading: boolean;
  successes: string[];
  errors: Array<{ name: string; message: string }>;
  maxFileSize: number;
  maxFiles: number;
  isSuccess: boolean;
  isDragActive: boolean;
  isDragReject: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  getRootProps: () => any;
  getInputProps: () => any;
  onUpload: () => Promise<void>;
}

export const useSupabaseUpload = ({
  bucketName,
  path = "",
  allowedMimeTypes = [],
  maxFiles = 1,
  maxFileSize = 1000 * 1000 * 10, // 10MB
}: UseSupabaseUploadProps): UseSupabaseUploadReturn => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    Array<{ name: string; message: string }>
  >([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = hasSupabaseAuth ? createClient() : null;

  const validateFile = useCallback(
    (file: File): Array<{ message: string }> => {
      const errors: Array<{ message: string }> = [];

      if (file.size > maxFileSize) {
        errors.push({ message: `File is larger than ${maxFileSize} bytes` });
      }

      if (allowedMimeTypes.length > 0) {
        const isAllowed = allowedMimeTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });

        if (!isAllowed) {
          errors.push({ message: `File type ${file.type} is not allowed` });
        }
      }

      return errors;
    },
    [maxFileSize, allowedMimeTypes]
  );

  const createFileObject = useCallback(
    (file: File): UploadFile => {
      const errors = validateFile(file);
      return {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        errors,
      };
    },
    [validateFile]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const newFileObjects = fileArray.map(createFileObject);

      setFiles((prev) => {
        const updated = [...prev, ...newFileObjects];
        return updated.slice(0, maxFiles);
      });

      setErrors([]);
      setSuccesses([]);
    },
    [createFileObject, maxFiles]
  );

  const onUpload = useCallback(async () => {
    if (files.length === 0) return;
    if (!supabase) {
      setErrors([
        {
          name: bucketName,
          message: "Supabase Storage is not configured for this environment.",
        },
      ]);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccesses([]);

    const uploadPromises = files.map(async (fileObj) => {
      try {
        const filePath = path ? `${path}/${fileObj.name}` : fileObj.name;

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileObj.file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          throw error;
        }

        // Obtener la URL pública del archivo subido
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const publicUrl = data.publicUrl;
        setSuccesses((prev) => [...prev, publicUrl]);
        return { success: true, name: fileObj.name, url: publicUrl };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setErrors((prev) => [
          ...prev,
          { name: fileObj.name, message: errorMessage },
        ]);
        return { success: false, name: fileObj.name, error: errorMessage };
      }
    });

    await Promise.all(uploadPromises);
    setLoading(false);
  }, [files, bucketName, path, supabase]);

  const getRootProps = useCallback(
    () => ({
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        setIsDragReject(false);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        setIsDragReject(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
          handleFiles(droppedFiles);
        }
      },
      onClick: () => {
        inputRef.current?.click();
      },
    }),
    [handleFiles]
  );

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file",
      multiple: maxFiles > 1,
      accept: allowedMimeTypes.join(","),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          handleFiles(e.target.files);
        }
      },
      style: { display: "none" },
    }),
    [allowedMimeTypes, maxFiles, handleFiles]
  );

  const isSuccess =
    files.length > 0 &&
    successes.length === files.length &&
    errors.length === 0;

  return {
    files,
    setFiles,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
    isDragActive,
    isDragReject,
    inputRef,
    getRootProps,
    getInputProps,
    onUpload,
  };
};
