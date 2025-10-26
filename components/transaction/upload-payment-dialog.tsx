"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface UploadPaymentDialogProps {
    children: React.ReactNode;
}

interface FileWithPreview extends File {
    preview: string;
}

export function UploadPaymentDialog({ children }: UploadPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL || 'http://localhost:8080/api/v1';
    const MAX_SIZE = 300 * 1024 * 1024; // 300MB in bytes

    // Handle file drop
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Handle rejected files
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((file) => {
                file.errors.forEach((err: any) => {
                    if (err.code === "file-too-large") {
                        toast.error(`File ${file.file.name} is too large. Max size is 300MB.`);
                    } else if (err.code === "file-invalid-type") {
                        toast.error(`File ${file.file.name} is not an image.`);
                    } else {
                        toast.error(`Error with ${file.file.name}: ${err.message}`);
                    }
                });
            });
        }

        // Add preview URL to accepted files
        const filesWithPreview = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );

        setFiles((prevFiles) => [...prevFiles, ...filesWithPreview]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        },
        maxSize: MAX_SIZE,
        multiple: true,
    });

    // Remove file
    const removeFile = (index: number) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    // Upload files
    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("Please select at least one image");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();

            // Append all files to FormData
            files.forEach((file) => {
                formData.append("images", file);
            });

            const response = await axios.post(
                `${API_BASE_URL}/transactions/auto`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Request-ID": crypto.randomUUID(),
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success("Images uploaded successfully!");

                // Clean up
                files.forEach((file) => URL.revokeObjectURL(file.preview));
                setFiles([]);
                setOpen(false);

                // Refresh the transactions list
                window.location.reload();
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : "An unexpected error occurred";

            toast.error(`Upload failed: ${errorMessage}`);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Upload Payment Images</DialogTitle>
                    <DialogDescription>
                        Upload multiple payment receipt images (Max 300MB total)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                ? "border-primary bg-primary/5"
                                : isDragReject
                                    ? "border-destructive bg-destructive/5"
                                    : "border-muted-foreground/25 hover:border-primary/50"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            {isDragActive ? (
                                <p className="text-sm font-medium">Drop the images here...</p>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">
                                        Drag & drop images here, or click to select
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, JPEG, GIF, WEBP (Max 300MB per upload)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* File Preview */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Selected Images ({files.length})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total: {totalSizeMB} MB
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative group rounded-lg overflow-hidden border"
                                    >
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            className="w-full h-32 object-cover"
                                            onLoad={() => URL.revokeObjectURL(file.preview)}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => removeFile(index)}
                                                disabled={uploading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                                            <p className="text-xs text-white truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-300">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            files.forEach((file) => URL.revokeObjectURL(file.preview));
                            setFiles([]);
                            setOpen(false);
                        }}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload {files.length} {files.length === 1 ? "Image" : "Images"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
