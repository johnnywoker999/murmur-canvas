import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { App, Button, Card, Divider, Dropdown, Segmented, Select, Tag, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Download,
    ExternalLink,
    FileCode,
    FolderTree,
    HelpCircle,
    Info,
    Layers,
    Music,
    Package,
    Puzzle,
    RefreshCw,
    Sparkles,
    Terminal,
    Video,
    Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";

import { createZip } from "@/lib/zip";
import { useCopyText } from "@/hooks/use-copy-text";
import { type ModelChannel, useConfigStore } from "@/stores/use-config-store";

const CORS_FLAG = '--enable-cors-header "*"';
const LAUNCH_CMD_EXAMPLE = 'python.exe main.py --listen 0.0.0.0 --enable-manager --enable-cors-header "*"';

// 5 大通用基礎必備擴充套件外掛
export const CORE_PLUGINS = [
    {
        name: "Comfyui-kktools",
        repo: "zhiwendesign/Comfyui-kktools",
        url: "https://github.com/zhiwendesign/Comfyui-kktools",
        desc: "大語言模型多模態文本生成、提示詞潤色擴寫與反推",
        usedBy: "文本生成 / 反推工作流",
    },
    {
        name: "ComfyUI-KJNodes",
        repo: "kijai/ComfyUI-KJNodes",
        url: "https://github.com/kijai/ComfyUI-KJNodes",
        desc: "高階邏輯控制與影片多模態元件解包提取 (GetVideoComponents 等)",
        usedBy: "全能參考影片 / 人臉精修",
    },
    {
        name: "ComfyLiterals",
        repo: "M1kep/ComfyLiterals",
        url: "https://github.com/M1kep/ComfyLiterals",
        desc: "字面量、常數型別及動態引數輸入埠節點",
        usedBy: "首尾幀影片 / 全能參考影片 / 音樂生成",
    },
    {
        name: "ComfyUI-UniversalToolkit",
        repo: "whmc76/ComfyUI-UniversalToolkit",
        url: "https://github.com/whmc76/ComfyUI-UniversalToolkit",
        desc: "通用工具箱與多型別引數轉接橋接",
        usedBy: "文本生成 / 反推工作流",
    },
    {
        name: "ComfyUI_LayerStyle",
        repo: "chflame163/ComfyUI_LayerStyle",
        url: "https://github.com/chflame163/ComfyUI_LayerStyle",
        desc: "圖層樣式合成與區域性重繪遮罩 (Mask) 處理",
        usedBy: "區域性編輯 (Inpaint) 工作流",
    },
];

// 人臉追蹤精修與深度估計等進階/專用擴充套件外掛
export const ADVANCED_PLUGINS = [
    {
        name: "ComfyUI-MiniMaxH3-Myang",
        repo: "civilcoco/ComfyUI-MiniMaxH3-Myang",
        url: "https://github.com/civilcoco/ComfyUI-MiniMaxH3-Myang",
        desc: "人臉智慧追蹤裁剪、潛空間注入、原生口型音訊鎖與按幀去噪縫合",
        usedBy: "影片人臉追蹤精修工作流",
    },
    {
        name: "ComfyUI-VideoHelperSuite (VHS)",
        repo: "Kosinkadink/ComfyUI-VideoHelperSuite",
        url: "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite",
        desc: "影片流載入與音畫組合封裝輸出節點 (LoadVideo, VHS_VideoCombine)",
        usedBy: "影片人臉追蹤精修工作流",
    },
    {
        name: "ComfyUI-ReShot",
        repo: "maosika-ai/ComfyUI-ReShot",
        url: "https://github.com/maosika-ai/ComfyUI-ReShot",
        desc: "單目影片深度時序估計、運鏡走位提取與結構條件處理 (ReShotDepthVideo)",
        usedBy: "影片深度估計工作流",
    },
];

export const CLONE_CORE_PLUGINS_CMD = [
    "cd custom_nodes",
    "git clone https://github.com/zhiwendesign/Comfyui-kktools.git",
    "git clone https://github.com/kijai/ComfyUI-KJNodes.git",
    "git clone https://github.com/M1kep/ComfyLiterals.git",
    "git clone https://github.com/whmc76/ComfyUI-UniversalToolkit.git",
    "git clone https://github.com/chflame163/ComfyUI_LayerStyle.git",
].join("\n");

export const CLONE_ADVANCED_PLUGINS_CMD = [
    "cd custom_nodes",
    "git clone https://github.com/civilcoco/ComfyUI-MiniMaxH3-Myang.git",
    "git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git",
    "git clone https://github.com/maosika-ai/ComfyUI-ReShot.git",
    "python -m pip install -r ComfyUI-ReShot/requirements.txt",
].join("\n");

type WorkflowModelSpec = {
    category: string;
    folder: string;
    files: string[];
};

type WorkflowVariant = {
    id: string;
    label: string;
    badge: string;
    badgeColor?: string;
    baseModel: string;
    description: string;
    uiFileName: string;
    uiDownloadUrl: string;
    apiFileName: string;
    apiDownloadUrl: string;
    models: WorkflowModelSpec[];
    plugins?: { name: string; url: string }[];
    tips?: string;
};

type WorkflowItem = {
    id: string;
    name: string;
    category: "image" | "video" | "audio" | "refine";
    defaultVariantId: string;
    variants: WorkflowVariant[];
};

const WORKFLOWS: WorkflowItem[] = [
    {
        id: "t2i",
        name: "文生圖工作流 (T2I)",
        category: "image",
        defaultVariantId: "qwen21",
        variants: [
            {
                id: "qwen21",
                label: "Qwen-Image-2.1 旗艦版",
                badge: "25 步旗艦 / 兩棲",
                badgeColor: "purple",
                baseModel: "Qwen-Image-2.1 BF16",
                description: "依託 8B 級 Qwen3-VL 視覺語言大模型引導，對複雜長句、多主體關係與古風細節具備強大理解力；未連參考圖時天然作為純文生圖工作流執行。",
                uiFileName: "qwen_image_21_api.json",
                uiDownloadUrl: "/workflows/qwen_image_21_api.json",
                apiFileName: "qwen_image_21_api.json",
                apiDownloadUrl: "/workflows/qwen_image_21_api.json",
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["qwen_image_2.1_bf16.safetensors"] },
                    { category: "多模態CLIP", folder: "models/clip/", files: ["qwen3vl_8b_bf16.safetensors"] },
                    { category: "VAE", folder: "models/vae/", files: ["qwen_image_2.1_vae_bf16.safetensors"] },
                ],
                tips: "大模型級提示詞遵循；內建 QwenImage21Cache 加速快取；無參考圖連線時自動作為純文生圖執行。",
            },
            {
                id: "turbo",
                label: "Z-Image-Turbo 極速版",
                badge: "4~8 步極速",
                badgeColor: "blue",
                baseModel: "Z-Image-Turbo Int8",
                description: "基於 Z-Image-Turbo 極速出圖架構，在保持極快取樣速度的同時生成高畫質影像，適合畫布快速創意發散與秒級反饋。",
                uiFileName: "z_image_turbo_workflow.json",
                uiDownloadUrl: "/workflows/z_image_turbo_workflow.json",
                apiFileName: "z_image_turbo_api.json",
                apiDownloadUrl: "/workflows/z_image_turbo_api.json",
                models: [
                    { category: "VAE", folder: "models/vae/", files: ["ae.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["z_image_turbo_bf16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen_3_4b.safetensors"] },
                ],
                tips: "標準原生節點即可執行，視訊記憶體最低僅需 8GB；ComfyUI 需確保支援新版 Qwen 文本編碼器。",
            },
        ],
    },
    {
        id: "i2i",
        name: "圖生圖工作流 (I2I)",
        category: "image",
        defaultVariantId: "qwen21",
        variants: [
            {
                id: "qwen21",
                label: "Qwen-Image-2.1 多圖參考",
                badge: "最多10張參考圖",
                badgeColor: "cyan",
                baseModel: "Qwen-Image-2.1 BF16",
                description: "原生支援最多 10 張圖片聯合墊圖與多模態特徵融合；未連滿的插槽在提交時自動剪除，完全無參考圖時自動回退為純文生圖。",
                uiFileName: "qwen_image_21_api.json",
                uiDownloadUrl: "/workflows/qwen_image_21_api.json",
                apiFileName: "qwen_image_21_api.json",
                apiDownloadUrl: "/workflows/qwen_image_21_api.json",
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["qwen_image_2.1_bf16.safetensors"] },
                    { category: "多模態CLIP", folder: "models/clip/", files: ["qwen3vl_8b_bf16.safetensors"] },
                    { category: "VAE", folder: "models/vae/", files: ["qwen_image_2.1_vae_bf16.safetensors"] },
                ],
                tips: "顯式提供 ref_image_01 ~ ref_image_10 插槽；系統提交時智慧自適應剪除未連線節點。",
            },
            {
                id: "flux",
                label: "Flux2.Dev 風格遷移",
                badge: "8~16 步 Turbo",
                badgeColor: "purple",
                baseModel: "Flux2.Dev FP8",
                description: "基於 Flux2.Dev Flow Matching 架構，支援在畫布中連線多張參考圖進行風格遷移、融合推演與高質量圖生圖。",
                uiFileName: "flux2_dev_i2i_workflow.json",
                uiDownloadUrl: "/workflows/flux2_dev_i2i_workflow.json",
                apiFileName: "flux2_dev_i2i_api.json",
                apiDownloadUrl: "/workflows/flux2_dev_i2i_api.json",
                models: [
                    { category: "LoRA", folder: "models/loras/", files: ["Flux2TurboComfyv2.safetensors"] },
                    { category: "VAE", folder: "models/vae/", files: ["flux2-vae.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["flux2_dev_fp8mixed.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["mistral_3_small_flux2_fp8.safetensors"] },
                ],
                tips: "Flow Matching 架構頂級質感，推薦 16GB 以上視訊記憶體；視訊記憶體較小可配置 ComfyUI 啟動引數 --lowvram。",
            },
        ],
    },
    {
        id: "inpaint",
        name: "區域性編輯工作流 (Inpaint)",
        category: "image",
        defaultVariantId: "qwen_inpaint",
        variants: [
            {
                id: "qwen_inpaint",
                label: "Qwen-Image 區域性重繪",
                badge: "4 步 Lightning",
                badgeColor: "cyan",
                baseModel: "Qwen-Image Inpaint",
                description: "專為無限畫布區域性塗抹修圖設計，接收前端遮罩圖（ref_mask），藉助 Qwen 2.5-VL 視覺理解實現無縫邊緣貼合與區域性內容修改替換。",
                uiFileName: "qwen_image_inpaint_workflow.json",
                uiDownloadUrl: "/workflows/qwen_image_inpaint_workflow.json",
                apiFileName: "qwen_image_inpaint_api.json",
                apiDownloadUrl: "/workflows/qwen_image_inpaint_api.json",
                plugins: [
                    { name: "ComfyUI_LayerStyle", url: "https://github.com/chflame163/ComfyUI_LayerStyle" },
                ],
                models: [
                    { category: "LoRA", folder: "models/loras/", files: ["Qwen-Image-Lightning-4steps-V1.0.safetensors"] },
                    { category: "VAE", folder: "models/vae/", files: ["qwen_image_vae.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["qwen_image_fp8_e4m3fn.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen_2.5_vl_7b_fp8_scaled.safetensors"] },
                ],
                tips: "畫布節點塗抹生成的白色 Mask 會自動送入 ref_mask 槽位；依賴 ComfyUI_LayerStyle 外掛處理遮罩與圖層邊緣融合。",
            },
        ],
    },
    {
        id: "llm",
        name: "文本生成 / 反推工作流 (LLM)",
        category: "refine",
        defaultVariantId: "qwen35",
        variants: [
            {
                id: "qwen35",
                label: "Qwen3.5 4B 端側大模型",
                badge: "端側 4B / 離線保密",
                badgeColor: "green",
                baseModel: "Qwen3.5 4B BF16",
                description: "用於無限畫布中的多模態文本生成、提示詞潤色擴寫與畫面反推，由本地端側 4B 輕量大語言模型直接驅動，僅需 4G~6G 視訊記憶體。",
                uiFileName: "qwen3_5_text_workflow.json",
                uiDownloadUrl: "/workflows/qwen3_5_text_workflow.json",
                apiFileName: "qwen3_5_text_api.json",
                apiDownloadUrl: "/workflows/qwen3_5_text_api.json",
                plugins: [
                    { name: "Comfyui-kktools", url: "https://github.com/zhiwendesign/Comfyui-kktools" },
                    { name: "ComfyUI-UniversalToolkit", url: "https://github.com/whmc76/ComfyUI-UniversalToolkit" },
                ],
                models: [
                    { category: "語言模型", folder: "models/diffusion_models/", files: ["qwen3.5_4b_bf16.safetensors"] },
                ],
                tips: "依賴第三方外掛 Comfyui-kktools 和 ComfyUI-UniversalToolkit；純本地離線執行，提示詞完全私密。",
            },
        ],
    },
    {
        id: "ref_video",
        name: "全能參考影片工作流 (Omni Video)",
        category: "video",
        defaultVariantId: "pdmd",
        variants: [
            {
                id: "pdmd",
                label: "FP8 4步 PDMD (極速版)",
                badge: "4 步極速 / EasyCache",
                badgeColor: "orange",
                baseModel: "MiniMax H3 ref2va (FP8 + PDMD LoRA)",
                description: "掛載 PDMD 4步蒸餾 LoRA 與 ComfyUI 原生 EasyCache 特徵快取加速，僅需 4 步取樣秒級出片，大幅降低耗時與視訊記憶體門檻。",
                uiFileName: "minimax_h3_ref2v_4step_pdmd_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_ref2v_4step_pdmd_workflow.json",
                apiFileName: "minimax_h3_ref2v_4step_pdmd_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_ref2v_4step_pdmd_api.json",
                plugins: [
                    { name: "ComfyUI-KJNodes", url: "https://github.com/kijai/ComfyUI-KJNodes" },
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "LoRA", folder: "models/loras/", files: ["minimax_h3_pdmd_4step_lora_avg_rank_57_bf16.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_ref2va_pruned_fp8_scaled.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "掛載 4 步 PDMD 蒸餾 LoRA + EasyCache 特徵快取，耗時極短；支援最多 9 圖 + 3 影片 + 3 音訊參考。",
            },
            {
                id: "fp8_20",
                label: "FP8 20步 (消費級推薦)",
                badge: "20 步標準 / 視訊記憶體最佳化",
                badgeColor: "gold",
                baseModel: "MiniMax H3 ref2va (FP8)",
                description: "視訊記憶體最佳化版，適合 RTX 3090/4090 或 16G~24G 單卡，提供標準 20 步穩健取樣與原生音畫同步生成。",
                uiFileName: "minimax_h3_ref2va_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_ref2va_workflow.json",
                apiFileName: "minimax_h3_ref2va_fp8_20step_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_ref2va_fp8_20step_api.json",
                plugins: [
                    { name: "ComfyUI-KJNodes", url: "https://github.com/kijai/ComfyUI-KJNodes" },
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_ref2va_pruned_fp8_scaled.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "標準消費級視訊記憶體最佳化版，未連滿的多模態插槽提交前自動優雅剔除。",
            },
            {
                id: "turbo_8",
                label: "BF16 8步 Turbo (效能版)",
                badge: "8 步 Turbo / 效能級",
                badgeColor: "cyan",
                baseModel: "MiniMax H3 ref2va (BF16 + Turbo LoRA)",
                description: "掛載 Turbo LoRA 加速，8 步極速取樣，適合 24G+ / A100 / H100 專業級顯示卡算力環境。",
                uiFileName: "minimax_h3_ref2va_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_ref2va_workflow.json",
                apiFileName: "minimax_h3_ref2va_bf16_8step_turbo_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_ref2va_bf16_8step_turbo_api.json",
                plugins: [
                    { name: "ComfyUI-KJNodes", url: "https://github.com/kijai/ComfyUI-KJNodes" },
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "LoRA", folder: "models/loras/", files: ["minimax_h3_ref2v_lightx2v_turbo_4step_v0.1_resized_avg_rank_20_bf16.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_ref2va_bf16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_bf16.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "全精度底模 + Turbo LoRA，生成速度與畫質兼備，適合專業計算卡。",
            },
            {
                id: "bf16_20",
                label: "BF16 20步 (全量高精)",
                badge: "20 步全精度 / 旗艦畫質",
                badgeColor: "blue",
                baseModel: "MiniMax H3 ref2va (BF16 全量)",
                description: "完整精度的 20 步標準取樣，畫質上限最高，具備極高保真度與多模態複雜場景推演能力。",
                uiFileName: "minimax_h3_ref2va_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_ref2va_workflow.json",
                apiFileName: "minimax_h3_ref2va_bf16_20step_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_ref2va_bf16_20step_api.json",
                plugins: [
                    { name: "ComfyUI-KJNodes", url: "https://github.com/kijai/ComfyUI-KJNodes" },
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_ref2va_bf16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_bf16.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "畫質上限最高，需 24GB+ 視訊記憶體支援；解析度嚴格鎖定在 0.2M~0.98M 對齊檔位。",
            },
        ],
    },
    {
        id: "frame_video",
        name: "首尾幀影片工作流 (FL2V)",
        category: "video",
        defaultVariantId: "pdmd",
        variants: [
            {
                id: "pdmd",
                label: "FP8 4步 PDMD (極速版)",
                badge: "4 步極速插值",
                badgeColor: "orange",
                baseModel: "MiniMax H3 fl2va (FP8 + PDMD LoRA)",
                description: "視訊記憶體最佳化底模，掛載 PDMD 4步蒸餾 LoRA，僅需 4 步極速完成首尾兩幀的平滑插值演化，大幅縮短生成等待耗時。",
                uiFileName: "minimax_h3_fl2va_fp8_4step_pdmd_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_fl2va_fp8_4step_pdmd_workflow.json",
                apiFileName: "minimax_h3_fl2va_fp8_4step_pdmd_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_fl2va_fp8_4step_pdmd_api.json",
                plugins: [
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "LoRA", folder: "models/loras/", files: ["minimax_h3_pdmd_4step_lora_avg_rank_57_bf16.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_fl2va_pruned_fp8_scaled.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "輸入首尾兩幀精準錨定運鏡與動作插值；依賴 ComfyLiterals 節點。",
            },
            {
                id: "fp8_20",
                label: "FP8 20步 (消費級推薦)",
                badge: "20 步標準 / 視訊記憶體最佳化",
                badgeColor: "gold",
                baseModel: "MiniMax H3 fl2va (FP8)",
                description: "視訊記憶體最佳化版，適合 RTX 3090/4090 或 16G~24G 單卡，提供標準 20 步穩健首尾幀影片生成。",
                uiFileName: "minimax_h3_fl2va_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_fl2va_workflow.json",
                apiFileName: "minimax_h3_fl2va_fp8_20step_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_fl2va_fp8_20step_api.json",
                plugins: [
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_fl2va_pruned_fp8_scaled.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "標準 20 步首尾幀插值，音畫同步輸出。",
            },
            {
                id: "turbo_8",
                label: "BF16 8步 Turbo (效能版)",
                badge: "8 步 Turbo / 效能級",
                badgeColor: "cyan",
                baseModel: "MiniMax H3 fl2va (BF16 + Turbo LoRA)",
                description: "掛載 Turbo LoRA 加速，8 步極速出片，適合高效能工作站或專業計算卡環境。",
                uiFileName: "minimax_h3_fl2va_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_fl2va_workflow.json",
                apiFileName: "minimax_h3_fl2va_bf16_8step_turbo_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_fl2va_bf16_8step_turbo_api.json",
                plugins: [
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "LoRA", folder: "models/loras/", files: ["minimax_h3_ref2v_lightx2v_turbo_4step_v0.1_resized_avg_rank_20_bf16.safetensors"] },
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_fl2va_bf16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_bf16.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "BF16 全精度底模 + Turbo LoRA，高幀率動作流暢平滑。",
            },
            {
                id: "bf16_20",
                label: "BF16 20步 (全量高精)",
                badge: "20 步全精度 / 旗艦過渡",
                badgeColor: "blue",
                baseModel: "MiniMax H3 fl2va (BF16 全量)",
                description: "完整精度的 20 步取樣，首尾插值細節與畫質表現力最強。",
                uiFileName: "minimax_h3_fl2va_workflow.json",
                uiDownloadUrl: "/workflows/minimax_h3_fl2va_workflow.json",
                apiFileName: "minimax_h3_fl2va_bf16_20step_api.json",
                apiDownloadUrl: "/workflows/minimax_h3_fl2va_bf16_20step_api.json",
                plugins: [
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_fl2va_bf16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_bf16.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                ],
                tips: "最高畫質首尾幀演化，視訊記憶體需求較高。",
            },
        ],
    },
    {
        id: "depth_video",
        name: "影片深度估計工作流 (Depth Video)",
        category: "video",
        defaultVariantId: "depth_video_h3",
        variants: [
            {
                id: "depth_video_h3",
                label: "ReShot 影片深度估計 (VDA-Small)",
                badge: "深度提取 / 運鏡復刻",
                badgeColor: "cyan",
                baseModel: "Video Depth Anything Small",
                description: "「複製走位與運鏡，不復制演員與畫風」：將輸入參考影片轉為時序連貫穩定的灰度深度影片（近白遠黑），保留人物空間站位、肢體動作與攝像機運鏡軌跡，徹底剝離演員外貌與畫風，生成的深度影片可無縫作為 MiniMax H3 或 ControlNet 的強結構參考。",
                uiFileName: "depth_video_workflow.json",
                uiDownloadUrl: "/workflows/depth_video_workflow.json",
                apiFileName: "depth_video_api.json",
                apiDownloadUrl: "/workflows/depth_video_api.json",
                plugins: [
                    { name: "ComfyUI-ReShot", url: "https://github.com/maosika-ai/ComfyUI-ReShot" },
                ],
                models: [
                    { category: "深度估計模型", folder: "~/.cache/huggingface/hub/models--depth-anything--Video-Depth-Anything-Small/", files: ["video_depth_anything_vits.pth (約111MB，首次執行自動下載)"] },
                ],
                tips: "⚠️ 依賴 ComfyUI-ReShot 外掛；權重首次執行自動下載（國內網路可設定 HF_ENDPOINT=https://hf-mirror.com 加速）；輸出尺寸自動居中裁切對齊 32 整數倍（杜絕黑邊干擾）。",
            },
        ],
    },
    {
        id: "audio",
        name: "音樂與音訊工作流 (Audio / Music)",
        category: "audio",
        defaultVariantId: "music3",
        variants: [
            {
                id: "music3",
                label: "MiniMax Music 03",
                badge: "雙文本驅動 / 30s~300s",
                badgeColor: "magenta",
                baseModel: "MiniMax Music 03 (DiT)",
                description: "基於 MiniMax Music 03 音訊擴散大模型，支援全風格人聲歌曲、BGM 伴奏與純器樂生成；雙文本驅動（caption 編曲風格 + lyrics 曲式歌詞標籤）；內建切塊解碼防爆視訊記憶體。",
                uiFileName: "audio_minimax_music_3_workflow.json",
                uiDownloadUrl: "/workflows/audio_minimax_music_3_workflow.json",
                apiFileName: "audio_minimax_music_3_api.json",
                apiDownloadUrl: "/workflows/audio_minimax_music_3_api.json",
                plugins: [
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "DiT擴散模型", folder: "models/diffusion_models/", files: ["minimax_music3_dit_fp16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["minimax_music3_text_encoder_pruned_int8_convrot.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_music3_dav.safetensors"] },
                ],
                tips: "⚠️ ComfyUI 核心版本需更新至 v0.31.0+（原生整合 MiniMaxMusic3 節點）；在 lyrics 中使用 [intro]、[verse]、[chorus]、[inst] 控制曲式結構。",
            },
        ],
    },
    {
        id: "face_refine",
        name: "影片人臉追蹤精修工作流 (Face Refine)",
        category: "refine",
        defaultVariantId: "face_refine_h3",
        variants: [
            {
                id: "face_refine_h3",
                label: "H3 Face Refine Auto Select",
                badge: "8 步 Turbo / 閉環精修",
                badgeColor: "volcano",
                baseModel: "MiniMax H3 ref2va + Turbo LoRA + YOLO",
                description: "專為解決 AI 影片中遠景小臉崩壞、五官模糊扭曲、運鏡面部抽搐閃爍設計；YOLO 時序追蹤裁剪 + 原生口型音訊鎖 + 依據面部畫素絕對尺寸逐幀動態去噪 + 逆幾何變換無縫羽化縫合。",
                uiFileName: "H3_Face_Refine_Auto_Select_workflow.json",
                uiDownloadUrl: "/workflows/H3_Face_Refine_Auto_Select_workflow.json",
                apiFileName: "H3_Face_Refine_Auto_Select_Api.json",
                apiDownloadUrl: "/workflows/H3_Face_Refine_Auto_Select_Api.json",
                plugins: [
                    { name: "ComfyUI-MiniMaxH3-Myang", url: "https://github.com/civilcoco/ComfyUI-MiniMaxH3-Myang" },
                    { name: "ComfyUI-VideoHelperSuite", url: "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite" },
                    { name: "ComfyUI-KJNodes", url: "https://github.com/kijai/ComfyUI-KJNodes" },
                    { name: "ComfyLiterals", url: "https://github.com/M1kep/ComfyLiterals" },
                ],
                models: [
                    { category: "擴散模型", folder: "models/diffusion_models/", files: ["minimax_h3_ref2va_pruned_fp8_scaled.safetensors"] },
                    { category: "LoRA", folder: "models/loras/", files: ["minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors"] },
                    { category: "文本編碼器", folder: "models/text_encoders/", files: ["qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"] },
                    { category: "影片 VAE", folder: "models/vae/", files: ["minimax_h3_video_vae_fp16.safetensors"] },
                    { category: "音訊 VAE", folder: "models/vae/", files: ["minimax_h3_audio_vae_fp32.safetensors"] },
                    { category: "人體分割檢測器", folder: "models/ultralytics/segm/", files: ["person_yolov8m-seg.pt"] },
                    { category: "人臉回退檢測器", folder: "models/ultralytics/bbox/", files: ["face_yolov8m.pt"] },
                ],
                tips: "⚠️ 依賴 ComfyUI-MiniMaxH3-Myang 與 VHS 擴充套件外掛；YOLO 權重需放入 models/ultralytics/ 目錄；系統已內建 Windows 與 Linux 跨平臺路徑自適應轉換。",
            },
        ],
    },
];

type CategoryFilter = "all" | "image" | "video" | "audio" | "refine";

type ChannelProbeStatus = {
    state: "unknown" | "probing" | "online" | "offline";
    statusCode?: number;
    latencyMs?: number;
    message?: string;
};

export default function GuidePage() {
    const { t, i18n } = useTranslation();
    const isZh = i18n.resolvedLanguage === "zh-CN";
    const { message } = App.useApp();
    const copyText = useCopyText();
    const [downloadingZip, setDownloadingZip] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

    // 儲存每張卡片當前選中的規格 ID
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        for (const wf of WORKFLOWS) {
            initial[wf.id] = wf.defaultVariantId;
        }
        return initial;
    });

    const config = useConfigStore((state) => state.config);
    const comfyChannels = useMemo(() => {
        const list = config.channels.filter((c) => c.apiFormat === "comfyui" || c.comfyuiProxyUrl?.trim());
        return list.length > 0 ? list : config.channels;
    }, [config.channels]);

    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(() => {
        return comfyChannels.map((c) => c.id);
    });
    const [probeStatuses, setProbeStatuses] = useState<Record<string, ChannelProbeStatus>>({});

    useEffect(() => {
        setSelectedChannelIds((prev) => {
            const validIds = new Set(comfyChannels.map((c) => c.id));
            const filtered = prev.filter((id) => validIds.has(id));
            return filtered.length > 0 ? filtered : comfyChannels.map((c) => c.id);
        });
    }, [comfyChannels]);

    const probeSingleChannel = async (channel: ModelChannel): Promise<ChannelProbeStatus> => {
        const rawUrl = (channel.comfyuiProxyUrl || "").trim() || "http://127.0.0.1:8188";
        const baseEndpoint = rawUrl.replace(/\/+$/, "");
        const probeUrl = `${baseEndpoint}/system_stats`;
        const start = performance.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const headers: Record<string, string> = {};
            if (channel.comfyuiProxyToken?.trim()) {
                headers.Authorization = `Bearer ${channel.comfyuiProxyToken.trim()}`;
            }
            const res = await fetch(probeUrl, {
                method: "GET",
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const latencyMs = Math.round(performance.now() - start);

            if (res.ok) {
                return {
                    state: "online",
                    statusCode: res.status,
                    latencyMs,
                    message: "服務正常，已就緒",
                };
            } else {
                return {
                    state: "offline",
                    statusCode: res.status,
                    latencyMs,
                    message: `響應狀態碼: ${res.status}`,
                };
            }
        } catch (err) {
            const isAbort = err instanceof DOMException && err.name === "AbortError";
            return {
                state: "offline",
                message: isAbort ? "請求超時" : "未連通 / 跨域受限",
            };
        }
    };

    const handleProbeSelected = async (targetIds?: string[]) => {
        const ids = targetIds || selectedChannelIds;
        if (ids.length === 0) {
            message.warning("請至少選擇一個渠道進行探測");
            return;
        }

        const targets = comfyChannels.filter((c) => ids.includes(c.id));
        if (targets.length === 0) return;

        setDetecting(true);
        setProbeStatuses((prev) => {
            const next = { ...prev };
            for (const t of targets) {
                next[t.id] = { state: "probing" };
            }
            return next;
        });

        const results = await Promise.allSettled(
            targets.map(async (channel) => {
                const res = await probeSingleChannel(channel);
                setProbeStatuses((prev) => ({
                    ...prev,
                    [channel.id]: res,
                }));
                return { channel, res };
            })
        );

        setDetecting(false);

        const onlineCount = results.filter(
            (r) => r.status === "fulfilled" && r.value.res.state === "online"
        ).length;
        if (onlineCount === targets.length) {
            message.success(`探測完成：全部 ${targets.length} 個渠道均線上就緒！`);
        } else if (onlineCount > 0) {
            message.info(`探測完成：${onlineCount}/${targets.length} 個渠道線上就緒`);
        } else {
            message.warning(`探測完成：選中的 ${targets.length} 個渠道均未能連通，請確認服務是否開啟或跨域引數`);
        }
    };

    const handleProbeSingle = async (channel: ModelChannel) => {
        setProbeStatuses((prev) => ({
            ...prev,
            [channel.id]: { state: "probing" },
        }));
        const res = await probeSingleChannel(channel);
        setProbeStatuses((prev) => ({
            ...prev,
            [channel.id]: res,
        }));
        if (res.state === "online") {
            message.success(`渠道「${channel.name}」線上就緒 (${res.latencyMs}ms)`);
        } else {
            message.error(`渠道「${channel.name}」未連通 (${res.message || "請檢查服務與跨域引數"})`);
        }
    };

    const handleDownloadSingle = (downloadUrl: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success(`開始下載 ${fileName}`);
    };

    const handleDownloadAllZip = async () => {
        setDownloadingZip(true);
        try {
            const zipFiles: Array<{ name: string; data: BlobPart }> = [];
            const collectedFiles = new Set<string>();

            // 收集所有 9 大能力矩陣下的全部變體檔案（包括 UI 與 API 格式）
            for (const wf of WORKFLOWS) {
                for (const variant of wf.variants) {
                    if (!collectedFiles.has(variant.uiFileName)) {
                        collectedFiles.add(variant.uiFileName);
                        const res = await fetch(variant.uiDownloadUrl);
                        if (res.ok) {
                            const text = await res.text();
                            zipFiles.push({ name: `ui_workflows/${variant.uiFileName}`, data: text });
                        }
                    }
                    if (!collectedFiles.has(variant.apiFileName)) {
                        collectedFiles.add(variant.apiFileName);
                        const res = await fetch(variant.apiDownloadUrl);
                        if (res.ok) {
                            const text = await res.text();
                            zipFiles.push({ name: `api_workflows/${variant.apiFileName}`, data: text });
                        }
                    }
                }
            }

            const readmeContent = [
                "# Infinite Canvas · ComfyUI 官方全套內建工作流資產包",
                "",
                "本壓縮包收錄了 Infinite Canvas 官方推薦的全部 9 大能力矩陣工作流：",
                "- ui_workflows/: ComfyUI 視覺化工作流（可直接拖拽入本地 ComfyUI Web 介面檢視節點連線並除錯）",
                "- api_workflows/: ComfyUI API 格式工作流（用於系統設定內模型渠道繫結與直接排程）",
                "",
                "==================================================",
                "9 大能力矩陣與模型放置清單：",
                "==================================================",
                ...WORKFLOWS.map((wf) => {
                    const variantDetails = wf.variants.map((v) => {
                        return [
                            `  * 規格: ${v.label} [${v.badge}]`,
                            `    - 核心底模: ${v.baseModel}`,
                            `    - UI 連線檔案: ${v.uiFileName}`,
                            `    - API 格式檔案: ${v.apiFileName}`,
                            `    - 依賴模型放置:`,
                            ...v.models.map((m) => `      [${m.category}] ${m.folder}: ${m.files.join(", ")}`),
                            v.tips ? `    - 除錯注意: ${v.tips}` : "",
                        ].filter(Boolean).join("\n");
                    }).join("\n\n");

                    return `\n## ${wf.name}\n${variantDetails}`;
                }),
                "",
                "==================================================",
                "必備核心擴充套件外掛清單：",
                "==================================================",
                "1. 通用必備 5 大基礎外掛（克隆至 custom_nodes/ 目錄）：",
                ...CORE_PLUGINS.map((p, idx) => `   ${idx + 1}. ${p.name} (${p.url}) - ${p.desc} [${p.usedBy}]`),
                "",
                "   [一鍵克隆基礎外掛命令]：",
                CLONE_CORE_PLUGINS_CMD,
                "",
                "2. 影片人臉追蹤精修與深度估計進階套件（克隆至 custom_nodes/ 並安裝依賴）：",
                ...ADVANCED_PLUGINS.map((p, idx) => `   ${idx + 1}. ${p.name} (${p.url}) - ${p.desc} [${p.usedBy}]`),
                "",
                "   [一鍵克隆進階外掛命令]：",
                CLONE_ADVANCED_PLUGINS_CMD,
                "",
                "==================================================",
                "環境與服務部署要點：",
                "==================================================",
                `1. {isZh ? "啟動本地 ComfyUI" : "Launch ComfyUI"} 必須開啟跨域：例如 \`${LAUNCH_CMD_EXAMPLE}\`；`,
                "2. 音訊生成 (MiniMax Music 03) 依賴 ComfyUI 核心版本 >= v0.31.0+；",
                "3. 影片深度估計 (Video Depth Anything) 首次執行自動下載權重（約 111MB，國內可配置 HF_ENDPOINT=https://hf-mirror.com）；",
                "4. 人臉精修 YOLO 權重請放置於 ComfyUI models/ultralytics/ 對應子目錄；",
                "5. 影片生成尺寸嚴格鎖定在 0.2M~0.98M 的 9 檔硬體對齊預設中（16:9 與 9:16 對稱）；",
                "6. 將 UI 工作流拖入 ComfyUI 點選 Queue Prompt 測試成功後，回到系統「設定 → 模型渠道」確認服務埠即可暢享創作！",
            ].join("\n");

            zipFiles.push({ name: "README_模型與存放目錄清單.txt", data: readmeContent });

            const zipBlob = await createZip(zipFiles);
            saveAs(zipBlob, "infinite-canvas-comfyui-workflows.zip");
            message.success("工作流全套合集打包下載成功！");
        } catch (error) {
            message.error(error instanceof Error ? error.message : "打包下載失敗");
        } finally {
            setDownloadingZip(false);
        }
    };

    const filteredWorkflows = useMemo(() => {
        if (activeCategory === "all") return WORKFLOWS;
        return WORKFLOWS.filter((w) => w.category === activeCategory);
    }, [activeCategory]);

    return (
        <main className="h-full overflow-y-auto bg-background text-stone-950 dark:text-stone-100">
            <div className="mx-auto max-w-6xl px-6 py-8 pb-20">
                {/* 頂部標題區 */}
                <div className="mb-8 flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end dark:border-stone-800">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100/70 px-3 py-1 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400">
                            <Layers className="size-3.5" />
                            <span>{isZh ? "本地自建 ComfyUI 原生 API 直連" : "Direct Native ComfyUI (8188) Connection"}</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl dark:text-stone-100">{isZh ? "使用者使用手冊與工作流下載" : "User Guide & Workflow Downloads"}</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500 dark:text-stone-400">
                            {isZh ? "Infinite Canvas 採用純前端無伺服器架構，直連您本機的 ComfyUI（預設埠 8188）。系統內建 9 大核心能力矩陣，涵蓋影像、影片、音訊、深度估計及人臉精修。下載並匯入下方官方預設工作流，配齊模型並在本地 ComfyUI 除錯通過後，即可在無限畫布中開展流暢的全流程 AI 創作。" : "Infinite Canvas uses a pure frontend architecture, connecting directly to your native ComfyUI (default port 8188). Built-in 9 core capability workflows cover image, video, audio, depth, and face refine. Download presets below to create seamlessly on canvas."}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                        <Button
                            type="primary"
                            icon={<Package className="size-4" />}
                            loading={downloadingZip}
                            onClick={handleDownloadAllZip}
                        >
                            {isZh ? "打包下載全部工作流 (.zip)" : "Download All Workflows (.zip)"}
                        </Button>
                        <Link to="/config">
                            <Button icon={<ArrowRight className="size-4" />} iconPlacement="end">
                                {isZh ? "前往配置渠道" : "Configure Channels"}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ComfyUI 服務連通性輕量診斷條 */}
                <div className="mb-8 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800">
                                <Terminal className="size-4 text-stone-700 dark:text-stone-300" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                    <span>{isZh ? "服務探測" : "Service Probe"}</span>
                                    <span className="text-xs text-stone-500">
                                        {isZh ? `(共 ${comfyChannels.length} 個配置渠道，已選 ${selectedChannelIds.length} 個)：` : `(${comfyChannels.length} channels configured, ${selectedChannelIds.length} selected):`}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-stone-500">
                                    {isZh ? "選擇需要測試連通性的 ComfyUI 服務渠道。啟動時請務必開啟跨域引數 " : "Select ComfyUI channels to test connectivity. Ensure CORS flag is enabled: "}
                                    <code className="font-semibold text-stone-800 dark:text-stone-200">{CORS_FLAG}</code>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/config">
                                <Button size="small">{isZh ? "修改渠道配置" : "Channel Settings"}</Button>
                            </Link>
                            <Button
                                size="small"
                                type="primary"
                                icon={<RefreshCw className={`size-3.5 ${detecting ? "animate-spin" : ""}`} />}
                                loading={detecting}
                                disabled={selectedChannelIds.length === 0}
                                onClick={() => handleProbeSelected()}
                            >
                                {isZh ? "探測選中渠道" : "Probe Selected"}
                            </Button>
                        </div>
                    </div>

                    {/* 渠道多選控制元件欄 */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-md border border-stone-200/80 bg-white/70 p-2 text-xs dark:border-stone-800 dark:bg-stone-950/40">
                        <span className="shrink-0 font-medium text-stone-500">選擇探測渠道：</span>
                        <div className="min-w-[240px] flex-1">
                            <Select
                                mode="multiple"
                                size="small"
                                className="w-full"
                                placeholder="請選擇要探測的渠道"
                                maxTagCount="responsive"
                                value={selectedChannelIds}
                                onChange={setSelectedChannelIds}
                                options={comfyChannels.map((c) => ({
                                    label: `${c.name} (${(c.comfyuiProxyUrl || "").trim() || "http://127.0.0.1:8188"})`,
                                    value: c.id,
                                }))}
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                                size="small"
                                type="text"
                                onClick={() => setSelectedChannelIds(comfyChannels.map((c) => c.id))}
                                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                            >
                                全選
                            </Button>
                            <Button
                                size="small"
                                type="text"
                                onClick={() => setSelectedChannelIds([])}
                                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                            >
                                清空
                            </Button>
                        </div>
                    </div>

                    {/* 選中的渠道狀態展示清單 */}
                    {selectedChannelIds.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            {selectedChannelIds.map((channelId) => {
                                const channel = comfyChannels.find((c) => c.id === channelId);
                                if (!channel) return null;
                                const channelUrl = (channel.comfyuiProxyUrl || "").trim() || "http://127.0.0.1:8188";
                                const probe = probeStatuses[channel.id];

                                return (
                                    <div
                                        key={channel.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-stone-200/70 bg-stone-100/60 px-3 py-2 text-xs dark:border-stone-800/80 dark:bg-stone-900/60"
                                    >
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <span className="font-medium text-stone-900 dark:text-stone-100">
                                                {channel.name}
                                            </span>
                                            <code className="max-w-[280px] truncate rounded bg-stone-200/60 px-1.5 py-0.5 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                {channelUrl}
                                            </code>
                                            {channel.id === config.channels[0]?.id && (
                                                <Tag className="m-0 origin-left scale-90 text-[10px]">
                                                    預設渠道
                                                </Tag>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            {(!probe || probe.state === "unknown") && (
                                                <span className="text-xs text-stone-400">未測試</span>
                                            )}
                                            {probe?.state === "probing" && (
                                                <Tag color="processing" className="m-0 inline-flex items-center gap-1">
                                                    <RefreshCw className="size-3 animate-spin" /> 探測中...
                                                </Tag>
                                            )}
                                            {probe?.state === "online" && (
                                                <Tag color="success" className="m-0 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="size-3" /> 線上就緒
                                                    {probe.latencyMs !== undefined && (
                                                        <span className="font-mono text-[10px] opacity-80">
                                                            {probe.latencyMs}ms
                                                        </span>
                                                    )}
                                                </Tag>
                                            )}
                                            {probe?.state === "offline" && (
                                                <Tag color="error" className="m-0 inline-flex items-center gap-1">
                                                    <AlertCircle className="size-3" /> 未連通 ({probe.message || "請加跨域引數"})
                                                </Tag>
                                            )}

                                            <Tooltip title="單獨測試此渠道">
                                                <button
                                                    type="button"
                                                    disabled={probe?.state === "probing"}
                                                    onClick={() => handleProbeSingle(channel)}
                                                    className="inline-flex size-6 items-center justify-center rounded text-stone-400 transition hover:bg-stone-200/70 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                                                >
                                                    <RefreshCw className={`size-3 ${probe?.state === "probing" ? "animate-spin" : ""}`} />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 完整啟動命令舉例與一鍵複製 */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-200/70 bg-stone-100/80 px-3 py-2 text-xs dark:border-stone-800 dark:bg-stone-800/60">
                        <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-stone-700 dark:text-stone-300">
                            <span className="shrink-0 font-sans font-medium text-stone-500">{isZh ? "推薦啟動命令：" : "Launch Command: "}</span>
                            <span className="truncate">{LAUNCH_CMD_EXAMPLE}</span>
                        </div>
                        <Tooltip title={isZh ? "一鍵複製完整啟動命令" : "Copy Full Launch Command"}>
                            <button
                                type="button"
                                onClick={() => copyText(LAUNCH_CMD_EXAMPLE, isZh ? "已複製完整啟動命令" : "Launch command copied")}
                                className="inline-flex shrink-0 items-center gap-1 rounded bg-stone-200/70 px-2 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-stone-300 dark:bg-stone-700/80 dark:text-stone-200 dark:hover:bg-stone-600"
                            >
                                <Copy className="size-3" /> {isZh ? "複製命令" : "Copy Command"}
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* 極簡快速起步四步法 */}
                <div className="mb-10">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-100">
                        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                        {isZh ? "快速起步：4 步完成本地 ComfyUI 對接" : "Quickstart: 4 Steps to Connect ComfyUI"}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-500">
                                <span className="flex size-5 items-center justify-center rounded-full bg-stone-900 !text-white dark:bg-stone-100 dark:!text-stone-900">
                                    1
                                </span>
                                啟動本地 ComfyUI
                            </div>
                            <p className="text-xs leading-5 text-stone-600 dark:text-stone-400">{isZh ? "啟動命令務必包含跨域引數：" : "Must include CORS flag in launch command:"}</p>
                            <div className="mt-2 flex items-center justify-between rounded bg-stone-100 px-2 py-1.5 font-mono text-[11px] text-stone-800 dark:bg-stone-800/80 dark:text-stone-200">
                                <span className="truncate">{CORS_FLAG}</span>
                                <button
                                    type="button"
                                    onClick={() => copyText(CORS_FLAG, "已複製跨域引數")}
                                    className="ml-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                                    title="複製跨域引數"
                                >
                                    <Copy className="size-3" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => copyText(LAUNCH_CMD_EXAMPLE, "已複製完整啟動命令")}
                                className="mt-2 block text-[11px] text-stone-500 underline decoration-dotted hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                            >
                                複製完整啟動命令
                            </button>
                        </div>

                        <div className="rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-500">
                                <span className="flex size-5 items-center justify-center rounded-full bg-stone-900 !text-white dark:bg-stone-100 dark:!text-stone-900">
                                    2
                                </span>
                                {isZh ? "下載工作流檔案" : "Download Workflows"}
                            </div>
                            <p className="text-xs leading-5 text-stone-600 dark:text-stone-400">
                                {isZh ? "點選右上角打包下載全部工作流，或在下方 9 大能力卡片中按需切換規格下載 UI 連線版或 API 格式。" : "Click top right to download all workflows, or select variants below for UI/API formats."}
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-500">
                                <span className="flex size-5 items-center justify-center rounded-full bg-stone-900 !text-white dark:bg-stone-100 dark:!text-stone-900">
                                    3
                                </span>
                                {isZh ? "安裝外掛與模型" : "Install Plugins & Models"}
                            </div>
                            <p className="text-xs leading-5 text-stone-600 dark:text-stone-400">
                                {isZh ? <>將下方 5 大通用基礎外掛克隆至 <code className="font-mono">custom_nodes/</code>，權重放入 <code className="font-mono">models/</code> 對應子目錄。</> : <>Clone the 5 core plugins to <code className="font-mono">custom_nodes/</code> and put weights in <code className="font-mono">models/</code>.</>}
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-500">
                                <span className="flex size-5 items-center justify-center rounded-full bg-stone-900 !text-white dark:bg-stone-100 dark:!text-stone-900">
                                    4
                                </span>
                                {isZh ? "除錯成功後即可使用" : "Test & Start Creating"}
                            </div>
                            <p className="text-xs leading-5 text-stone-600 dark:text-stone-400">
                                {isZh ? "將工作流拖入 ComfyUI 頁面點選 Queue 生成測試無報錯後，回到本專案配置渠道，即可暢享畫布生成！" : "Drag workflow into ComfyUI and test queue without errors. Then bind in Infinite Canvas and start generating!"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 分層核心外掛專區 */}
                <div className="mb-12">
                    {/* 通用基礎 5 大外掛 */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-100">
                                    {isZh ? "通用必備 5 大 ComfyUI 核心擴充套件外掛" : "5 Essential Core ComfyUI Extension Plugins"}
                                </h2>
                                <Tag color="blue" className="m-0 text-xs">{isZh ? "基礎必備" : "Essential"}</Tag>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500">
                                {isZh ? <>覆蓋生圖、圖生圖、區域性編輯、大語言模型與影片基礎生成。克隆至 ComfyUI 的 <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">custom_nodes/</code> 目錄下並重啟服務。</> : <>Covers text2img, img2img, inpaint, LLM, and video generation. Clone into ComfyUI custom_nodes/ and restart.</>}
                            </p>
                        </div>
                        <Button
                            size="small"
                            icon={<Copy className="size-3.5" />}
                            onClick={() => copyText(CLONE_CORE_PLUGINS_CMD, "已複製 5 大基礎外掛克隆命令")}
                        >
                            {isZh ? "一鍵複製 5 大基礎外掛克隆命令" : "Copy 5 Core Plugins Clone Commands"}
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {CORE_PLUGINS.map((plugin, idx) => (
                            <div
                                key={plugin.name}
                                className="flex flex-col justify-between rounded-lg border border-stone-200 bg-card p-4 shadow-sm dark:border-stone-800"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-100 font-mono text-[11px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                                {idx + 1}
                                            </span>
                                            <a
                                                href={plugin.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 font-semibold text-stone-900 underline underline-offset-2 hover:text-blue-600 dark:text-stone-100 dark:hover:text-blue-400"
                                            >
                                                {plugin.name}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                                        {plugin.desc}
                                    </p>
                                    <div className="mt-2.5">
                                        <Tag className="text-[10px] text-stone-500 dark:text-stone-400">
                                            {plugin.usedBy}
                                        </Tag>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between rounded bg-stone-100 px-2 py-1.5 font-mono text-[11px] text-stone-700 dark:bg-stone-900/60 dark:text-stone-300">
                                    <span className="truncate" title={`git clone ${plugin.url}.git`}>
                                        git clone .../{plugin.name}.git
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyText(`git clone ${plugin.url}.git`, `已複製 ${plugin.name} 克隆命令`)}
                                        className="ml-1 shrink-0 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                                        title="複製克隆命令"
                                    >
                                        <Copy className="size-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 進階與專用擴充套件套件 */}
                    <div className="mt-6 rounded-lg border border-stone-200/90 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/30">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-stone-950 dark:text-stone-100">
                                        {isZh ? "進階與專用擴充套件套件 (人臉精修 / 影片深度估計)" : "Advanced Extension Plugins (Face Refine / Video Depth)"}
                                    </h3>
                                    <Tag color="volcano" className="m-0 text-xs">{isZh ? "按需安裝" : "Optional"}</Tag>
                                </div>
                                <p className="mt-1 text-xs text-stone-500">
                                    {isZh ? "若需使用「影片人臉追蹤精修」或「ReShot 影片深度估計」，需額外克隆以下專用外掛以支援 YOLO 人臉追蹤、影片音畫封裝及時序單目深度提取：" : "Required for video face refine or ReShot depth estimation to support YOLO face tracking and depth extraction:"}
                                </p>
                            </div>
                            <Button
                                size="small"
                                icon={<Copy className="size-3.5" />}
                                onClick={() => copyText(CLONE_ADVANCED_PLUGINS_CMD, "已複製進階外掛克隆命令")}
                            >
                                {isZh ? "複製進階套件克隆命令" : "Copy Advanced Plugins Command"}
                            </Button>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {ADVANCED_PLUGINS.map((plugin) => (
                                <div
                                    key={plugin.name}
                                    className="flex flex-col justify-between rounded-md border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900/60"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <a
                                                href={plugin.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-stone-900 underline hover:text-blue-600 dark:text-stone-100 dark:hover:text-blue-400"
                                            >
                                                {plugin.name}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                        <p className="mt-1 text-xs text-stone-500">{plugin.desc}</p>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between rounded bg-stone-100 px-2 py-1 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                        <span className="truncate">git clone {plugin.url}.git</span>
                                        <button
                                            type="button"
                                            onClick={() => copyText(`git clone ${plugin.url}.git`, `已複製 ${plugin.name} 命令`)}
                                            className="ml-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                        >
                                            <Copy className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 9 大核心能力矩陣卡片專區 */}
                <div className="mb-12">
                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-100">
                                    {isZh ? "官方內建 9 大核心能力工作流矩陣" : "9 Official Built-in Capability Workflows"}
                                </h2>
                                <Tag color="blue" className="m-0 text-xs">{isZh ? "共 9 大能力" : "9 Capabilities"}</Tag>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500">
                                {isZh ? "預設下載 UI 連線版（可拖入 ComfyUI 視覺化除錯）；下拉選項可直接下載 API 格式 JSON 供系統繫結。" : "Downloads UI workflow for ComfyUI visual editing; dropdown lets you download API format JSON."}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                size="small"
                                icon={<Download className="size-3.5" />}
                                loading={downloadingZip}
                                onClick={handleDownloadAllZip}
                            >
                                {isZh ? "一鍵打包全部 (.zip)" : "Download All (.zip)"}
                            </Button>
                        </div>
                    </div>

                    {/* 模態分類篩選 Tabs */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
                        <span className="text-xs font-medium text-stone-500">{isZh ? "分類篩選：" : "Categories: "}</span>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { key: "all", label: isZh ? "全部能力" : "All", icon: Layers, count: 9 },
                                { key: "image", label: isZh ? "影像生成" : "Image", icon: Sparkles, count: 3 },
                                { key: "video", label: isZh ? "影片生成" : "Video", icon: Video, count: 3 },
                                { key: "audio", label: isZh ? "音樂音訊" : "Audio", icon: Music, count: 1 },
                                { key: "refine", label: isZh ? "精修與輔助" : "Refine & Utility", icon: Wrench, count: 2 },
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = activeCategory === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setActiveCategory(item.key as CategoryFilter)}
                                        className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                                            isActive
                                                ? "bg-stone-900 text-stone-50 shadow-xs dark:bg-stone-100 dark:text-stone-900"
                                                : "bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                                        }`}
                                    >
                                        <Icon className={`size-3 shrink-0 ${isActive ? "text-stone-50 dark:text-stone-900" : "text-stone-500 dark:text-stone-400"}`} />
                                        <span className={isActive ? "text-stone-50 dark:text-stone-900" : "text-stone-700 dark:text-stone-300"}>{item.label}</span>
                                        <span className={`text-[10px] ${isActive ? "text-stone-300 dark:text-stone-600 font-medium" : "text-stone-400 dark:text-stone-500"}`}>({item.count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {/* 卡片網格 */}
                    <div className="grid gap-5 md:grid-cols-2">
                        {filteredWorkflows.map((wf) => {
                            const currentVariantId = selectedVariants[wf.id] || wf.defaultVariantId;
                            const activeVariant =
                                wf.variants.find((v) => v.id === currentVariantId) || wf.variants[0];

                            const downloadMenuItems: MenuProps["items"] = [
                                {
                                    key: "ui",
                                    label: (
                                        <div className="flex items-center gap-2 py-0.5">
                                            <Layers className="size-3.5 text-blue-500" />
                                            <div>
                                                <div className="text-xs font-medium">{isZh ? "下載 UI 視覺化工作流 (.json)" : "Download UI Workflow (.json)"}</div>
                                                <div className="text-[10px] text-stone-400 font-mono">
                                                    {activeVariant.uiFileName}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                    onClick: () => handleDownloadSingle(activeVariant.uiDownloadUrl, activeVariant.uiFileName),
                                },
                                {
                                    key: "api",
                                    label: (
                                        <div className="flex items-center gap-2 py-0.5">
                                            <FileCode className="size-3.5 text-emerald-500" />
                                            <div>
                                                <div className="text-xs font-medium">{isZh ? "下載 API 格式工作流 (.json)" : "Download API Workflow (.json)"}</div>
                                                <div className="text-[10px] text-stone-400 font-mono">
                                                    {activeVariant.apiFileName}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                    onClick: () => handleDownloadSingle(activeVariant.apiDownloadUrl, activeVariant.apiFileName),
                                },
                            ];

                            return (
                                <Card
                                    key={wf.id}
                                    className="flex flex-col justify-between border-stone-200 bg-card shadow-sm dark:border-stone-800"
                                    styles={{
                                        body: {
                                            padding: "18px",
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                        },
                                    }}
                                >
                                    <div>
                                        {/* 卡片頭部 */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-stone-950 dark:text-stone-100">
                                                        {wf.name}
                                                    </span>
                                                    <Tag color={activeVariant.badgeColor} className="m-0 text-[11px]">
                                                        {activeVariant.badge}
                                                    </Tag>
                                                </div>
                                                <div className="mt-1 text-xs text-stone-500">
                                                    核心演算法：
                                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                                        {activeVariant.baseModel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 雙格式下載按鈕 */}
                                            <div className="flex shrink-0 items-center">
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<Download className="size-3.5" />}
                                                    onClick={() =>
                                                        handleDownloadSingle(
                                                            activeVariant.uiDownloadUrl,
                                                            activeVariant.uiFileName
                                                        )
                                                    }
                                                    className="rounded-r-none"
                                                >
                                                    下載工作流
                                                </Button>
                                                <Dropdown
                                                    menu={{ items: downloadMenuItems }}
                                                    placement="bottomRight"
                                                    trigger={["click"]}
                                                >
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        className="rounded-l-none border-l border-white/20 px-1.5"
                                                        title="選擇下載格式 (UI 連線版 / API 格式)"
                                                    >
                                                        <ChevronDown className="size-3" />
                                                    </Button>
                                                </Dropdown>
                                            </div>
                                        </div>

                                        {/* 多規格切換器 */}
                                        {wf.variants.length > 1 && (
                                            <div className="mt-3">
                                                <Segmented
                                                    size="small"
                                                    block
                                                    value={activeVariant.id}
                                                    onChange={(val) =>
                                                        setSelectedVariants((prev) => ({
                                                            ...prev,
                                                            [wf.id]: val as string,
                                                        }))
                                                    }
                                                    options={wf.variants.map((v) => ({
                                                        label: (
                                                            <span className="truncate text-xs px-1 font-medium">
                                                                {v.label}
                                                            </span>
                                                        ),
                                                        value: v.id,
                                                    }))}
                                                />
                                            </div>
                                        )}

                                        {/* 描述 */}
                                        <p className="mt-3 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                            {activeVariant.description}
                                        </p>

                                        {/* 依賴外掛 */}
                                        {activeVariant.plugins && activeVariant.plugins.length > 0 && (
                                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                                                <Puzzle className="size-3.5 shrink-0" />
                                                <span>依賴擴充套件：</span>
                                                <div className="inline-flex flex-wrap items-center gap-2">
                                                    {activeVariant.plugins.map((plugin) => (
                                                        <a
                                                            key={plugin.name}
                                                            href={plugin.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-100"
                                                        >
                                                            {plugin.name}
                                                            <ExternalLink className="size-3" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 模型目錄要求 */}
                                        <div className="mt-3.5 rounded-lg border border-stone-200/80 bg-stone-50/80 p-3 dark:border-stone-800/80 dark:bg-stone-900/40">
                                            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                                <div className="flex items-center gap-1.5">
                                                    <FolderTree className="size-3.5" />
                                                    <span>本地模型存放路徑要求 (ComfyUI models/)</span>
                                                </div>
                                                <Tooltip title="一鍵複製當前規格所需全部模型檔名">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyText(
                                                                activeVariant.models
                                                                    .flatMap((m) =>
                                                                        m.files.map((f) => `${m.folder}${f}`)
                                                                    )
                                                                    .join("\n"),
                                                                "已複製模型路徑清單"
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 text-[11px] text-stone-500 transition hover:text-stone-950 dark:hover:text-stone-200"
                                                    >
                                                        <Copy className="size-3" /> 複製清單
                                                    </button>
                                                </Tooltip>
                                            </div>

                                            <div className="space-y-2">
                                                {activeVariant.models.map((m) => (
                                                    <div key={m.folder} className="text-xs">
                                                        <div className="font-mono text-[11px] text-stone-400">
                                                            {m.folder}
                                                        </div>
                                                        <div className="mt-0.5 space-y-1">
                                                            {m.files.map((file) => (
                                                                <div
                                                                    key={file}
                                                                    className="flex items-center justify-between rounded bg-white px-2 py-1 text-xs text-stone-800 shadow-xs dark:bg-stone-800/70 dark:text-stone-200"
                                                                >
                                                                    <span className="truncate font-mono font-medium">
                                                                        {file}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            copyText(file, `已複製模型名：${file}`)
                                                                        }
                                                                        className="ml-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-100"
                                                                        title="複製檔名"
                                                                    >
                                                                        <Copy className="size-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 底部提示 */}
                                    {activeVariant.tips && (
                                        <div className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-stone-500 dark:text-stone-400">
                                            <Info className="mt-0.5 size-3 shrink-0 text-stone-400" />
                                            <span>{activeVariant.tips}</span>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <Divider className="my-10" />

                {/* 常見問題與排錯指引 */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-950 dark:text-stone-100">
                        <HelpCircle className="size-5 text-stone-600 dark:text-stone-400" />
                        {isZh ? "常見排錯與除錯 FAQ" : "Frequently Asked Questions & Troubleshooting (FAQ)"}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <AlertCircle className="size-4 text-amber-500" />
                                1. 提示 Failed to fetch 或跨域 CORS 錯誤？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                瀏覽器基於安全策略禁止跨域訪問。請在啟動 ComfyUI 的指令碼或命令列中追加跨域引數{" "}
                                <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                                    {CORS_FLAG}
                                </code>
                                。
                            </p>
                            <div className="mt-2.5 rounded bg-stone-100 p-2 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                <div className="mb-1 text-[10px] text-stone-400">典型啟動命令示例（Windows bat 或終端）：</div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate">{LAUNCH_CMD_EXAMPLE}</span>
                                    <button
                                        type="button"
                                        onClick={() => copyText(LAUNCH_CMD_EXAMPLE, "已複製啟動命令")}
                                        className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                                        title="複製命令"
                                    >
                                        <Copy className="size-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <Wrench className="size-4 text-blue-500" />
                                2. 工作流匯入後顯示紅色缺失節點 (Missing Nodes)？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                請在 ComfyUI 網頁介面中開啟 <span className="font-semibold text-stone-800 dark:text-stone-200">ComfyUI-Manager</span>，點選 <span className="font-semibold text-stone-800 dark:text-stone-200">Install Missing Custom Nodes</span> 自動查詢並安裝缺失的擴充套件節點，安裝完畢後重啟 ComfyUI。
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <Layers className="size-4 text-purple-500" />
                                3. 視訊記憶體不足 (CUDA Out of Memory) 報錯？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                MiniMax H3 影片與 Flux 模型視訊記憶體需求較高。啟動時新增{" "}
                                <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                                    --lowvram
                                </code>{" "}
                                或優先選用帶 <span className="font-semibold text-stone-800 dark:text-stone-200">FP8 4步 PDMD</span> 極速版規格，可以大幅削減視訊記憶體峰值佔用與推理耗時。
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <FileCode className="size-4 text-emerald-500" />
                                4. 如何使用自己調整過的自定義工作流？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                在 ComfyUI 設定中勾選 <span className="font-semibold text-stone-800 dark:text-stone-200">Enable Dev mode Options</span>，通過 <span className="font-semibold text-stone-800 dark:text-stone-200">Save (API Format)</span> 匯出 API 格式 JSON；然後在本專案「配置 → 模型渠道 → 編輯」中上傳繫結即可。
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <FolderTree className="size-4 text-rose-500" />
                                5. 人臉精修 YOLO 權重路徑與跨系統相容？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                人臉精修依賴 YOLO 例項分割與人臉檢測權重。請將 <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-stone-800 dark:bg-stone-800 dark:text-stone-200">person_yolov8m-seg.pt</code> 放入 <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-stone-800 dark:bg-stone-800 dark:text-stone-200">models/ultralytics/segm/</code> 目錄。系統向 ComfyUI 提交任務時會自動識別宿主系統，並在 Windows 反斜槓 (<code className="font-mono">\</code>) 與 Linux 正斜槓 (<code className="font-mono">/</code>) 間自適應平滑轉換。
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <Music className="size-4 text-fuchsia-500" />
                                6. 音樂與音訊生成對 ComfyUI 版本的需求？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                MiniMax Music 03 依賴 ComfyUI 原生整合的 <code className="font-mono">MiniMaxMusic3TextEncode</code> 與 <code className="font-mono">SaveAudioAdvanced</code> 等節點，請確保您的 ComfyUI 核心版本已升級至 <span className="font-semibold text-stone-800 dark:text-stone-200">v0.31.0 或更高版本</span>。
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <Video className="size-4 text-orange-500" />
                                7. 影片生成解析度硬體鎖死規則說明？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                為保證 MiniMax H3 多模態架構的絕對穩定與不破圖，系統嚴禁手動輸入任意解析度數字。所有影片生成尺寸均已收斂在 <span className="font-semibold text-stone-800 dark:text-stone-200">0.2M ~ 0.98M 的 9 檔硬體對齊預設</span> 中（16:9 與 9:16 畫幅對稱對調，上限嚴格鎖定在 0.98 MP）。
                            </p>
                        </div>

                        <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                                <Sparkles className="size-4 text-cyan-500" />
                                8. 影片深度估計 (ReShot) 權重下載與加速？
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
                                首次執行 <code className="font-mono">ReShotDepthVideo</code> 時，外掛會自動從 HuggingFace 下載 <code className="font-mono">video_depth_anything_vits.pth</code>（約 111 MB）並常駐記憶體。國內網路建議啟動 ComfyUI 前設定映象環境變數 <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-stone-800 dark:bg-stone-800 dark:text-stone-200">HF_ENDPOINT=https://hf-mirror.com</code>，或將權重資料夾完整複製至 <code className="font-mono">~/.cache/huggingface/hub/models--depth-anything--Video-Depth-Anything-Small/</code> 離線使用。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
