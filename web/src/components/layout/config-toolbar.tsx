import { Button, Card, Divider, Space, Switch, Tag, Typography } from "antd";
import {
    Brush,
    Camera,
    CheckCircle2,
    Copy,
    Download,
    ExternalLink,
    FolderPlus,
    Grid2x2,
    Info,
    Lock,
    Maximize2,
    Scissors,
    Sparkles,
    Trash2,
    Upload,
    Wrench,
    ZoomIn,
} from "lucide-react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
    defaultToolbarConfig,
    getChannelWorkflows,
    useConfigStore,
    type ModelChannel,
    type ToolbarConfig,
    type WorkflowCategory,
} from "@/stores/use-config-store";

type FrontendToolItem = {
    id: string;
    title: string;
    desc: string;
    icon: ReactNode;
    danger?: boolean;
};

type AiToolItem = {
    id: "maskEdit" | "reversePrompt";
    category: WorkflowCategory;
    title: string;
    desc: string;
    icon: ReactNode;
};

const FRONTEND_TOOLS: FrontendToolItem[] = [
    { id: "info", title: "資訊", desc: "檢視節點 ID、尺寸、位置、提示詞與底層 JSON 資料", icon: <Info className="size-4" /> },
    { id: "delete", title: "刪除", desc: "從畫布中永久移除當前節點及所有輸入與衍生連線", icon: <Trash2 className="size-4" />, danger: true },
    { id: "saveAsset", title: "存資產", desc: "將節點影像及生成引數快速存入本地素材資產庫", icon: <FolderPlus className="size-4" /> },
    { id: "download", title: "下載", desc: "將圖片以原始格式及命名直接儲存下載至本地", icon: <Download className="size-4" /> },
    { id: "copyPrompt", title: "複製提示詞", desc: "快速複製生成該圖片所使用的 Prompt 文本到剪貼簿", icon: <Copy className="size-4" /> },
    { id: "replace", title: "替換圖片", desc: "選擇本地新影像，在原節點位置原位無損替換", icon: <Upload className="size-4" /> },
    { id: "resize", title: "鎖比例 / 自由比例", desc: "切換節點自由拉伸縮放或強制鎖定原圖等比寬高縮放", icon: <Lock className="size-4" /> },
    { id: "crop", title: "裁剪", desc: "前端選區自由/等比裁剪圖片，並在右側生成衍生圖片節點", icon: <Scissors className="size-4" /> },
    { id: "split", title: "切圖", desc: "按行列網格切分圖片，批次生成矩陣子圖片節點", icon: <Grid2x2 className="size-4" /> },
    { id: "upscale", title: "放大", desc: "前端演算法快速等比放大圖片解析度 (2x / 4x)", icon: <ZoomIn className="size-4" /> },
    { id: "view", title: "檢視大圖", desc: "全屏居中放大瀏覽原圖細節，自動暫停背景影片", icon: <Maximize2 className="size-4" /> },
];

const AI_TOOLS: AiToolItem[] = [
    {
        id: "maskEdit",
        category: "inpaint",
        title: "區域性編輯 (Inpaint)",
        desc: "在原圖上塗抹遮罩蒙版，結合輸入提示詞進行區域性精準重繪與瑕疵修復",
        icon: <Brush className="size-4 text-emerald-500" />,
    },
    {
        id: "reversePrompt",
        category: "text",
        title: "反推提示詞 (Text / VLM)",
        desc: "呼叫視覺大語言模型深度理解原圖，自動生成反推提示詞文本節點管線",
        icon: <Wrench className="size-4 text-blue-500" />,
    },
];

