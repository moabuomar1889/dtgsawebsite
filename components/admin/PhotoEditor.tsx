"use client";

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { FilerobotImageEditorConfig } from 'react-filerobot-image-editor';

interface PhotoEditorProps {
    imageUrl: string;
    originalUrl?: string;
    onSave: (editedBlob: Blob, originalUrl: string) => Promise<void>;
    onCancel: () => void;
    maxExportDimension?: number;
    exportQuality?: number;
}

type SavedImageData = Parameters<NonNullable<FilerobotImageEditorConfig['onSave']>>[0];

const EDITOR_TABS = [
    'Adjust',
    'Finetune',
    'Filters',
    'Annotate',
    'Watermark',
    'Resize',
] as FilerobotImageEditorConfig['tabsIds'];

const FILEROBOT_REACT_19_WARNINGS = [
    'non-boolean attribute `active`',
    'React does not recognize the `noMargin` prop',
];

const FILEROBOT_REACT_19_DOM_PROPS = [
    'active',
    'noMargin',
    'showBackButton',
    'isPhoneScreen',
    'hasChildren',
    'isAccordion',
    'showTabsDrawer',
    'reverseDirection',
    'isListItem',
    'noWrap',
    'iconShadow',
    'isWarning',
    'isError',
    'warning',
    'maxWidth',
    'fullWidth',
    'hideEllipsis',
    'isValueExists',
    'watermarkTool',
];
const FILEROBOT_CONSOLE_FILTER_VERSION = 2;

const isKnownFilerobotWarning = (message: string) => {
    const includesFilerobotDomProp = FILEROBOT_REACT_19_DOM_PROPS.some((propName) => (
        message.includes(propName) || message.includes(`\`${propName}\``)
    ));

    return FILEROBOT_REACT_19_WARNINGS.some((warning) => message.includes(warning))
        || (message.includes('non-boolean attribute') && includesFilerobotDomProp)
        || (
            message.includes('Received `')
            && message.includes('for a non-boolean attribute')
            && message.includes('PhotoEditor')
        )
        || (message.includes('styled-components: it looks like an unknown prop') && includesFilerobotDomProp)
        || (
            message.includes('React does not recognize')
            && message.includes('DOM element')
            && includesFilerobotDomProp
        )
        || (
            message.includes('React does not recognize')
            && message.includes('DOM element')
            && message.includes('PhotoEditor')
        );
};

if (typeof window !== 'undefined') {
    const browserWindow = window as typeof window & {
        __dtgsaFilerobotConsoleFilter?: boolean;
        __dtgsaFilerobotConsoleFilterVersion?: number;
        __dtgsaOriginalConsoleError?: typeof console.error;
    };

    if (
        !browserWindow.__dtgsaFilerobotConsoleFilter
        || browserWindow.__dtgsaFilerobotConsoleFilterVersion !== FILEROBOT_CONSOLE_FILTER_VERSION
    ) {
        browserWindow.__dtgsaFilerobotConsoleFilter = true;
        browserWindow.__dtgsaFilerobotConsoleFilterVersion = FILEROBOT_CONSOLE_FILTER_VERSION;
        browserWindow.__dtgsaOriginalConsoleError ??= console.error;

        console.error = (...args: Parameters<typeof console.error>) => {
            const message = args.map(String).join(' ');

            if (isKnownFilerobotWarning(message)) {
                return;
            }

            browserWindow.__dtgsaOriginalConsoleError?.(...args);
        };
    }
}

const FilerobotImageEditor = dynamic<FilerobotImageEditorConfig>(
    () => import('react-filerobot-image-editor').then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full min-h-[420px] items-center justify-center bg-bg text-text-muted">
                Loading image editor...
            </div>
        ),
    }
);

