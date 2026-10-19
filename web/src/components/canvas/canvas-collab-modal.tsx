import { useState } from "react";
import { Copy, Check, Users, Share2, Crown, Eye, Wifi, LogOut } from "lucide-react";
import { Button, Input, Modal, message } from "antd";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { useCollabStore } from "@/stores/use-collab-store";

export function CanvasCollabModal({
    projectId,
    projectTitle,
    onStartCollab,
    onStopCollab,
}: {
    projectId: string;
    projectTitle: string;
    onStartCollab: (roomId: string) => void;
    onStopCollab: () => void;
}) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const open = useCollabStore((s) => s.collabModalOpen);
    const setOpen = useCollabStore((s) => s.setCollabModalOpen);
    const activeRoomId = useCollabStore((s) => s.activeRoomId);
    const role = useCollabStore((s) => s.role);
    const status = useCollabStore((s) => s.status);
    const nickname = useCollabStore((s) => s.nickname);
    const setNickname = useCollabStore((s) => s.setNickname);
    const myColor = useCollabStore((s) => s.myColor);
    const onlineUsers = useCollabStore((s) => s.onlineUsers);
    const hostOnline = useCollabStore((s) => s.hostOnline);
    const lanIp = useCollabStore((s) => s.lanIp);

    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const port = window.location.port ? `:${window.location.port}` : "";
    const hostDomain = isLocalhost && lanIp && lanIp !== "127.0.0.1" ? `${lanIp}${port}` : window.location.host;
    const shareUrl = activeRoomId
        ? `${window.location.protocol}//${hostDomain}/canvas/${projectId}?room=${activeRoomId}`
        : "";

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            message.success(isLocalhost ? "已複製內網協同連結！同區域網成員開啟即可加入" : "已複製協同連結！分享給協作者開啟即可加入");
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleStart = () => {
        const roomId = `room-${nanoid(8)}`;
        onStartCollab(roomId);
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-base font-semibold">
                    <Share2 className="size-4 text-blue-500" />
                    <span>{isLocalhost ? "區域網多人協同" : "多人即時協同"}</span>
                </div>
            }
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            centered
            width={460}
        >
            <div className="space-y-4 pt-2">
                {/* User info setting */}
                <div className="flex items-center gap-3 rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                    <div
                        className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: myColor }}
                    >
                        {nickname.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="text-xs text-stone-500">我的協同暱稱</div>
                        <Input
                            size="small"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={16}
                            className="!rounded-lg"
                        />
                    </div>
                </div>

                {!activeRoomId ? (
                    /* Initial state: not yet in collab */
                    <div className="space-y-4 text-center py-2">
                        <div className="rounded-xl border border-dashed border-stone-200 p-4 text-left text-xs leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
                            <p className="font-medium text-stone-700 dark:text-stone-200 mb-1">
                                {isLocalhost ? "💡 內網協同說明" : "💡 多人協同說明"}
                            </p>
                            <p>
                                {isLocalhost
                                    ? "• 開啟後生成專屬區域網協同連結，傳送給同 WiFi / 區域網下的夥伴即可加入。"
                                    : "• 開啟後生成專屬協同連結，傳送給任何線上協作者即可加入。"}
                            </p>
                            <p>• <strong>許可權規則</strong>：你是房主，獨佔編輯與 AI 生成許可權；協作者可即時同步觀看你的操作與成果，並隨時下載高畫質物料。</p>
                        </div>
                        <Button
                            type="primary"
                            icon={<Wifi className="size-4" />}
                            className="!h-10 !w-full !rounded-xl !font-medium"
                            onClick={handleStart}
                        >
                            {isLocalhost ? "開啟內網協同" : "開啟即時協同"}
                        </Button>
                    </div>
                ) : (
                    /* Active collab room */
                    <div className="space-y-4">
                        {/* Status banner */}
                        <div
                            className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                                role === "host"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="relative flex size-2">
                                    <span
                                        className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${
                                            role === "host" ? "bg-blue-400" : "bg-emerald-400"
                                        }`}
                                    />
                                    <span
                                        className={`relative inline-flex size-2 rounded-full ${
                                            role === "host" ? "bg-blue-500" : "bg-emerald-500"
                                        }`}
                                    />
                                </span>
                                <span>
                                    {role === "host" ? "協同進行中（房主特權：可編輯與生成）" : "協同觀看模式（只讀觀看與下載）"}
                                </span>
                            </div>
                            <span className="opacity-70">
                                {status === "connected" ? "已連線" : "連線中..."}
                            </span>
                        </div>

                        {/* Share Link for Host */}
                        {role === "host" ? (
                            <div className="space-y-1.5">
                                <div className="text-xs text-stone-500">
                                    {isLocalhost ? "內網分享連結（發給同區域網成員即可）：" : "協同分享連結（發給協作者即可加入）："}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={shareUrl}
                                        className="!rounded-xl !bg-stone-50 font-mono text-xs dark:!bg-stone-900"
                                    />
                                    <Button
                                        icon={copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                        onClick={handleCopy}
                                        className="!h-8 !rounded-xl"
                                    >
                                        {copied ? "已複製" : "複製"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900/50">
                                {hostOnline ? (
                                    <p className="text-emerald-600 dark:text-emerald-400">🟢 房主線上中，畫布變動將即時同步至你的螢幕。</p>
                                ) : (
                                    <p className="text-amber-600 dark:text-amber-400">🟡 房主暫時離線，你可繼續瀏覽當前畫布與下載資源。</p>
                                )}
                            </div>
                        )}

                        {/* Online Users List */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-stone-500">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Users className="size-3.5" />
                                    線上成員 ({onlineUsers.length || 1})
                                </span>
                            </div>
                            <div className="max-h-36 divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-200/70 p-1 dark:divide-stone-800 dark:border-stone-800">
                                {onlineUsers.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-stone-400">正在獲取線上成員...</div>
                                ) : (
                                    onlineUsers.map((u) => (
                                        <div key={u.id} className="flex items-center justify-between px-2.5 py-1.5 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="size-2 rounded-full"
                                                    style={{ backgroundColor: u.color }}
                                                />
                                                <span className="font-medium text-stone-700 dark:text-stone-300">
                                                    {u.nickname}
                                                </span>
                                            </div>
                                            <span
                                                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                                    u.role === "host"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                                        : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                                                }`}
                                            >
                                                {u.role === "host" ? (
                                                    <>
                                                        <Crown className="size-2.5" /> 房主
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="size-2.5" /> 觀摩
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Exit button */}
                        <Button
                            danger
                            type="text"
                            icon={<LogOut className="size-4" />}
                            className="!mt-2 !h-9 !w-full !rounded-xl"
                            onClick={() => {
                                onStopCollab();
                                message.info(role === "host" ? "已停止協同" : "已退出協同房間");
                            }}
                        >
                            {role === "host" ? "停止協同" : "退出協同"}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
