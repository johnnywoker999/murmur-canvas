import type { ComfyuiWorkflow, ComfyWorkflowItem } from "@/stores/use-config-store";

// Builtin channel workflows (unified for local and cloud ComfyUI instances)
import t2iZImageTurboJson from "@/assets/workflows/t2i_z_image_turbo_api.json";
import i2iFlux2DevJson from "@/assets/workflows/i2i_flux2_dev_api.json";
import inpaintQwenImageJson from "@/assets/workflows/inpaint_qwen_image_api.json";
import textQwen35Json from "@/assets/workflows/text_qwen3_5_api.json";
import omniVideoFp8Json from "@/assets/workflows/video_minimax_h3_omni_fp8_20step_api.json";
import omniVideoFp84StepPdmdJson from "@/assets/workflows/video_minimax_h3_omni_fp8_4step_pdmd_api.json";
import omniVideoBf16TurboJson from "@/assets/workflows/video_minimax_h3_omni_bf16_8step_turbo_api.json";
import omniVideoBf1620StepJson from "@/assets/workflows/video_minimax_h3_omni_bf16_20step_api.json";
import frameVideoFp8Json from "@/assets/workflows/video_minimax_h3_frame_fp8_20step_api.json";
import frameVideoFp84StepPdmdJson from "@/assets/workflows/video_minimax_h3_frame_fp8_4step_pdmd_api.json";
import frameVideoBf16TurboJson from "@/assets/workflows/video_minimax_h3_frame_bf16_8step_turbo_api.json";
import frameVideoBf1620StepJson from "@/assets/workflows/video_minimax_h3_frame_bf16_20step_api.json";
import qwenImage21Json from "@/assets/workflows/qwen_image_21_api.json";
import audioMinimaxMusic3Json from "@/assets/workflows/audio_minimax_music_3_api.json";
import videoH3FaceRefineJson from "@/assets/workflows/video_h3_face_refine_api.json";
import videoDepthReshotJson from "@/assets/workflows/video_depth_reshot_api.json";

// Built-in single workflow definitions
export const DEFAULT_BUILTIN_COMFYUI_DEPTH_VIDEO_WORKFLOW: ComfyuiWorkflow = {
    name: "ReShot 深度影片提取",
    json: videoDepthReshotJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};
export const DEFAULT_BUILTIN_COMFYUI_FACE_REFINE_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 人臉修復",
    json: videoH3FaceRefineJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};
export const DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW: ComfyuiWorkflow = {
    name: "Qwen-Image-2.1 全能生圖",
    json: qwenImage21Json as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};
