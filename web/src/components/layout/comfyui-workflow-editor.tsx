import { Sliders } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { App, Select } from "antd";

import {
    getChannelWorkflows,
    useConfigStore,
    type ComfyuiWorkflow,
    type ComfyWorkflowItem,
    type ModelChannel,
    type WorkflowCategory,
} from "@/stores/use-config-store";

const BUILTIN_WORKFLOW_IDENTIFIERS = new Set([
    "t2i_z_image_turbo_api.json",
    "Z-Image-Turbo 文生圖",
    "i2i_flux2_dev_api.json",
    "Flux2.Dev 圖生圖",
    "inpaint_qwen_image_api.json",
    "Qwen-Image 區域性編輯",
    "text_qwen3_5_api.json",
    "Qwen-3.5 文本生成/反推",
    "video_minimax_h3_omni_fp8_20step_api.json",
    "MiniMax H3 全能參考 (FP8 20步)",
    "video_minimax_h3_omni_fp8_4step_pdmd_api.json",
    "minimax_h3_ref2v_4step_pdmd_api.json",
    "MiniMax H3 全能影片 (FP8 4步 PDMD)",
    "MiniMax H3 全能參考 (FP8 4步 PDMD)",
    "video_minimax_h3_omni_bf16_8step_turbo_api.json",
    "MiniMax H3 全能參考 (BF16 8步極速)",
    "video_minimax_h3_omni_bf16_20step_api.json",
    "minimax_h3_ref2va_bf16_20step_api.json",
    "MiniMax H3 全能參考 (BF16 20步)",
    "MiniMax H3 全能影片 (BF16 20步)",
    "video_minimax_h3_frame_fp8_20step_api.json",
    "MiniMax H3 首尾幀 (FP8 20步)",
    "video_minimax_h3_frame_fp8_4step_pdmd_api.json",
    "minimax_h3_fl2va_fp8_4step_pdmd_api.json",
    "MiniMax H3 首尾幀影片 (FP8 4步 PDMD)",
    "MiniMax H3 首尾幀 (FP8 4步 PDMD)",
    "video_minimax_h3_frame_bf16_8step_turbo_api.json",
    "MiniMax H3 首尾幀 (BF16 8步極速)",
    "video_minimax_h3_frame_bf16_20step_api.json",
    "minimax_h3_fl2va_bf16_20step_api.json",
    "MiniMax H3 首尾幀 (BF16 20步)",
    "MiniMax H3 首尾幀影片 (BF16 20步)",
    "qwen_image_21_api.json",
    "Qwen-Image-2.1 文生圖",
    "Qwen-Image-2.1 多圖參考圖生圖",
    "Qwen-Image-2.1 全能生圖",
]);

export type ComfyuiWorkflowEditorProps = {
    channel?: ModelChannel;
    category?: WorkflowCategory;
    channelId?: string;
    workflowId?: string;
    value?: ComfyuiWorkflow | ComfyWorkflowItem;
    defaultWorkflow?: ComfyuiWorkflow | ComfyWorkflowItem;
    isBuiltin?: boolean;
    onChange?: (value?: ComfyuiWorkflow) => void;
};

/**
 * Displays attached ComfyUI workflow information and allows switching default workflow if multiple exist.
 */