export function ConfigToolbar({ onNavigateToChannels }: { onNavigateToChannels?: () => void }) {
    const { t } = useTranslation();
    const config = useConfigStore((state) => state.config);
    const updateToolbarConfig = useConfigStore((state) => state.updateToolbarConfig);

    const toolbarConfig: ToolbarConfig = config.toolbar || defaultToolbarConfig;
    const enabledToolIds = new Set(toolbarConfig.ids);

    // 活躍渠道判斷
    const activeChannel: ModelChannel | undefined =
        config.channels.find((c) => c.id === config.channelId) || config.channels[0];

    const handleToggleTool = (toolId: string, checked: boolean) => {
        let nextIds: string[];
        if (checked) {
            nextIds = Array.from(new Set([...toolbarConfig.ids, toolId]));
        } else {
            nextIds = toolbarConfig.ids.filter((id) => id !== toolId);
        }
        updateToolbarConfig({ ids: nextIds });
    };

    const handleToggleLabels = (checked: boolean) => {
        updateToolbarConfig({ showLabels: checked });
    };

    return (
        <div className="space-y-6">
            {/* 頂欄說明與全域性操作 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                <div>
                    <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
                        {t("canvas.imageTools.customize", "自定義工具欄")}
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-500">
                        統一管理畫布圖片節點懸浮工具欄中的工具開關。所有 AI 增強工具的工作流模板統一在「渠道」中維護。
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                        <span>{t("canvas.imageTools.showLabels", "顯示按鈕文字")}</span>
                        <Switch
                            size="small"
                            checked={toolbarConfig.showLabels}
                            onChange={handleToggleLabels}
                        />
                    </div>
                    {onNavigateToChannels && (
                        <Button
                            size="small"
                            icon={<ExternalLink className="size-3.5" />}
                            onClick={onNavigateToChannels}
                        >
                            管理渠道與工作流
                        </Button>
                    )}
                </div>
            </div>

            {/* AI 增強工具組 */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                            AI 增強工具
                        </div>
                        <div className="text-xs text-stone-500">
                            基於 ComfyUI 模型能力，觸發後自動排程當前活躍渠道的對應工作流
                        </div>
                    </div>
                    {activeChannel && (
                        <div className="text-xs text-stone-400">
                            當前生效渠道：<span className="font-medium text-stone-600 dark:text-stone-300">{activeChannel.name}</span>
                        </div>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {AI_TOOLS.map((tool) => {
                        const isEnabled = enabledToolIds.has(tool.id);
                        const channelWorkflows = activeChannel ? getChannelWorkflows(activeChannel, tool.category) : [];
                        const defaultWorkflow = channelWorkflows.find((w) => w.isDefault) || channelWorkflows[0];
                        const isReady = channelWorkflows.length > 0;

                        return (
                            <Card
                                key={tool.id}
                                size="small"
                                className={`transition-colors ${
                                    isEnabled
                                        ? "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/60"
                                        : "border-stone-200/50 bg-stone-50/40 opacity-70 dark:border-stone-800/40 dark:bg-stone-900/20"
                                }`}
                                styles={{ body: { padding: "12px 14px" } }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-stone-100 dark:bg-stone-800">
                                            {tool.icon}
                                        </div>
                                        <div className="font-medium text-xs text-stone-800 dark:text-stone-200">
                                            {tool.title}
                                        </div>
                                    </div>
                                    <Switch
                                        size="small"
                                        checked={isEnabled}
                                        onChange={(checked) => handleToggleTool(tool.id, checked)}
                                    />
                                </div>

                                <p className="mt-2 text-[11px] leading-relaxed text-stone-500 min-h-[32px]">
                                    {tool.desc}
                                </p>

                                <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2 dark:border-stone-800/80">
                                    {isReady ? (
                                        <Tag color="success" className="!mr-0 !text-[10px] flex items-center gap-1">
                                            <CheckCircle2 className="size-2.5" />
                                            已就緒: {defaultWorkflow?.name}
                                        </Tag>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <Tag color="warning" className="!mr-0 !text-[10px]">
                                                渠道未配置工作流
                                            </Tag>
                                            {onNavigateToChannels && (
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    className="!h-auto !p-0 text-[11px] text-blue-500"
                                                    onClick={onNavigateToChannels}
                                                >
                                                    去配置 &gt;
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <Divider className="!my-2" />

            {/* 基礎操作工具組 */}
            <div className="space-y-3">
                <div>
                    <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                        基礎操作工具
                    </div>
                    <div className="text-xs text-stone-500">
                        執行在瀏覽器前端的純檢視互動、資產儲存及影像處理工具
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {FRONTEND_TOOLS.map((tool) => {
                        const isEnabled = enabledToolIds.has(tool.id);
                        return (
                            <Card
                                key={tool.id}
                                size="small"
                                className={`transition-colors ${
                                    isEnabled
                                        ? "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/60"
                                        : "border-stone-200/50 bg-stone-50/40 opacity-70 dark:border-stone-800/40 dark:bg-stone-900/20"
                                }`}
                                styles={{ body: { padding: "12px 14px" } }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`grid size-7 shrink-0 place-items-center rounded-lg ${
                                                tool.danger
                                                    ? "bg-red-50 text-red-500 dark:bg-red-950/40"
                                                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                                            }`}
                                        >
                                            {tool.icon}
                                        </div>
                                        <div className="font-medium text-xs text-stone-800 dark:text-stone-200">
                                            {tool.title}
                                        </div>
                                    </div>
                                    <Switch
                                        size="small"
                                        checked={isEnabled}
                                        onChange={(checked) => handleToggleTool(tool.id, checked)}
                                    />
                                </div>

                                <p className="mt-2 text-[11px] leading-relaxed text-stone-500 min-h-[32px]">
                                    {tool.desc}
                                </p>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
