import { describe, expect, it } from "vitest";

import { getGroupResourceNodes } from "@/lib/canvas/canvas-resource-references";
import {
    CanvasNodeType,
    type CanvasNodeData,
    type CanvasNodeMetadata,
    type CanvasNodeTypeId,
} from "@/types/canvas";

/** 最小節點工廠：補齊 CanvasNodeData 必填欄位，測試只需傳 id / type / metadata。 */
function makeNode(id: string, type: CanvasNodeTypeId, metadata?: CanvasNodeMetadata): CanvasNodeData {
    return {
        id,
        type,
        title: id,
        position: { x: 0, y: 0 },
        width: 0,
        height: 0,
        metadata,
    };
}

describe("getGroupResourceNodes", () => {
    it("遞迴展開兩層巢狀 Group，返回有內容的 image/text/video/audio 資源，忽略空資源", () => {
        const nodes: CanvasNodeData[] = [
            makeNode("root", CanvasNodeType.Group),
            makeNode("image-a", CanvasNodeType.Image, { content: "data:image/png;base64,a", groupId: "root" }),
            makeNode("sub", CanvasNodeType.Group, { groupId: "root" }),
            makeNode("image-b", CanvasNodeType.Image, { content: "data:image/png;base64,b", groupId: "sub" }),
            makeNode("video-b", CanvasNodeType.Video, { content: "video-b", groupId: "sub" }),
            makeNode("audio-b", CanvasNodeType.Audio, { content: "audio-b", groupId: "sub" }),
            makeNode("text-a", CanvasNodeType.Text, { content: "text-a", groupId: "root" }),
            // 空資源：無 content / prompt，應被忽略
            makeNode("image-empty", CanvasNodeType.Image, { groupId: "root" }),
            makeNode("text-empty", CanvasNodeType.Text, { groupId: "sub" }),
        ];

        const result = getGroupResourceNodes("root", nodes);

        expect(result.map((n) => n.id)).toEqual(["image-a", "image-b", "video-b", "audio-b", "text-a"]);

        // image / text / video / audio 四類資源均被返回
        const kinds = new Set(result.map((n) => n.type));
        expect(kinds.has(CanvasNodeType.Image)).toBe(true);
        expect(kinds.has(CanvasNodeType.Text)).toBe(true);
        expect(kinds.has(CanvasNodeType.Video)).toBe(true);
        expect(kinds.has(CanvasNodeType.Audio)).toBe(true);

        // 空資源不在結果中
        const ids = result.map((n) => n.id);
        expect(ids).not.toContain("image-empty");
        expect(ids).not.toContain("text-empty");
    });

    it("groupId 互相包含形成迴圈時不會無限遞迴，且資源不重複", () => {
        // group-a 與 group-b 互為對方的子 Group：
        // 節點 "group-a" 屬於組 "group-b"，節點 "group-b" 屬於組 "group-a"
        const nodes: CanvasNodeData[] = [
            makeNode("group-a", CanvasNodeType.Group, { groupId: "group-b" }),
            makeNode("group-b", CanvasNodeType.Group, { groupId: "group-a" }),
            makeNode("res-a", CanvasNodeType.Image, { content: "data:image/png;base64,ra", groupId: "group-a" }),
            makeNode("res-b", CanvasNodeType.Video, { content: "video-b", groupId: "group-b" }),
        ];

        // 若存在無限遞迴將丟擲 RangeError（呼叫棧溢位）；能正常返回即說明環已被 visitedGroups 打斷
        const result = getGroupResourceNodes("group-a", nodes);

        const ids = result.map((n) => n.id);
        expect(ids).toContain("res-a");
        expect(ids).toContain("res-b");
        expect(result).toHaveLength(2);
        // 無重複：去重後數量不變
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("結果順序按深度優先，且每層保持 nodes 原始順序", () => {
        // root 層原始順序：sub(Group) → a1(Image) → a2(Video)
        // sub 層原始順序：s1a(Text) → s1b(Audio)
        const nodes: CanvasNodeData[] = [
            makeNode("root", CanvasNodeType.Group),
            makeNode("sub", CanvasNodeType.Group, { groupId: "root" }),
            makeNode("s1a", CanvasNodeType.Text, { content: "s1a", groupId: "sub" }),
            makeNode("s1b", CanvasNodeType.Audio, { content: "audio-s1b", groupId: "sub" }),
            makeNode("a1", CanvasNodeType.Image, { content: "data:image/png;base64,a1", groupId: "root" }),
            makeNode("a2", CanvasNodeType.Video, { content: "video-a2", groupId: "root" }),
        ];

        const result = getGroupResourceNodes("root", nodes);

        // 深度優先：先完整遍歷 sub 子樹（s1a、s1b 按原始順序），
        // 再回到 root 層按原始順序繼續（a1、a2）——區別於廣度優先或“資源優先”的順序
        expect(result.map((n) => n.id)).toEqual(["s1a", "s1b", "a1", "a2"]);
    });
});
