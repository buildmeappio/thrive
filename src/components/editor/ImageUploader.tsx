"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Upload, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadTemplateImageAction } from "@/domains/contract-templates/actions/uploadTemplateImage";

type Props = {
    open: boolean;
    onClose: () => void;
    onInsert: (url: string) => void;
};

export default function ImageUploader({ open, onClose, onInsert }: Props) {
    const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
    const [imageUrl, setImageUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setImageUrl("");
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsUploading(false);
        setActiveTab("upload");
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [onClose, resetState]);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Invalid image type. Allowed: JPEG, PNG, GIF, WebP, SVG");
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size exceeds 5MB limit");
                return;
            }

            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        },
        [],
    );

    const handleUpload = useCallback(async () => {
        if (!selectedFile || !previewUrl) {
            toast.error("Please select an image first");
            return;
        }

        setIsUploading(true);

        try {
            // Extract base64 data from data URL
            const base64Data = previewUrl;

            const result = await uploadTemplateImageAction({
                fileName: selectedFile.name,
                base64Data,
                contentType: selectedFile.type,
            });

            if (result.success && result.data) {
                toast.success("Image uploaded successfully");
                onInsert(result.data.url);
                handleClose();
            } else {
                toast.error(
                    "error" in result ? result.error : "Failed to upload image",
                );
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, previewUrl, onInsert, handleClose]);

    const handleInsertUrl = useCallback(() => {
        if (!imageUrl.trim()) {
            toast.error("Please enter an image URL");
            return;
        }

        // Validate URL format
        try {
            new URL(imageUrl);
        } catch {
            toast.error("Please enter a valid URL");
            return;
        }

        onInsert(imageUrl);
        handleClose();
    }, [imageUrl, onInsert, handleClose]);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const file = e.dataTransfer.files?.[0];
            if (!file) return;

            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Invalid image type. Allowed: JPEG, PNG, GIF, WebP, SVG");
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size exceeds 5MB limit");
                return;
            }

            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        },
        [],
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Insert Image
                    </DialogTitle>
                    <DialogDescription>
                        Upload an image or paste a URL to insert into your template.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "upload" | "url")}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            URL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4 mt-4">
                        {/* Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${previewUrl
                                ? "border-green-300 bg-green-50"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            {previewUrl ? (
                                <div className="space-y-2">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-32 mx-auto rounded"
                                    />
                                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                                    <p className="text-xs text-gray-500">
                                        Click or drag to replace
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        JPEG, PNG, GIF, WebP, SVG (max 5MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleInsertUrl()}
                            />
                            <p className="text-xs text-gray-500">
                                Paste the URL of an image from the web
                            </p>
                        </div>

                        {/* URL Preview */}
                        {imageUrl && (
                            <div className="border rounded-lg p-2">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-h-32 mx-auto rounded"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {activeTab === "upload" ? (
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload & Insert
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleInsertUrl} disabled={!imageUrl.trim()}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Insert
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

