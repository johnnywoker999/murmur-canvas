import { nanoid } from "nanoid";
import { getNodeSpec, NODE_DEFAULT_SIZE } from "@/constant/canvas";
import { nodeSizeFromRatio } from "@/lib/canvas/canvas-node-size";
import type { AiConfig } from "@/stores/use-config-store";
import type { UploadedImage } from "@/services/image-storage";
import type { UploadedFile } from "@/services/file-storage";
import type { ReferenceImage } from "@/types/image";
import { CanvasNodeType, type CanvasImageGenerationType, type CanvasNodeData, type CanvasNodeImage, type CanvasNodeMetadata, type CanvasNodeText, type CanvasNodeTypeId, type Position } from "@/types/canvas";

export function createCanvasNode(type: CanvasNodeTypeId, position: Position, metadata?: CanvasNodeMetadata): CanvasNodeData {
    const spec = getNodeSpec(type);
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
        id,
        type,
        title: spec.title,
        position: {
            x: position.x - spec.width / 2,
            y: position.y - spec.height / 2,
        },
        width: spec.width,
        height: spec.height,
        metadata: { ...spec.metadata, ...metadata },
    };
}

export function imageMetadata(image: UploadedImage): CanvasNodeMetadata {
    return { content: image.url, storageKey: image.storageKey, status: "success", naturalWidth: image.width, naturalHeight: image.height, bytes: image.bytes, mimeType: image.mimeType };
}

export function videoMetadata(video: UploadedFile): CanvasNodeMetadata {
    return { content: video.url, storageKey: video.storageKey, status: "success", naturalWidth: video.width, naturalHeight: video.height, bytes: video.bytes, mimeType: video.mimeType || "video/mp4", durationMs: video.durationMs };
}

export function audioMetadata(audio: UploadedFile): CanvasNodeMetadata {
    return { content: audio.url, storageKey: audio.storageKey, status: "success", bytes: audio.bytes, mimeType: audio.mimeType || "audio/mpeg", durationMs: audio.durationMs };
}

export function referenceUrl(image: ReferenceImage) {
    return image.storageKey || image.url || (!image.dataUrl.startsWith("data:") ? image.dataUrl : undefined);
}

export function buildImageGenerationMetadata(type: CanvasImageGenerationType, config: AiConfig, count: number, references: ReferenceImage[], seed?: number): CanvasNodeMetadata {
    return {
        generationType: type,
        model: config.model,
        size: config.size,
        quality: config.quality,
        ...(config.background ? { background: config.background } : {}),
        count,
        references: references.map(referenceUrl).filter((url): url is string => Boolean(url)),
        generationReferences: references.map((reference) => ({
            nodeId: reference.id,
            kind: "image" as const,
            storageKey: reference.storageKey,
            url: reference.storageKey ? undefined : reference.url || (!reference.dataUrl.startsWith("data:") ? reference.dataUrl : undefined),
            mimeType: reference.type,
        })),
        ...(seed !== undefined ? { seed } : {}),
    };
}

export function buildAudioGenerationMetadata(config: AiConfig, seed?: number): CanvasNodeMetadata {
    return {
        model: config.model,
        seconds: config.audioSeconds || "60",
        ...(seed !== undefined ? { seed } : {}),
    };
}

export function applyNodeConfigPatch(node: CanvasNodeData, patch: Partial<CanvasNodeData["metadata"]>) {
    const safePatch = patch || {};
    const next = { ...node, metadata: { ...node.metadata, ...safePatch } };
    const spec = node.type === CanvasNodeType.Video ? NODE_DEFAULT_SIZE[CanvasNodeType.Video] : NODE_DEFAULT_SIZE[CanvasNodeType.Image];
    const size = typeof safePatch.size === "string" && !node.metadata?.content ? nodeSizeFromRatio(safePatch.size, spec.width, spec.height) : null;
    return size && (node.type === CanvasNodeType.Image || node.type === CanvasNodeType.Video) ? { ...next, ...size, position: { x: node.position.x + node.width / 2 - size.width / 2, y: node.position.y + node.height / 2 - size.height / 2 } } : next;
}

export function cloneNodeMetadata(metadata?: CanvasNodeMetadata, nodeType?: CanvasNodeTypeId): CanvasNodeMetadata | undefined {
    if (!metadata) return undefined;
    const cloned = structuredClone(metadata);

    // 1. 重置瞬時任務與報錯標記
    delete cloned.jobId;
    delete cloned.errorDetails;
    delete cloned.isTimeout;

    const targetType = nodeType || (cloned.generationMode as CanvasNodeType) || undefined;

    // 2. 識別是否屬於 AI 生成類節點（生圖/生影片/生音訊/AI文本）
    const isAiGenerativeImage =
        targetType === CanvasNodeType.Image &&
        Boolean(
            cloned.generationMode === "image" ||
            cloned.generationType ||
            cloned.prompt ||
            cloned.model ||
            cloned.workflowId ||
            (Array.isArray(cloned.images) && cloned.images.length > 0)
        );

    const isAiGenerativeVideo =
        targetType === CanvasNodeType.Video &&
        Boolean(
            cloned.generationMode === "video" ||
            cloned.prompt ||
            cloned.model ||
            cloned.workflowId ||
            cloned.videoMode
        );

    const isAiGenerativeAudio =
        targetType === CanvasNodeType.Audio &&
        Boolean(
            cloned.generationMode === "audio" ||
            cloned.prompt ||
            cloned.model ||
            cloned.workflowId ||
            cloned.audioVoice
        );

    const isAiGenerativeText =
        targetType === CanvasNodeType.Text &&
        Boolean(
            cloned.generationMode === "text" ||
            (Array.isArray(cloned.texts) && cloned.texts.length > 0)
        );

    if (isAiGenerativeImage) {
        // AI 生圖節點：清空媒體產物，保留提示詞、模型、尺寸、參考圖等生成配置，就緒重置為 idle
        cloned.content = "";
        delete cloned.storageKey;
        delete cloned.images;
        delete cloned.primaryImageId;
        delete cloned.naturalWidth;
        delete cloned.naturalHeight;
        delete cloned.bytes;
        delete cloned.mimeType;
        delete cloned.seed;
        cloned.status = "idle";
    } else if (isAiGenerativeVideo) {
        // AI 影片節點：清空影片產物，保留提示詞、模型、時長、參考圖等生成配置，就緒重置為 idle
        cloned.content = "";
        delete cloned.storageKey;
        delete cloned.naturalWidth;
        delete cloned.naturalHeight;
        delete cloned.bytes;
        delete cloned.mimeType;
        delete cloned.durationMs;
        delete cloned.seed;
        cloned.status = "idle";
    } else if (isAiGenerativeAudio) {
        // AI 音訊節點：清空音訊產物，保留提示詞、音色、時長等生成配置，就緒重置為 idle
        cloned.content = "";
        delete cloned.storageKey;
        delete cloned.bytes;
        delete cloned.mimeType;
        delete cloned.durationMs;
        cloned.status = "idle";
    } else if (isAiGenerativeText) {
        // AI 文本節點：清空生成文本產物，保留提示詞與配置，就緒重置為 idle
        cloned.content = "";
        delete cloned.texts;
        delete cloned.primaryTextId;
        cloned.status = "idle";
    } else {
        // 使用者手動上傳的媒體素材（圖片/影片/音訊）或手動輸入的文本節點：保留內容與狀態
        cloned.status = cloned.content ? "success" : "idle";
    }

    return cloned;
}

