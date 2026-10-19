import { useEffect, useRef } from "react";
import { App } from "antd";
import copy from "copy-to-clipboard";
import { Copy, ShieldAlert } from "lucide-react";

export function useComfyuiMixedContentListener() {
    const { modal, message } = App.useApp();
    const isShowingRef = useRef(false);

    useEffect(() => {
        const handler = (event: Event) => {
            if (isShowingRef.current) return;
            const customEvent = event as CustomEvent<{ url?: string }>;
            const url = customEvent.detail?.url || "http://127.0.0.1:8188";
            isShowingRef.current = true;

            const corsCmd = `python main.py --listen 127.0.0.1 --port 8188 --enable-cors-header "*"`;

            modal.warning({
                title: "瀏覽器安全策略攔截了本地連線",
                icon: <ShieldAlert className="size-5 text-amber-500" />,
                width: 540,
                content: (
                    <div className="mt-3 space-y-3.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                        <p>
                            當前頁面執行在 <strong>HTTPS</strong> 安全模式下，瀏覽器安全機制預設會<strong>阻止向本地明文 HTTP 服務</strong>（<code>{url}</code>）發起的請求（混合內容保護與私有網路限制）。
                        </p>
                        <div className="rounded-md border border-amber-200 bg-amber-50/80 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30">
                            <div className="font-semibold text-amber-900 dark:text-amber-200">
                                解決步驟（只需配置一次，永久生效）：
                            </div>
                            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-stone-700 dark:text-stone-300">
                                <li>
                                    點選瀏覽器位址列最左側的 <strong>「鎖頭」圖示</strong>（或站點設定/調整圖示）；
                                </li>
                                <li>
                                    點選 <strong>「網站設定」</strong>（Microsoft Edge 瀏覽器中為 <strong>「此站點的許可權」</strong>）；
                                </li>
                                <li>
                                    在許可權列表中找到 <strong>「不安全內容」</strong>（Insecure content），將其從“阻止 (預設)”修改為 <strong>「允許」</strong>；
                                </li>
                                <li>
                                    配置完成後返回當前頁面，點選下方<strong>「重新整理頁面」</strong>即可正常連線。
                                </li>
                            </ol>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-900">
                            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                                <span>同時請確保本地 ComfyUI 啟動時允許跨域 (CORS)：</span>
                                <button
                                    type="button"
                                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    onClick={() => {
                                        copy(corsCmd);
                                        message.success("啟動命令已複製");
                                    }}
                                >
                                    <Copy className="size-3" />
                                    複製命令
                                </button>
                            </div>
                            <code className="mt-1 block overflow-x-auto rounded bg-white p-1.5 font-mono text-[11px] text-stone-800 dark:bg-stone-950 dark:text-stone-200">
                                {corsCmd}
                            </code>
                        </div>
                    </div>
                ),
                okText: "重新整理頁面",
                cancelText: "我知道了",
                okCancel: true,
                onOk: () => {
                    isShowingRef.current = false;
                    window.location.reload();
                },
                onCancel: () => {
                    isShowingRef.current = false;
                },
            });
        };

        window.addEventListener("comfyui:mixed-content-blocked", handler);
        return () => {
            window.removeEventListener("comfyui:mixed-content-blocked", handler);
        };
    }, [message, modal]);
}