export const DEFAULT_BUILTIN_COMFYUI_T2I_WORKFLOW: ComfyuiWorkflow = {
    name: "Z-Image-Turbo 文生圖",
    json: t2iZImageTurboJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_I2I_WORKFLOW: ComfyuiWorkflow = {
    name: "Flux2.Dev 圖生圖",
    json: i2iFlux2DevJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_INPAINT_WORKFLOW: ComfyuiWorkflow = {
    name: "Qwen-Image 區域性編輯",
    json: inpaintQwenImageJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_TEXT_WORKFLOW: ComfyuiWorkflow = {
    name: "Qwen-3.5 文本生成/反推",
    json: textQwen35Json as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_VIDEO_20STEP_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 全能參考 (FP8 20步)",
    json: omniVideoFp8Json as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_VIDEO_PDMD_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 全能影片 (FP8 4步 PDMD)",
    json: omniVideoFp84StepPdmdJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_VIDEO_WORKFLOW: ComfyuiWorkflow = DEFAULT_BUILTIN_COMFYUI_VIDEO_PDMD_WORKFLOW;

export const DEFAULT_BUILTIN_COMFYUI_VIDEO_TURBO_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 全能參考 (BF16 8步極速)",
    json: omniVideoBf16TurboJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_VIDEO_BF16_20STEP_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 全能參考 (BF16 20步)",
    json: omniVideoBf1620StepJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_20STEP_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 首尾幀 (FP8 20步)",
    json: frameVideoFp8Json as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_PDMD_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 首尾幀影片 (FP8 4步 PDMD)",
    json: frameVideoFp84StepPdmdJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_WORKFLOW: ComfyuiWorkflow = DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_PDMD_WORKFLOW;

export const DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_TURBO_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 首尾幀 (BF16 8步極速)",
    json: frameVideoBf16TurboJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_BF16_20STEP_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax H3 首尾幀 (BF16 20步)",
    json: frameVideoBf1620StepJson as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

export const DEFAULT_BUILTIN_COMFYUI_AUDIO_WORKFLOW: ComfyuiWorkflow = {
    name: "MiniMax Music 03 音樂生成",
    json: audioMinimaxMusic3Json as Record<string, unknown>,
    createdAt: 0,
    isBuiltin: true,
};

// Aliases for unified ComfyUI workflows
export const DEFAULT_COMFYUI_T2I_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW;
export const DEFAULT_COMFYUI_I2I_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW;
export const DEFAULT_COMFYUI_INPAINT_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_INPAINT_WORKFLOW;
export const DEFAULT_COMFYUI_TEXT_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_TEXT_WORKFLOW;
export const DEFAULT_COMFYUI_VIDEO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_VIDEO_WORKFLOW;
export const DEFAULT_COMFYUI_VIDEO_PDMD_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_VIDEO_PDMD_WORKFLOW;
export const DEFAULT_COMFYUI_FRAME_VIDEO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_WORKFLOW;
export const DEFAULT_COMFYUI_FRAME_VIDEO_PDMD_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_PDMD_WORKFLOW;
export const DEFAULT_COMFYUI_AUDIO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_AUDIO_WORKFLOW;
export const DEFAULT_COMFYUI_FACE_REFINE_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_FACE_REFINE_WORKFLOW;

// Backward-compatible local aliases
export const DEFAULT_LOCAL_COMFYUI_T2I_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW;
export const DEFAULT_LOCAL_COMFYUI_I2I_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW;
export const DEFAULT_LOCAL_COMFYUI_INPAINT_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_INPAINT_WORKFLOW;
export const DEFAULT_LOCAL_COMFYUI_TEXT_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_TEXT_WORKFLOW;
export const DEFAULT_LOCAL_COMFYUI_VIDEO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_VIDEO_WORKFLOW;
export const DEFAULT_LOCAL_COMFYUI_FRAME_VIDEO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_WORKFLOW;

// Backward-compatible cloud aliases
export const DEFAULT_CLOUD_COMFYUI_T2I_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW;
export const DEFAULT_CLOUD_COMFYUI_I2I_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW;
export const DEFAULT_CLOUD_COMFYUI_INPAINT_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_INPAINT_WORKFLOW;
export const DEFAULT_CLOUD_COMFYUI_TEXT_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_TEXT_WORKFLOW;
export const DEFAULT_CLOUD_COMFYUI_VIDEO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_VIDEO_TURBO_WORKFLOW;
export const DEFAULT_CLOUD_COMFYUI_FRAME_VIDEO_WORKFLOW = DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_TURBO_WORKFLOW;

export type ComfyuiWorkflowBundle = {
    t2i: ComfyuiWorkflow;
    i2i: ComfyuiWorkflow;
    inpaint: ComfyuiWorkflow;
    text: ComfyuiWorkflow;
    video: ComfyuiWorkflow;
    frameVideo: ComfyuiWorkflow;
    audio: ComfyuiWorkflow;
    faceRefine?: ComfyuiWorkflow;
    depthVideo?: ComfyuiWorkflow;
};

export const DEFAULT_BUILTIN_COMFYUI_WORKFLOWS: ComfyuiWorkflowBundle = {
    t2i: DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW,
    i2i: DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW,
    inpaint: DEFAULT_BUILTIN_COMFYUI_INPAINT_WORKFLOW,
    text: DEFAULT_BUILTIN_COMFYUI_TEXT_WORKFLOW,
    video: DEFAULT_BUILTIN_COMFYUI_VIDEO_WORKFLOW,
    frameVideo: DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_WORKFLOW,
    audio: DEFAULT_BUILTIN_COMFYUI_AUDIO_WORKFLOW,
    faceRefine: DEFAULT_BUILTIN_COMFYUI_FACE_REFINE_WORKFLOW,
    depthVideo: DEFAULT_BUILTIN_COMFYUI_DEPTH_VIDEO_WORKFLOW,
};

export const DEFAULT_LOCAL_COMFYUI_WORKFLOWS = DEFAULT_BUILTIN_COMFYUI_WORKFLOWS;
export const DEFAULT_CLOUD_COMFYUI_WORKFLOWS: ComfyuiWorkflowBundle = {
    ...DEFAULT_BUILTIN_COMFYUI_WORKFLOWS,
    video: DEFAULT_BUILTIN_COMFYUI_VIDEO_PDMD_WORKFLOW,
    frameVideo: DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_PDMD_WORKFLOW,
};

export function getDefaultComfyuiWorkflows(channel?: { id?: string; name?: string } | null): ComfyuiWorkflowBundle {
    const isCloud = channel?.id === "cloud" || (channel?.name ? channel.name.includes("雲端") : false);
    return isCloud ? DEFAULT_CLOUD_COMFYUI_WORKFLOWS : DEFAULT_BUILTIN_COMFYUI_WORKFLOWS;
}

/**
 * Returns all built-in workflows for the unified ComfyUI channel.
 * Each category provides official models with accurate titles, specifications, and descriptions.
 */
export function getDefaultComfyWorkflowItems(channel?: { id?: string; name?: string } | null): ComfyWorkflowItem[] {
    const prefix = channel?.id || "builtin";
    return [
        {
            id: `${prefix}-t2i-qwen-image-21`,
            name: "Qwen-Image-2.1 文生圖",
            category: "t2i",
            json: DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "Qwen-Image-2.1 大模型文生圖工作流 (BF16，支援多模態理解與超寫實畫質)",
        },
        {
            id: `${prefix}-t2i-z-image-turbo`,
            name: "Z-Image-Turbo 文生圖",
            category: "t2i",
            json: DEFAULT_BUILTIN_COMFYUI_T2I_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "Z-Image-Turbo 極速文生圖工作流 (BF16，4~8步出圖)",
        },
        {
            id: `${prefix}-i2i-qwen-image-21`,
            name: "Qwen-Image-2.1 多圖參考圖生圖",
            category: "i2i",
            json: DEFAULT_BUILTIN_COMFYUI_QWEN_IMAGE_21_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "Qwen-Image-2.1 多圖融合與風格遷移工作流 (支援最多 10 張參考圖)",
        },
        {
            id: `${prefix}-i2i-flux2-dev`,
            name: "Flux2.Dev 圖生圖",
            category: "i2i",
            json: DEFAULT_BUILTIN_COMFYUI_I2I_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "Flux2.Dev 多圖參考與風格遷移工作流 (FP8 + Turbo LoRA)",
        },
        {
            id: `${prefix}-inpaint-qwen-image`,
            name: "Qwen-Image 區域性編輯",
            category: "inpaint",
            json: DEFAULT_BUILTIN_COMFYUI_INPAINT_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "Qwen-Image 視覺語言引導區域性精準重繪工作流 (4步 Lightning)",
        },
        {
            id: `${prefix}-text-qwen3-5`,
            name: "Qwen3.5 文本生成與反推",
            category: "text",
            json: DEFAULT_BUILTIN_COMFYUI_TEXT_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "Qwen3.5 4B 本地端側提示詞擴寫與視覺反推工作流",
        },
        {
            id: `${prefix}-omni-video-minimax-h3-fp8-4step-pdmd`,
            name: "MiniMax H3 全能影片 (FP8 4步 PDMD)",
            category: "omniVideo",
            json: DEFAULT_BUILTIN_COMFYUI_VIDEO_PDMD_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "MiniMax H3 全能參考影片極速版 (FP8 4步 PDMD, 整合 EasyCache 特徵快取)",
        },
        {
            id: `${prefix}-omni-video-minimax-h3-fp8`,
            name: "MiniMax H3 全能影片 (FP8 20步)",
            category: "omniVideo",
            json: DEFAULT_BUILTIN_COMFYUI_VIDEO_20STEP_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "MiniMax H3 全能參考影片 (FP8 Scaled, 適合消費級單卡)",
        },
        {
            id: `${prefix}-omni-video-minimax-h3-bf16-turbo`,
            name: "MiniMax H3 全能影片 (BF16 8步 Turbo)",
            category: "omniVideo",
            json: DEFAULT_BUILTIN_COMFYUI_VIDEO_TURBO_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "MiniMax H3 全能參考影片極速版 (BF16 Turbo 8步, 適合大視訊記憶體高效能顯示卡)",
        },
        {
            id: `${prefix}-omni-video-minimax-h3-bf16-20step`,
            name: "MiniMax H3 全能影片 (BF16 20步)",
            category: "omniVideo",
            json: DEFAULT_BUILTIN_COMFYUI_VIDEO_BF16_20STEP_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "MiniMax H3 全能參考影片高精版 (BF16 20步, 完整精度取樣，畫質上限最高)",
        },
        {
            id: `${prefix}-frame-video-minimax-h3-fp8-4step-pdmd`,
            name: "MiniMax H3 首尾幀影片 (FP8 4步 PDMD)",
            category: "frameVideo",
            json: DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_PDMD_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "MiniMax H3 首尾幀插值影片極速版 (FP8 4步 PDMD, 僅需 4 步極速出片)",
        },
        {
            id: `${prefix}-frame-video-minimax-h3-fp8`,
            name: "MiniMax H3 首尾幀影片 (FP8 20步)",
            category: "frameVideo",
            json: DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_20STEP_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "MiniMax H3 首尾幀插值影片 (FP8 Scaled, 適合消費級單卡)",
        },
        {
            id: `${prefix}-frame-video-minimax-h3-bf16-turbo`,
            name: "MiniMax H3 首尾幀影片 (BF16 8步 Turbo)",
            category: "frameVideo",
            json: DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_TURBO_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "MiniMax H3 首尾幀插值影片極速版 (BF16 Turbo 8步, 適合大視訊記憶體高效能顯示卡)",
        },
        {
            id: `${prefix}-frame-video-minimax-h3-bf16-20step`,
            name: "MiniMax H3 首尾幀影片 (BF16 20步)",
            category: "frameVideo",
            json: DEFAULT_BUILTIN_COMFYUI_FRAME_VIDEO_BF16_20STEP_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: false,
            description: "MiniMax H3 首尾幀插值影片高精版 (BF16 20步, 完整精度取樣，動態演化更平滑)",
        },
        {
            id: `${prefix}-audio-minimax-music-3`,
            name: "MiniMax Music 03 音樂生成",
            category: "audio",
            json: DEFAULT_BUILTIN_COMFYUI_AUDIO_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "MiniMax Music 03 擴散音樂大模型 (支援最長 5 分鐘完整歌曲與純伴奏)",
        },
        {
            id: `${prefix}-tool-face-refine-h3`,
            name: "MiniMax H3 人臉修復",
            category: "faceRefine",
            json: DEFAULT_BUILTIN_COMFYUI_FACE_REFINE_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "MiniMax H3 影片人臉/小臉追蹤精修工作流 (支援最多 9 張角色參考圖與原影片區域性臉部增強)",
        },
        {
            id: `${prefix}-tool-depth-video-reshot`,
            name: "ReShot 深度影片提取",
            category: "depthVideo",
            json: DEFAULT_BUILTIN_COMFYUI_DEPTH_VIDEO_WORKFLOW.json,
            createdAt: 0,
            isBuiltin: true,
            isDefault: true,
            description: "ReShot 單目影片時序連續深度估計工作流 (近白遠黑深度影片，用於剝離演員與畫風生成走位參考)",
        },
    ];
}