async function exportCanvasToWebpBlob(
    sourceCanvas: HTMLCanvasElement,
    maxDimension: number,
    quality: number
): Promise<Blob> {
    const scale = Math.min(maxDimension / sourceCanvas.width, maxDimension / sourceCanvas.height, 1);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
    outputCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));

    const context = outputCanvas.getContext('2d');
    if (!context) {
        throw new Error('Could not prepare edited image');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
        outputCanvas.toBlob(resolve, 'image/webp', quality);
    });

    if (!blob) {
        throw new Error('Could not export edited image');
    }

    return blob;
}

async function base64ToCanvas(imageBase64: string): Promise<HTMLCanvasElement> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('Could not load edited image'));
        element.src = imageBase64;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not prepare edited image');
    }

    context.drawImage(image, 0, 0);
    return canvas;
}

async function getEditedImageBlob(
    imageData: SavedImageData,
    maxExportDimension: number,
    exportQuality: number
): Promise<Blob> {
    if (imageData.imageCanvas) {
        return exportCanvasToWebpBlob(imageData.imageCanvas, maxExportDimension, exportQuality);
    }

    if (imageData.imageBase64) {
        const canvas = await base64ToCanvas(imageData.imageBase64);
        return exportCanvasToWebpBlob(canvas, maxExportDimension, exportQuality);
    }

    throw new Error('The editor did not return an edited image');
}

export default function PhotoEditor({
    imageUrl,
    originalUrl,
    onSave,
    onCancel,
    maxExportDimension = 1600,
    exportQuality = 0.82,
}: PhotoEditorProps) {
    const [isSaving, setIsSaving] = useState(false);

    const editorTheme = useMemo(
        () => ({
            palette: {
                'bg-primary': '#151515',
                'bg-secondary': '#1d1d1d',
                'bg-primary-active': '#2a250e',
                'accent-primary': '#ffbb00',
                'accent-primary-hover': '#ffd15c',
                'borders-primary': '#2f2f2f',
                'icons-primary': '#f3f4f6',
                'icons-secondary': '#9ca3af',
            },
            typography: {
                fontFamily: 'Inter, Arial, sans-serif',
            },
        }) as FilerobotImageEditorConfig['theme'],
        []
    );

    const handleSave = async (imageData: SavedImageData) => {
        setIsSaving(true);

        try {
            const editedBlob = await getEditedImageBlob(imageData, maxExportDimension, exportQuality);
            await onSave(editedBlob, originalUrl || imageUrl);
            toast.success('Image saved');
            onCancel();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save edited image');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-bg text-text">
            <FilerobotImageEditor
                source={imageUrl}
                theme={editorTheme}
                tabsIds={EDITOR_TABS}
                defaultTabId="Adjust"
                defaultToolId="Crop"
                savingPixelRatio={1}
                previewPixelRatio={1}
                defaultSavedImageName="edited-image"
                defaultSavedImageType="webp"
                defaultSavedImageQuality={exportQuality}
                closeAfterSave={false}
                avoidChangesNotSavedAlertOnLeave
                resetOnSourceChange
                previewBgColor="#111111"
                Crop={{
                    autoResize: true,
                    minWidth: 80,
                    minHeight: 80,
                }}
                Text={{
                    fonts: ['Inter', 'Arial', 'Tahoma', 'Sans-serif'],
                    fontFamily: 'Inter',
                    fontSize: 18,
                    fill: '#ffffff',
                }}
                annotationsCommon={{
                    stroke: '#ffbb00',
                    strokeWidth: 3,
                    fill: '#ffbb00',
                    opacity: 1,
                }}
                onSave={handleSave}
                onClose={(reason) => {
                    if (reason !== 'after-saving') {
                        onCancel();
                    }
                }}
            />

            {isSaving && (
                <div className="absolute inset-0 z-[10001] flex items-center justify-center bg-black/60">
                    <div className="rounded-md border border-border bg-card-bg px-5 py-4 text-sm text-text">
                        Saving edited image...
                    </div>
                </div>
            )}
        </div>
    );
}
