import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Select, Tag } from "antd";
import { CheckCircle2, Layers, Server, Sparkles, Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    getChannelWorkflows,
    getDefaultWorkflow,
    useConfigStore,
    useEffectiveConfig,
} from "@/stores/use-config-store";
import { getDefaultComfyWorkflowItems, type ComfyWorkflowItem } from "@/services/api/comfyui-default-workflows";
import type { CanvasNodeData } from "@/types/canvas";

export type CanvasDepthVideoModalProps = {
    open: boolean;
    node: CanvasNodeData | null;
    onClose: () => void;
    onConfirm: (payload: { channelId: string; workflowId: string }) => void;
};

export function CanvasDepthVideoModal({
    open,
    node,
    onClose,
    onConfirm,
}: CanvasDepthVideoModalProps) {
    const { t } = useTranslation();
    const config = useEffectiveConfig();
    const openConfigDialog = useConfigStore((state) => state.openConfigDialog);

    const channels = useMemo(() => config.channels || [], [config.channels]);

    const initialChannelId = useMemo(() => {
        if (!channels.length) return "";
        if (node?.metadata?.channelId && channels.some((c) => c.id === node.metadata.channelId)) {
            return node.metadata.channelId;
        }
        return config.channelId && channels.some((c) => c.id === config.channelId)
            ? config.channelId
            : channels[0].id;
    }, [channels, config.channelId, node?.metadata?.channelId]);

    const [selectedChannelId, setSelectedChannelId] = useState<string>(initialChannelId);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");

    // 當彈窗開啟或節點變化時重置初始值
    useEffect(() => {
        if (!open) return;
        setSelectedChannelId(initialChannelId);
    }, [open, initialChannelId, node]);

    const currentChannel = useMemo(() => {
        return channels.find((c) => c.id === selectedChannelId) || channels[0] || null;
    }, [channels, selectedChannelId]);

    // 獲取當前渠道下的深度影片工作流列表
    const depthVideoWorkflows = useMemo((): ComfyWorkflowItem[] => {
        if (!currentChannel) return [];
        const list = getChannelWorkflows(currentChannel, "depthVideo");
        if (list.length > 0) return list;
        return getDefaultComfyWorkflowItems(currentChannel).filter((w) => w.category === "depthVideo");
    }, [currentChannel]);

    // 自動關聯預設工作流
    useEffect(() => {
        if (!open || !currentChannel) return;
        const defaultWf =
            getDefaultWorkflow(currentChannel, "depthVideo") ||
            depthVideoWorkflows[0] ||
            getDefaultComfyWorkflowItems(currentChannel).find((w) => w.category === "depthVideo");
        setSelectedWorkflowId(defaultWf?.id || "");
    }, [open, currentChannel, depthVideoWorkflows]);

    const handleConfirm = () => {
        if (!selectedChannelId || !selectedWorkflowId) return;
        onConfirm({
            channelId: selectedChannelId,
            workflowId: selectedWorkflowId,
        });
        onClose();
    };

    const hasVideo = Boolean(node?.metadata?.content);

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/20 dark:text-indigo-400">
                        <Layers className="size-4" />
                    </span>
                    <span className="text-base font-semibold">影片深度估計 / 深度影片</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            centered
            destroyOnHidden
            width={540}
            footer={
                <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-stone-400">
                        {hasVideo ? "目標影片已就緒" : "未檢測到有效影片"}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={onClose}>取消</Button>
                        <Button
                            type="primary"
                            icon={<Sparkles className="size-3.5" />}
                            disabled={!selectedChannelId || !selectedWorkflowId || !hasVideo}
                            onClick={handleConfirm}
                        >
                            開始提取深度影片
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 py-2">
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    為原影片派生單目時序連續灰度深度影片。請選擇執行此任務的 ComfyUI 主機（渠道）及對應工作流。
                </p>

                {/* 1. 執行主機 / 渠道選擇 */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <label className="font-medium text-stone-700 dark:text-stone-200">
                            執行主機 / 渠道
                        </label>
                        <button
                            type="button"
                            onClick={() => openConfigDialog(true, "channels")}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            管理渠道
                        </button>
                    </div>
                    <Select
                        className="w-full"
                        value={selectedChannelId}
                        onChange={(value) => setSelectedChannelId(value)}
                        placeholder="選擇執行渠道主機"
                        options={channels.map((c) => {
                            const isDefault = c.id === config.channelId;
                            const hostUrl = c.comfyuiProxyUrl?.trim() || "http://127.0.0.1:8188";
                            return {
                                value: c.id,
                                label: (
                                    <div className="flex items-center justify-between py-0.5">
                                        <span className="flex items-center gap-1.5">
                                            <Server className="size-3.5 text-blue-500 shrink-0" />
                                            <span className="font-medium truncate max-w-[180px]">{c.name}</span>
                                            {isDefault && <Tag className="text-[10px] m-0 px-1 py-0">預設</Tag>}
                                        </span>
                                        <span className="font-mono text-xs text-stone-400 truncate max-w-[200px]">
                                            {hostUrl}
                                        </span>
                                    </div>
                                ),
                            };
                        })}
                    />
                </div>

                {/* 2. 深度影片工作流選擇 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-200">
                        深度影片工作流
                    </label>
                    <Select
                        className="w-full"
                        value={selectedWorkflowId}
                        onChange={(value) => setSelectedWorkflowId(value)}
                        placeholder="選擇深度影片工作流"
                        options={depthVideoWorkflows.map((w) => ({
                            value: w.id,
                            label: (
                                <div className="flex items-center justify-between py-0.5">
                                    <span className="flex items-center gap-1.5">
                                        <Workflow className="size-3.5 text-indigo-500 shrink-0" />
                                        <span className="truncate">{w.name}</span>
                                    </span>
                                    {w.isDefault && <Tag className="text-[10px] m-0 px-1 py-0">預設</Tag>}
                                </div>
                            ),
                        }))}
                    />
                </div>

                {/* 3. 目標影片與特性說明 */}
                <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500 dark:text-stone-400">輸入原影片檢測</span>
                        {hasVideo ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="size-3.5" />
                                <span className="truncate max-w-[240px]">{node?.title || "原影片"} (已就緒)</span>
                            </span>
                        ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                                未檢測到影片內容
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-stone-400 leading-normal">
                        說明：基於 ReShot / Video Depth Anything 單目連續深度估計，將原影片直接轉換為近白遠黑的時序深度圖，剝離人物外貌與畫風，提取運動與景深，無需輸入提示詞或參考圖。
                    </p>
                </div>
            </div>
        </Modal>
    );
}