export function ComfyuiWorkflowEditor({
    channel,
    category,
    channelId = channel?.id,
    workflowId,
    value,
    defaultWorkflow,
    isBuiltin,
}: ComfyuiWorkflowEditorProps) {
    const { t } = useTranslation();
    const { message } = App.useApp();
    const setChannelDefaultWorkflow = useConfigStore((state) => state.setChannelDefaultWorkflow);

    // 獲取當前渠道在該分類下的所有可用工作流
    const categoryWorkflows = channel && category ? getChannelWorkflows(channel, category) : [];

    const activeWorkflow: ComfyWorkflowItem | ComfyuiWorkflow | undefined = (() => {
        if (categoryWorkflows.length > 0) {
            return categoryWorkflows.find((w) => w.isDefault) || categoryWorkflows[0];
        }
        return value || defaultWorkflow;
    })();

    const isCustom = (() => {
        if (typeof isBuiltin === "boolean") return !isBuiltin;
        if (activeWorkflow && "isBuiltin" in activeWorkflow && typeof activeWorkflow.isBuiltin === "boolean") {
            return !activeWorkflow.isBuiltin;
        }
        if (!activeWorkflow || activeWorkflow === defaultWorkflow) return false;
        if (activeWorkflow.name && BUILTIN_WORKFLOW_IDENTIFIERS.has(activeWorkflow.name)) return false;
        if (defaultWorkflow && activeWorkflow.name === defaultWorkflow.name) return false;
        return true;
    })();

    const handleSelectChange = (nextWorkflowId: string) => {
        if (!channel || !category) return;
        setChannelDefaultWorkflow(channel.id, category, nextWorkflowId);
        const nextWf = categoryWorkflows.find((w) => w.id === nextWorkflowId);
        if (nextWf) {
            message.success(`已將「${nextWf.name}」設為當前渠道的預設工作流`);
        }
    };

    const targetWorkflowId =
        ("id" in (activeWorkflow || {}) ? (activeWorkflow as ComfyWorkflowItem).id : undefined) ||
        workflowId ||
        activeWorkflow?.name;

    // 如果該分類下有多個工作流（如首尾幀影片有 4 個），展示下拉選擇框供使用者切換預設工作流
    if (categoryWorkflows.length > 1) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                        className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                            isCustom
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                        }`}
                    >
                        {isCustom ? t("comfyui.customWorkflow") : t("comfyui.defaultBuiltin")}
                    </span>
                    <Select
                        size="small"
                        value={"id" in (activeWorkflow || {}) ? (activeWorkflow as ComfyWorkflowItem).id : targetWorkflowId}
                        onChange={handleSelectChange}
                        className="min-w-[200px] max-w-[320px] flex-1 text-xs"
                        popupMatchSelectWidth={false}
                        options={categoryWorkflows.map((wf) => ({
                            value: wf.id,
                            label: (
                                <div className="flex items-center justify-between gap-3 py-0.5 text-xs">
                                    <span className="truncate">{wf.name}</span>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <span className="text-[10px] text-stone-400">{formatWorkflowSize(wf.json)}</span>
                                        {wf.isDefault && (
                                            <span className="rounded bg-blue-100 px-1 py-0.2 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                預設
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                </div>

                {channelId && activeWorkflow && (
                    <Link
                        to={`/workflows?id=${encodeURIComponent(targetWorkflowId || "")}&channelId=${encodeURIComponent(channelId)}&category=${encodeURIComponent(category || "")}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded border border-stone-200/80 bg-white px-2 py-1 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-750"
                        title="前往工作流管理頁面進行大模型與引數配置"
                    >
                        <Sliders className="size-3 text-stone-500" />
                        <span>配置工作流</span>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1 truncate text-sm text-stone-500" title={activeWorkflow?.name}>
                {activeWorkflow ? (
                    <span className="flex items-center gap-1.5">
                        <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                isCustom
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                            }`}
                        >
                            {isCustom ? t("comfyui.customWorkflow") : t("comfyui.defaultBuiltin")}
                        </span>
                        <span className="truncate">
                            {activeWorkflow.name} · {formatWorkflowSize(activeWorkflow.json)}
                        </span>
                    </span>
                ) : (
                    t("comfyui.noWorkflowAttached")
                )}
            </div>
            {channelId && activeWorkflow && (
                <Link
                    to={`/workflows?id=${encodeURIComponent(targetWorkflowId || "")}&channelId=${encodeURIComponent(channelId)}&category=${encodeURIComponent(category || "")}`}
                    className="inline-flex items-center gap-1.5 rounded border border-stone-200/80 bg-white px-2 py-1 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-750"
                    title="配置與編輯工作流引數"
                >
                    <Sliders className="size-3 text-stone-500" />
                    <span>配置工作流</span>
                </Link>
            )}
        </div>
    );
}

function formatWorkflowSize(json: Record<string, unknown>) {
    const bytes = JSON.stringify(json).length;
    return bytes < 1024 ? `${bytes}B` : `${(bytes / 1024).toFixed(1)}KB`;
}
