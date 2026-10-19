import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Modal, Segmented, Tag, Tooltip } from "antd";
import {
    CheckCircle2,
    XCircle,
    Cloud,
    HardDrive,
    Wrench,
    Sparkles,
    Copy,
    MessageSquare,
    Cpu,
    Database,
    Heart,
    HelpCircle,
    RefreshCw,
    Server,
    Video,
    Zap,
    Terminal,
    Bot,
} from "lucide-react";

import { useCopyText } from "@/hooks/use-copy-text";

// 聯絡方式與渠道配置
export const CONTACT_INFO = {
    wechat: {
        wechatId: "openlts", // 真實微訊號
        title: "微信掃碼諮詢與購買",
        qrPath: "/images/contact/wechat-qr.png",
        tip: "新增時請備註：【0元極速體驗】/【119服務包】/【1對1作者部署】，極速優先通過！",
    },
    douyin: {
        name: "@同學你好",
        douyinId: "574832860",
        title: "抖音掃碼關注官方教程",
        qrPath: "/images/contact/douyin-qr.png",
        tip: "關注抖音【同學你好】，獲取第一手 ComfyUI 影片實操演示與最新大模型避坑技巧！",
    },
};

export default function PricingPage() {
    const { t, i18n } = useTranslation();
    const isZh = i18n.resolvedLanguage === "zh-CN";
    const copyText = useCopyText();
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>("創作者服務包（¥119）");
    const [activeContactTab, setActiveContactTab] = useState<"wechat" | "douyin">("wechat");

    const openContactModal = (planName: string) => {
        setSelectedPlan(planName);
        setQrModalOpen(true);
    };

    return (
        <main className="relative h-full overflow-y-auto bg-background text-stone-950 dark:text-stone-100">
            {/* 背景修飾底紋 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60 dark:bg-[radial-gradient(rgba(245,245,244,.12)_1px,transparent_1px)]" />

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* 1. Hero 頭部吸引區 */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Sparkles className="size-3.5" />
                        <span>{isZh ? "無需萬元顯示卡，幾塊錢跑通 ComfyUI 頂級工作流" : "No expensive GPU needed, run top ComfyUI workflows for pennies"}</span>
                    </div>

                    <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        {isZh ? "選擇最適合您的 " : "Choose the Best "}<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">{isZh ? "AI 生產力部署方案" : "AI Productivity Deployment Solution"}</span>
                    </h1>

                    <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 px-6 py-2.5 text-center shadow-sm backdrop-blur dark:border-indigo-800/60 dark:bg-indigo-950/40 sm:px-8 sm:py-3">
                            <p className="!m-0 flex flex-wrap items-center justify-center text-center text-lg font-black leading-normal tracking-tight sm:text-2xl md:text-3xl">
                                <span className="inline-flex items-center">
                                    <span className="mr-1.5">💡</span>
                                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{isZh ? "把時間留給靈感與創作" : "Spend time on inspiration and creation"}</span>
                                    <span className="text-stone-900 dark:text-stone-100">{isZh ? "，" : ", "}</span>
                                </span>
                                <span className="text-stone-900 dark:text-stone-100">{isZh ? "別把精力浪費在折騰工具上" : "don't waste energy struggling with tools"}</span>
                            </p>
                        </div>

                        <div className="mt-4 space-y-1.5 text-center text-sm text-stone-600 sm:text-base dark:text-stone-400">
                            <p>{isZh ? "告別環境報錯紅字與漫長配置" : "Say goodbye to terminal errors and tedious setups"}</p>
                            <p>{isZh ? "輕薄本 / Mac 亦可享受 24G 頂級顯示卡算力" : "Laptops and Macs can harness 24GB top-tier GPU power"}</p>
                            <p className="text-stone-500 dark:text-stone-400">{isZh ? "為個人創作者、設計團隊與工作室量身打造的開箱即用方案" : "Out-of-the-box solution for creators, design teams and studios"}</p>
                        </div>
                    </div>

                    {/* GPU 算力透明成本條 */}
                    <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-stone-200 bg-stone-50/90 p-4 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-left sm:flex-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                    <Cpu className="size-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">{isZh ? "真實 GPU 算力實報實銷：極其實惠" : "Transparent & Affordable GPU Compute"}</div>
                                    <div className="text-xs text-stone-500 dark:text-stone-400">
                                        {isZh ? "主流卡（RTX 3090/4070 24G）僅僅 " : "Mainstream (RTX 3090/4070 24G) only "}<span className="font-semibold text-emerald-600 dark:text-emerald-400">¥1~2 {isZh ? "/小時" : "/hr"}</span>{isZh ? "；旗艦卡（4090/5090）約 " : "; Flagship (4090/5090) ~"}<span className="font-semibold text-emerald-600 dark:text-emerald-400">¥3~5 {isZh ? "/小時" : "/hr"}</span>{isZh ? "；伺服器級顯示卡（RTX PRO 6000）約 " : "; Server GPUs (RTX PRO 6000) ~"}<span className="font-semibold text-emerald-600 dark:text-emerald-400">¥6~8 {isZh ? "/小時" : "/hr"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 text-xs text-stone-500 dark:text-stone-400">
                                {isZh ? <>跑 100 張圖/生成 5 個影片 <br />算力成本僅需 </> : <>100 Images / 5 Videos <br />Compute cost only </>}<span className="text-sm font-bold text-amber-600 dark:text-amber-400">¥1.5 ~ ¥4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. 三大主力方案卡片 (展現交付效果、優勢與明確服務邊界) */}
                <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                    {/* 方案 A: 極速自助體驗包 (限時 ¥0.00 / 純文件自助) */}
                    <div className="relative flex flex-col justify-between rounded-3xl border border-stone-200 bg-background p-6 shadow-sm sm:p-7 dark:border-stone-800">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        <Terminal className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight">
                                        {isZh ? <>極速自助<br />體驗包</> : <>Free Self-service<br />Trial</>}
                                    </h3>
                                </div>
                                <Tag color="green" className="!mr-0 shrink-0 font-medium">{isZh ? "限時0.00元" : "Limited Free"}</Tag>
                            </div>

                            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                                {isZh ? "作者已部署 LightCC & AutoDL 官方預裝映象，告別本地顯示卡限制與繁瑣配置。提供 3 步開箱即用接入文件，純文件自查。" : "Official pre-installed mirrors deployed on LightCC & AutoDL. Free from GPU restrictions and complex setups. 3-step setup guide included."}
                            </p>

                            <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">¥0.00</span>
                                    <span className="text-xs text-stone-400 line-through">{isZh ? "原價 ¥19.9" : "Orig. ¥19.9"}</span>
                                    <Tooltip
                                        title={
                                            <div className="p-1 text-xs leading-relaxed">
                                                <div className="font-semibold text-emerald-400">{isZh ? "💡 限時 0.00 元福利說明" : "💡 Limited Free Trial Description"}</div>
                                                <div className="mt-1 text-stone-200">
                                                    {isZh ? "作者已在 LightCC 與 AutoDL 平臺部署官方預裝雲映象供社群免費使用，免映象費！註冊 LightCC 新使用者還送 3 元算力券（可免費體驗 RTX 5090 1 小時）。您只需按需支付雲平臺的 GPU 算力租金。" : "Official pre-installed cloud mirrors on LightCC & AutoDL for free community use! New users receive ¥3 compute voucher to try RTX 5090 for 1 hr. You only pay for hourly cloud GPU usage."}
                                                </div>
                                            </div>
                                        }
                                        trigger={["hover", "click"]}
                                        overlayClassName="max-w-xs"
                                    >
                                        <button
                                            type="button"
                                            className="inline-flex cursor-pointer items-center text-stone-400 hover:text-emerald-500 transition-colors focus:outline-none"
                                            aria-label="限時 0.00 元說明"
                                        >
                                            <HelpCircle className="size-4" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <span className="text-xs text-stone-500">{isZh ? "/ 限時免費體驗（僅付算力租金）" : "/ Limited Free (Compute only)"}</span>
                            </div>
                            <div className="mt-1 text-xs text-stone-400">
                                {isZh ? "作者官方映象免費開放，提供教程文件，不含人工答疑" : "Official image free to use, guide docs provided, no 1-on-1 support"}
                            </div>

                            <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">{isZh ? "📦 交付效果" : "📦 Deliverables"}</div>
                                <ul className="mt-2 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-stone-600 dark:text-stone-400">•</span>
                                        <span>{isZh ? "LightCC（推薦首選）+ AutoDL 官方預裝映象與開機指引" : "LightCC (Recommended) + AutoDL official pre-installed image & boot guide"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-stone-600 dark:text-stone-400">•</span>
                                        <span>{isZh ? "LightCC 註冊贈 3 元券福利（免費跑 5090 算力 1 小時）" : "LightCC registration bonus ¥3 voucher (Free 1-hr RTX 5090 compute)"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-stone-600 dark:text-stone-400">•</span>
                                        <span>{isZh ? "3 步極速接入指引（開機 -> 複製地址 -> 貼上到畫布）" : "3-step setup guide (Boot -> Copy URL -> Paste into Canvas)"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-stone-600 dark:text-stone-400">•</span>
                                        <span>{isZh ? "預裝 5 大核心外掛與主流精選模型工作流" : "Pre-installed 5 core plugins and mainstream curated model workflows"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-stone-600 dark:text-stone-400">•</span>
                                        <span>{isZh ? "常見報錯排查自救指南（網路/埠/視訊記憶體自查）" : "Troubleshooting guide for common errors (network/ports/VRAM)"}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{isZh ? "✅ 核心優勢" : "✅ Core Advantages"}</div>
                                <ul className="mt-2 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "限時 0 元極低門檻，輕薄本/Mac 秒級上手" : "Limited free with zero barrier, instant access for laptops and Macs"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "純雲端開箱即用，免本地配環境與裝顯示卡，隨用隨停" : "Pure cloud out-of-the-box, no local environment or GPU needed"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "內建國內高速源，速度視網路情況而定" : "Built-in high-speed acceleration sources"}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-rose-500">{isZh ? "⚠️ 服務邊界與注意" : "⚠️ Service Scope & Notes"}</div>
                                <ul className="mt-2 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "僅限雲端預裝映象：本方案不包含本地便攜包部署" : "Cloud pre-installed image only: Does not include local package deployment"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "純文件自查模式：不提供任何 1 對 1 人工技術支援與答疑" : "Document self-check mode: No 1-on-1 human technical support included"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "遇指令碼或網路報錯請完全自行對照文件排查" : "Please refer to documentation self-troubleshooting for script or network errors"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "雲端算力平臺租金自行支付（按時計費，新使用者可領券）" : "Cloud compute fees paid separately to providers (hourly billing, vouchers available)"}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                size="large"
                                className="w-full !h-11 !font-medium"
                                onClick={() => window.open("https://www.lightcc.cloud/imageDetail?id=75064&invitationCode=yKBHXCJF108947", "_blank")}
                            >
                                {isZh ? "檢視雲端映象使用教程（限時0元）" : "View Cloud Mirror Guide (Free)"}
                            </Button>
                            <div className="mt-2 text-center">
                                <a
                                    href="https://github.com/ZhuYichuan/infinite-canvas/blob/main/docs/CLOUD_MIRROR_GUIDE.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition-colors"
                                >
                                    {isZh ? "檢視免配置接入圖文文件 →" : "View zero-config setup docs →"}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 方案 B: 創作者服務包 (¥119 / 官方重點推薦款) */}
                    <div className="relative flex flex-col justify-between rounded-3xl border-2 border-indigo-600 bg-background p-6 shadow-2xl ring-2 ring-indigo-500/30 sm:p-7 dark:border-indigo-400 dark:ring-indigo-400/30 lg:-translate-y-2">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-1 text-xs font-bold text-white shadow-lg whitespace-nowrap">
                            {isZh ? "🔥 官方重點推薦 · 80% 創作者首選" : "🔥 Most Popular · Choice of 80% Creators"}
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                        <Bot className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight">
                                        {isZh ? <>創作者<br />服務包</> : <>Creator<br />Service Pack</>}
                                    </h3>
                                </div>
                                <Tag color="magenta" className="!mr-0 shrink-0 font-semibold">{isZh ? "🔥 重點推薦" : "🔥 Recommended"}</Tag>
                            </div>

                            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                                {isZh ? "專為高頻創作與追求穩定的創作者打造。配通 Workbuddy 桌面智慧體接管畫布，贈送 3 次遠端排障兜底與優先微信答疑。" : "Built for high-frequency creators. Integrates Workbuddy desktop Agent, includes 3 remote troubleshooting sessions and priority WeChat Q&A."}
                            </p>

                            <div className="mt-5 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold tracking-tight text-stone-950 dark:text-stone-100">¥119</span>
                                <span className="text-xs text-stone-500">{isZh ? "/ 年（含 3 次遠端排障）" : "/ year (incl. 3 remote sessions)"}</span>
                            </div>
                            <div className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                {isZh ? "官方重點推薦 · 智慧體協同與遠端排障雙重保障" : "Recommended · Agent collaboration & remote troubleshooting guarantee"}
                            </div>

                            <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">{isZh ? "📦 交付效果" : "📦 Deliverables"}</div>
                                <ul className="mt-2 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">•</span>
                                        <div>
                                            <span><strong>{isZh ? "AutoDL 雲端 + 本地環境部署支援" : "AutoDL Cloud + Local environment deployment support"}</strong>{isZh ? "（要求 最低 Win10 / 視訊記憶體 > 12G 最佳）" : " (Requires Win10+ / VRAM > 12GB recommended)"}</span>
                                            <div className="mt-1.5 rounded-lg border border-stone-200 bg-stone-50/90 p-2 text-[11px] leading-relaxed text-stone-600 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400">
                                                {isZh ? <>💡 <strong>本地環境說明：</strong>本地能否跑通大模型由個人顯示卡配置決定。若電腦顯示卡視訊記憶體低於 12G 或系統低於 Win10，可直接無縫切換使用附贈的 AutoDL 雲端映象，兼顧體驗。</> : <>💡 <strong>Local Environment:</strong> Running models locally depends on GPU specs. If VRAM is below 12GB or system is below Win10, you can seamlessly switch to the included cloud image.</>}
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">•</span>
                                        <span><strong>{isZh ? "持續升級服務與作者微信優先答疑" : "Continuous updates & priority WeChat author support"}</strong>{isZh ? "（指令碼執行與報錯協助定位）" : " (Script execution & error diagnostics)"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">•</span>
                                        <span><strong>{isZh ? "增加 Workbuddy 的智慧體接入配置" : "Workbuddy desktop Agent integration setup"}</strong>{isZh ? "（端到端配通桌面 Agent 與無限畫布協同排程）" : " (End-to-end connection between desktop Agent and Infinite Canvas)"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">•</span>
                                        <span><strong>{isZh ? "增加遠端解決問題 3 次" : "3 remote troubleshooting sessions included"}</strong>{isZh ? "（遇到指令碼斷連/環境衝突/網路頑疾，遠端連線排查至解決）" : " (Remote diagnostics for script disconnection, environment conflicts, etc.)"}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{isZh ? "✅ 核心優勢" : "✅ Core Advantages"}</div>
                                <ul className="mt-2 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "享受 Workbuddy 智慧體接管畫布的高效創作體驗" : "Enjoy high-efficiency workflow with Workbuddy Agent taking over canvas"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "關鍵時刻專家遠端代連排查，3 次額度告別自查折磨" : "Expert remote assistance when it matters most, 3 sessions to skip headaches"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "持續升級服務與作者微信優先答疑雙重兜底" : "Dual peace-of-mind with ongoing updates and priority author WeChat Q&A"}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-rose-500">{isZh ? "⚠️ 服務邊界與注意" : "⚠️ Service Scope"}</div>
                                <ul className="mt-2 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "雲端算力平臺租金自行支付（1~N元/時）" : "Cloud compute fees paid separately to providers (¥1~N/hr)"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "遠端解決問題共 3 次額度，有效期 1 年" : "3 remote problem-solving sessions valid for 1 year"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "本地部署同樣要求 最低 Win10 / 視訊記憶體 > 12G 最佳" : "Local setup requires Win10+ and 12GB+ VRAM recommended"}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                type="primary"
                                size="large"
                                className="w-full !h-11 !font-semibold !bg-gradient-to-r !from-indigo-600 !via-purple-600 !to-indigo-600 hover:!from-indigo-500 hover:!to-purple-500 shadow-md shadow-indigo-500/25"
                                onClick={() => openContactModal(isZh ? "創作者服務包（¥119）" : "Creator Pack (¥119)")}
                            >
                                {isZh ? "立即獲取創作者服務包（¥119）" : "Get Creator Service Pack (¥119)"}
                            </Button>
                        </div>
                    </div>

                    {/* 方案 C: 1 對 1 專家遠端部署 (VIP 尊享款) */}
                    <div className="relative flex flex-col justify-between rounded-3xl border border-purple-200 bg-background p-6 shadow-sm sm:p-7 dark:border-purple-900/60">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                                    <Wrench className="size-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1.5">
                                        <span className="text-xl font-bold leading-tight text-stone-950 dark:text-stone-100">{isZh ? "1對1" : "1-on-1"}</span>
                                        <Tag color="purple" className="!mr-0 shrink-0">{isZh ? "包跑通退款" : "Guaranteed Delivery"}</Tag>
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight text-stone-950 dark:text-stone-100">{isZh ? "作者全包部署" : "Author 1-on-1 Setup"}</h3>
                                </div>
                            </div>

                            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                                {isZh ? <>追求極致省心的團隊與老闆首選。作者遠端全程代勞，定製調優，包跑通包教會。<strong className="font-semibold text-purple-600 dark:text-purple-400">支援本地部署資料更安全。</strong></> : <>Choice for teams and owners seeking zero hassle. Full remote setup, tuning, and guidance by author. <strong className="font-semibold text-purple-600 dark:text-purple-400">Local deployment supported for maximum data security.</strong></>}
                            </p>

                            <div className="mt-5 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold tracking-tight text-stone-950 dark:text-stone-100">¥299</span>
                                <span className="text-xs text-stone-500">{isZh ? "/ 次（含7天專屬技術售後）" : "/ session (incl. 7-day after-sales)"}</span>
                            </div>
                            <div className="mt-1 text-xs text-stone-400">
                                {isZh ? "承諾包跑通、包測試出圖，跑不通 100% 全額退款" : "Guaranteed successful run and test generations, or 100% full refund"}
                            </div>

                            <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">{isZh ? "📦 交付效果" : "📦 Deliverables"}</div>
                                <ul className="mt-2 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-purple-600 dark:text-purple-400">•</span>
                                        <span>{isZh ? "ToDesk / 向日葵一對一遠端全套環境代部署" : "ToDesk / AnyDesk 1-on-1 full remote environment setup"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-purple-600 dark:text-purple-400">•</span>
                                        <span>{isZh ? "顯示卡驅動、CUDA、ComfyUI 與無限畫布端到端聯調" : "GPU drivers, CUDA, ComfyUI and Infinite Canvas end-to-end tuning"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-purple-600 dark:text-purple-400">•</span>
                                        <span>{isZh ? "根據您的實際視訊記憶體針對性最佳化引數（防止爆視訊記憶體 OOM）" : "Parameter optimization tailored to your actual VRAM to prevent OOM"}</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="font-semibold text-purple-600 dark:text-purple-400">•</span>
                                        <span><strong>{isZh ? "贈送全年環境持續升級與作者微信答疑權益" : "Includes 1-year ongoing updates and author WeChat Q&A access"}</strong></span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{isZh ? "✅ 核心優勢" : "✅ Core Advantages"}</div>
                                <ul className="mt-2 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "完全零腦力負擔，任何環境衝突與疑難報錯專家搞定" : "Zero mental burden: expert handles all conflicts and obscure errors"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "包含 7 天技術指導與答疑群，不走彎路" : "Includes 7 days of technical guidance and group Q&A"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        <span>{isZh ? "支援定製多機器區域網共享部署與私有化諮詢" : "Supports multi-machine LAN sharing and private deployment consultation"}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                                <div className="text-xs font-semibold uppercase tracking-wider text-rose-500">{isZh ? "⚠️ 服務邊界與注意" : "⚠️ Service Scope"}</div>
                                <ul className="mt-2 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "需提前預約時間，遠端約需 40~90 分鐘" : "Requires appointment in advance, remote session takes ~40-90 mins"}</span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <XCircle className="size-3.5 text-stone-400 shrink-0" />
                                        <span>{isZh ? "單價相對較高，適合更重視時間成本的客戶" : "Higher price point, ideal for clients who prioritize saving time"}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                size="large"
                                className="w-full !h-11 !font-medium"
                                onClick={() => openContactModal(isZh ? "1對1 作者全包部署（¥299）" : "1-on-1 Author Deployment (¥299)")}
                            >
                                {isZh ? "預約作者遠端服務" : "Book Author Remote Service"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3. 產品交付全景橫向對比矩陣 (透明對比，增強信任) */}
                <div className="mt-16 overflow-hidden rounded-3xl border border-stone-200 bg-background shadow-sm dark:border-stone-800">
                    <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/50">
                        <h2 className="text-lg font-bold">{isZh ? "三款方案詳細橫向對比" : "Detailed Feature Comparison"}</h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{isZh ? "按需選擇，豐儉由人" : "Choose according to your needs"}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="border-b border-stone-100 bg-stone-50/40 text-xs font-semibold text-stone-500 dark:border-stone-800 dark:bg-stone-900/20 dark:text-stone-400">
                                <tr>
                                    <th className="py-3.5 pl-6 pr-3">{isZh ? "對比維度" : "Dimension"}</th>
                                    <th className="px-3 py-3.5">{isZh ? "極速體驗包" : "Free Trial"}</th>
                                    <th className="px-3 py-3.5 font-bold text-indigo-700 bg-indigo-500/10 dark:text-indigo-300 dark:bg-indigo-500/20">{isZh ? "創作者服務包 (重點推薦) 🔥" : "Creator Pack (Recommended) 🔥"}</th>
                                    <th className="px-3 py-3.5 text-purple-600 dark:text-purple-400">{isZh ? "1對1 作者全包" : "1-on-1 Author Setup"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-600 dark:divide-stone-800/60 dark:text-stone-300">
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "方案費用" : "Pricing"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{isZh ? "限時 ¥0.00 免費體驗" : "Free Trial (¥0.00)"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{isZh ? "¥119 / 年（含3次遠端）" : "¥119 / year (incl. 3 remote sessions)"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-purple-600 dark:text-purple-400">{isZh ? "¥299 / 次（包跑通）" : "¥299 / session (Guaranteed)"}</td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "執行環境支援" : "Environment Support"}</td>
                                    <td className="px-3 py-3.5 text-stone-600 dark:text-stone-400">{isZh ? "僅限雲端映象（LightCC / AutoDL，不含本地）" : "Cloud image only (LightCC / AutoDL)"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{isZh ? "AutoDL 雲端 + 本地部署（含 Workbuddy 接入）" : "AutoDL Cloud + Local (incl. Workbuddy)"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "工程師按需調優（雲端或本地）" : "Custom tuning by engineer (Cloud or Local)"}</td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "核心交付內容" : "Core Deliverables"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "官方雲端映象 + 免本地配置 + 3步接入指引" : "Official cloud image + Zero setup + 3-step guide"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-indigo-700 dark:text-indigo-300">{isZh ? "雲端+本地全套 + Workbuddy 智慧體配置 + 3 次遠端解決問題" : "Cloud + Local setup + Workbuddy Agent + 3 remote sessions"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "遠端端到端調通 + 視訊記憶體調優 + 贈持續升級與答疑" : "Full remote delivery + VRAM tuning + Ongoing updates & Q&A"}</td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "技術支援服務" : "Technical Support"}</td>
                                    <td className="px-3 py-3.5 text-stone-400">{isZh ? "僅限文件自查（不提供人工技術支援）" : "Doc self-service only (no human support)"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{isZh ? "作者微信優先答疑 + 3 次專家遠端連線解決問題" : "Priority WeChat Q&A + 3 remote troubleshooting sessions"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-purple-600 dark:text-purple-400">{isZh ? "1對1 遠端代勞協助 + 7天專屬技術售後" : "1-on-1 remote setup + 7-day dedicated after-sales"}</td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "智慧體協同接入" : "Agent Integration"}</td>
                                    <td className="px-3 py-3.5 text-stone-400">—</td>
                                    <td className="px-3 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{isZh ? "提供 Workbuddy 桌面智慧體接入配置與直連除錯" : "Workbuddy desktop Agent configuration & debugging"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "按需配置全套智慧體協同" : "Configures full Agent collaboration on demand"}</td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "版本更新跟進" : "Updates & Upgrades"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "自行對照文件手動升級" : "Manual upgrades via docs"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{isZh ? "持續升級服務，提供環境版本維護更新" : "Continuous upgrade service & environment maintenance"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "同步享有持續升級服務與環境維護" : "Includes continuous upgrade service and maintenance"}</td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 pl-6 pr-3 font-medium text-stone-900 dark:text-stone-100">{isZh ? "售後與保障" : "Guarantee"}</td>
                                    <td className="px-3 py-3.5">{isZh ? "公開免費文件，雲端按需開機體驗" : "Free documentation, pay-as-you-go cloud trial"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{isZh ? "3 次遠端問題解決，額度有效期 1 年" : "3 remote problem resolutions, valid for 1 year"}</td>
                                    <td className="px-3 py-3.5 font-semibold text-purple-600 dark:text-purple-400">{isZh ? "承諾包跑通包出圖，跑不通全額退款" : "Guaranteed delivery or 100% full refund"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. 為什麼極速體驗包限時 0.00 元且不提供人工支援？（坦誠告知：關於人力成本與持續維護） */}
                <div className="mt-16 rounded-3xl border border-stone-200 bg-stone-50/70 p-6 sm:p-10 dark:border-stone-800 dark:bg-stone-900/50">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-background px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300">
                            <Heart className="size-3.5 text-rose-500 fill-rose-500" />
                            <span>{isZh ? "坦誠告知 · 關於極低體驗價與服務邊界的真心話" : "Transparent Notice · Honest talk about free trial & boundaries"}</span>
                        </div>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-950 dark:text-stone-100 sm:text-3xl">
                            {isZh ? "為什麼極速體驗包限時 0.00 元？為什麼不提供人工支援？" : "Why is the Free Trial ¥0.00? Why is there no human support?"}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                            {isZh ? <>《無限畫布》前端程式碼與文件 100% 保持開源免費。為了讓每一位沒有高階顯示卡的創作者都能以零門檻體驗 ComfyUI 大模型，<strong>作者已在 LightCC 與 AutoDL 平臺部署官方預裝映象，並實行限時 0.00 元免費開放使用</strong>（您只需按需支付雲算力平臺每小時幾毛到 1~2 元的 GPU 機器租金，LightCC 註冊還送 3 元體驗券可免費體驗 1 小時 5090）。同時，由於該方案屬於完全免費的社群自助福利、無法覆蓋工程師一對一排障的人力時間成本，因此該方案嚴格僅限文件自查、不提供人工答疑支援；若您需要作者微信優先答疑、Workbuddy 智慧體接入與 3 次遠端排障請選 ¥119 服務包，需要專家全程代勞請選 ¥299 遠端服務。</> : <>Infinite Canvas frontend code and docs are 100% open-source and free. To let creators without expensive GPUs experience ComfyUI, <strong>we deployed official mirrors on LightCC & AutoDL for free access</strong>. Because this is a free community benefit, it cannot cover 1-on-1 human troubleshooting. For author WeChat support & 3 remote sessions, please choose the ¥119 pack; for full hands-free setup, choose the ¥299 VIP service.</>}
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200/80 bg-background p-5 dark:border-stone-800">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <Database className="size-5" />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-stone-900 dark:text-stone-100">{isZh ? "1. 作者自費部署雲映象，限時 0 元回饋社群" : "1. Official Cloud Mirrors Free for Community"}</h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? <>一個包含 5 大核心外掛、MiniMax H3、Flux 等全模態權重的完整 ComfyUI 映象體積高達 <strong>80GB ~ 120GB</strong>。作者已將其預裝併發布至平臺映象市場，免去大家本地配置之苦，開機即可直連畫布體驗。</> : <>A full ComfyUI image with 5 core plugins and multimodality models is 80GB~120GB. Pre-installed and ready to launch in seconds.</>}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-stone-200/80 bg-background p-5 dark:border-stone-800">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <RefreshCw className="size-5" />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-stone-900 dark:text-stone-100">{isZh ? "2. ComfyUI 頻繁破壞性更新" : "2. Frequent Breaking Updates in ComfyUI"}</h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? "開源 AI 社群日新月異，ComfyUI 官方、底層 PyTorch 與第三方外掛每週都在升級，極易造成舊工作流紅字報錯。我們需要持續投入真機環境進行迴歸測試、修補相容性，並重制穩定映象。" : "ComfyUI, PyTorch and extensions update weekly, easily causing breaking workflow errors. We continuously test and maintain stable images."}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-stone-200/80 bg-background p-5 dark:border-stone-800">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <Server className="size-5" />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-stone-900 dark:text-stone-100">{isZh ? "3. 以服務養開源，拒絕牛皮癬廣告" : "3. Supporting Open Source via Services, No Ads"}</h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? "我們堅持前端介面零彈窗、零廣告植入，純粹為創作者提供極致生產力體驗。通過為需要節省時間的同學提供經過嚴格測試的標準化映象與專業部署服務，收取的適量費用全部用於支撐算力與專案長久發展。" : "Zero popups, zero intrusive ads. Modest service fees support compute and long-term development of Infinite Canvas."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 5. 常見問題 FAQ */}
                <div className="mt-16">
                    <h2 className="text-center text-2xl font-bold">{isZh ? "常見疑問解答 (FAQ)" : "Frequently Asked Questions (FAQ)"}</h2>
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-emerald-500" />
                                {isZh ? "極速體驗包真的限時 0.00 元嗎？還需要支付其他費用嗎？" : "Is the Free Trial really ¥0.00? Are there other costs?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? <><strong>映象本身限時 0.00 元免費開放使用，無需向我們支付任何費用，僅需按需自付雲平臺的 GPU 算力租金。</strong>作者已在 LightCC 和 AutoDL 平臺部署好預裝環境，開機後直接將地址填入畫布即可使用。通過推薦連結註冊 LightCC 還贈送 3 元算力券，可免費體驗 RTX 5090 一小時。使用完畢請及時關機避免產生額外費用。極速體驗包不包含人工答疑支援，遇到問題請嚴格對照文件自查；若需本地環境部署、微信答疑與遠端排障請選 ¥119 服務包，需專家全程代勞請選 ¥299 專家部署。</> : <><strong>The image itself is completely free. You only pay for hourly GPU compute to cloud providers.</strong> Pre-installed on LightCC and AutoDL. Registered users receive free compute vouchers. Please shut down instances when finished.</>}
                            </p>
                        </Card>

                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-indigo-500" />
                                {isZh ? "方案眾多，為什麼官方重點推薦「創作者服務包（¥119）」？" : "Why is the Creator Pack (¥119) the top recommendation?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? <>0 元體驗包僅限文件自查，遇到深層系統與網路報錯缺乏專家支援。<strong>¥119 創作者服務包</strong>全面支援雲端+本地環境部署，獨家配通 <strong>Workbuddy 桌面智慧體接管畫布</strong>，更贈送 <strong>3 次專家遠端代連排障兜底</strong>與作者微信優先答疑，兼具生產力與疑難排錯雙重兜底，是 80% 創作者與工作室的重點推薦款。</> : <>The free trial relies on documentation self-checks. The <strong>¥119 pack</strong> supports local and cloud setups, includes <strong>Workbuddy Agent integration</strong>, <strong>3 remote troubleshooting sessions</strong>, and priority WeChat author Q&A.</>}
                            </p>
                        </Card>

                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-blue-500" />
                                {isZh ? "創作者服務包（¥119）與 1 對 1 專家全包部署（¥299）有什麼區別？該如何選？" : "What is the difference between ¥119 and ¥299 options?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? <><strong>¥119 服務包</strong>適合希望自己掌握部署與更新，同時享有<strong>作者微信答疑指導與 3 次遠端解決問題兜底</strong>的創作者，還獨家包含 Workbuddy 智慧體接入；<strong>¥299 專家全包部署</strong>則適合追求極致省心、時間寶貴的使用者，由工程師直接遠端一對一全流程代勞調通並做視訊記憶體深度調優，包跑通包出圖。</> : <>The <strong>¥119 pack</strong> is great for creators who want author guidance and 3 remote safety nets. The <strong>¥299 VIP option</strong> is for teams seeking complete peace of mind, where the author handles everything 1-on-1 remotely.</>}
                            </p>
                        </Card>

                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-blue-500" />
                                {isZh ? "如果我使用 0 元極速體驗包，遇到部署報錯怎麼處理？" : "What if I encounter errors while using the Free Trial?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? "隨包附帶了保姆級 3 步接入指南與《常見報錯排查自救指南》（涵蓋 90% 的網路超時、埠複製、連線測試等問題）。請先嚴格對照文件自查排錯；若嘗試後希望徹底省心，可隨時升級為 ¥119 創作者服務包（含微信答疑與 3 次遠端排障）或 ¥299 專家 1 對 1 遠端代勞服務。" : "The trial includes step-by-step setup and troubleshooting guides. For author Q&A and remote diagnostics, you can upgrade to the ¥119 or ¥299 packages anytime."}
                            </p>
                        </Card>

                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-blue-500" />
                                {isZh ? "我是蘋果 Mac 電腦（M1/M2/M3），能不能用？" : "Can I use an Apple Mac (M1/M2/M3)?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? "強烈推薦！Mac 電腦本地跑 ComfyUI 大模型速度較慢且不支援諸多 CUDA 加速節點；通過我們的 LightCC / AutoDL 雲端映象，Mac 只需要開啟瀏覽器即可遠端享用 24G 頂級 Nvidia 顯示卡算力，體驗絲滑流暢。" : "Highly recommended! Mac can harness 24GB top Nvidia GPU power simply through browser via our cloud mirrors, running smoothly without heating."}
                            </p>
                        </Card>

                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-blue-500" />
                                {isZh ? "1 對 1 專家部署如果不成功會退款嗎？" : "Will I be refunded if 1-on-1 deployment fails?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? <>承諾<strong>包跑通、包測試出圖</strong>。若因您的電腦硬體嚴重損壞或不可抗力導致確實無法跑通，承諾 100% 全額退款，無任何後顧之憂。</> : <>We guarantee <strong>successful setup and test generations</strong>. If hardware issues prevent completion, we offer a 100% full refund.</>}
                            </p>
                        </Card>

                        <Card className="!rounded-2xl dark:!border-stone-800 dark:!bg-stone-900/40">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <HelpCircle className="size-4 text-blue-500" />
                                {isZh ? "為什麼雲端 GPU 只要 1~2 塊錢一小時？" : "Why is cloud GPU only ¥1~2 per hour?"}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                {isZh ? "我們對接的是國內主流的彈性 GPU 算力平臺（如 AutoDL 等）。平臺採用按使用分鐘計費模式，不用時隨時關機停止計費。跑幾百張圖通常只需幾十分鐘，摺合下來成本極其低廉，相比自己花 1.5 萬元買高階顯示卡更划算。" : "Cloud compute platforms bill per minute of actual usage. Generating images takes minutes, making it far more economical than buying a ¥15,000 GPU."}
                            </p>
                        </Card>
                    </div>
                </div>

                {/* 5. 底部諮詢引導 Banner */}
                <div className="mt-16 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 p-8 text-center text-white shadow-xl dark:from-stone-800 dark:to-stone-900">
                    <h3 className="text-2xl font-bold">{isZh ? "還有其他定製需求或企業級私有化疑問？" : "Have other custom needs or enterprise questions?"}</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-stone-300">
                        {isZh ? "無論是區域網多機共享、公司設計工作流接入，還是指定私有模型定製，歡迎新增微信直接交流。" : "Whether for LAN multi-machine sharing, company workflow integration, or custom model setup, feel free to connect via WeChat."}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button
                            type="primary"
                            size="large"
                            className="!h-10 !px-6"
                            onClick={() => {
                                setActiveContactTab("wechat");
                                openContactModal(isZh ? "專屬微信諮詢" : "WeChat Consultation");
                            }}
                        >
                            {isZh ? "掃碼新增微信諮詢" : "Scan WeChat for Inquiry"}
                        </Button>
                        <Button
                            size="large"
                            className="!h-10 !px-6 !text-white !border-stone-600 hover:!border-white"
                            onClick={() => {
                                setActiveContactTab("douyin");
                                openContactModal(isZh ? "抖音官方教程關注" : "Douyin Tutorial Follow");
                            }}
                        >
                            {isZh ? "關注抖音官方賬號" : "Follow Douyin Official"}
                        </Button>
                        <Button
                            size="large"
                            className="!h-10 !px-6 !text-white !border-stone-600 hover:!border-white"
                            onClick={() => copyText(CONTACT_INFO.wechat.wechatId, isZh ? `已複製微訊號: ${CONTACT_INFO.wechat.wechatId}` : `Copied WeChat ID: ${CONTACT_INFO.wechat.wechatId}`)}
                        >
                            {isZh ? "一鍵複製微訊號" : "Copy WeChat ID"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 諮詢與掃碼彈窗（微信 + 抖音雙通道） */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-base font-bold">
                        {activeContactTab === "wechat" ? (
                            <>
                                <MessageSquare className="size-5 text-emerald-500" />
                                <span>{isZh ? "微信掃碼諮詢與專屬服務" : "WeChat Consultation & Service"}</span>
                            </>
                        ) : (
                            <>
                                <Video className="size-5 text-rose-500" />
                                <span>{isZh ? "抖音掃碼關注官方教程 (@同學你好)" : "Scan Douyin for Official Tutorials"}</span>
                            </>
                        )}
                    </div>
                }
                open={qrModalOpen}
                onCancel={() => setQrModalOpen(false)}
                footer={null}
                centered
                destroyOnHidden
            >
                <div className="py-2 text-center">
                    <div className="mb-4 flex justify-center">
                        <Segmented
                            value={activeContactTab}
                            onChange={(val) => setActiveContactTab(val as "wechat" | "douyin")}
                            options={[
                                {
                                    label: isZh ? "微信諮詢與購買" : "WeChat Consultation",
                                    value: "wechat",
                                    icon: <MessageSquare className="size-3.5 inline mr-1 text-emerald-500" />,
                                },
                                {
                                    label: isZh ? "抖音關注官方號" : "Follow Douyin",
                                    value: "douyin",
                                    icon: <Video className="size-3.5 inline mr-1 text-rose-500" />,
                                },
                            ]}
                        />
                    </div>

                    <Tag color={activeContactTab === "wechat" ? "blue" : "magenta"} className="mb-3">
                        {activeContactTab === "wechat" ? (isZh ? `當前諮詢意向：${selectedPlan}` : `Inquiry: ${selectedPlan}`) : (isZh ? "關注抖音獲取第一手 ComfyUI 影片實操" : "Follow Douyin for ComfyUI video demos")}
                    </Tag>

                    {activeContactTab === "wechat" ? (
                        <div>
                            {/* 微信二維碼容器 */}
                            <div className="mx-auto flex size-60 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
                                <div className="relative flex size-44 flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-inner dark:bg-stone-900">
                                    <img
                                        src={CONTACT_INFO.wechat.qrPath}
                                        alt={isZh ? "微信二維碼" : "WeChat QR Code"}
                                        className="size-full object-contain"
                                        onError={(e) => {
                                            // 圖片尚未存在時顯示佔位
                                            e.currentTarget.style.display = "none";
                                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = "flex";
                                        }}
                                    />
                                    <div className="hidden flex-col items-center justify-center text-center">
                                        <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                                            <MessageSquare className="size-8" />
                                        </div>
                                        <span className="mt-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
                                            {isZh ? "微信二維碼待放入" : "WeChat QR Code Placeholder"}
                                        </span>
                                        <span className="mt-1 text-[11px] text-stone-400">
                                            {isZh ? "可直接複製微訊號新增" : "Copy WeChat ID below directly"}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                                    {isZh ? "微信掃一掃上方二維碼新增好友" : "Scan QR code above on WeChat to add friend"}
                                </p>
                            </div>

                            {/* 微訊號一鍵複製 */}
                            <div className="mx-auto mt-4 flex max-w-xs items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800">
                                <span className="text-stone-500 dark:text-stone-400">{isZh ? "微訊號：" : "WeChat ID: "}</span>
                                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                                    {CONTACT_INFO.wechat.wechatId}
                                </span>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded bg-stone-200 px-2 py-1 text-[11px] font-medium text-stone-800 transition hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                                    onClick={() => copyText(CONTACT_INFO.wechat.wechatId, `已複製微訊號: ${CONTACT_INFO.wechat.wechatId}`)}
                                >
                                    <Copy className="size-3" />
                                    <span>{isZh ? "複製" : "Copy"}</span>
                                </button>
                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                                💡 {CONTACT_INFO.wechat.tip}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* 抖音二維碼展示 */}
                            <div className="mx-auto flex size-60 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
                                <div className="flex size-44 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-inner dark:bg-stone-900">
                                    <img
                                        src={CONTACT_INFO.douyin.qrPath}
                                        alt={isZh ? "抖音二維碼" : "Douyin QR Code"}
                                        className="size-full object-contain"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                                    {isZh ? "開啟抖音 App 搜尋頁掃一掃" : "Open Douyin App and scan QR code"}
                                </p>
                            </div>

                            {/* 抖音號一鍵複製 */}
                            <div className="mx-auto mt-4 flex max-w-xs items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800">
                                <span className="text-stone-500 dark:text-stone-400">{isZh ? `抖音號 (${CONTACT_INFO.douyin.name})：` : `Douyin (${CONTACT_INFO.douyin.name}): `}</span>
                                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                                    {CONTACT_INFO.douyin.douyinId}
                                </span>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1 rounded bg-stone-200 px-2 py-1 text-[11px] font-medium text-stone-800 transition hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                                    onClick={() => copyText(CONTACT_INFO.douyin.douyinId, isZh ? `已複製抖音號: ${CONTACT_INFO.douyin.douyinId}` : `Copied Douyin ID: ${CONTACT_INFO.douyin.douyinId}`)}
                                >
                                    <Copy className="size-3" />
                                    <span>複製</span>
                                </button>
                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                🎬 {CONTACT_INFO.douyin.tip}
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </main>
    );
}
