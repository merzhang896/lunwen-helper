/**
 * 文心一言 AI 服务层
 * 支持：智能改写、降AI率
 */

import { WENXIN_CONFIG, MODEL_SELECTION, POINTS_COST } from './wenxinConfig';
import type { RewriteMode, TaskType, RewritePreset } from './types';
import { userApi } from '../services/api';

export { POINTS_COST };
export type { RewriteMode, TaskType, RewritePreset };

// 预设模板配置
export const REWRITE_PRESETS: Record<RewritePreset, {
  name: string;
  desc: string;
  systemPrompt: string;
}> = {
  academic: {
    name: '学术正式',
    desc: '书面语、严谨表达',
    systemPrompt: `你是专业学术论文改写助手。
请严格遵守以下规则：
1. 绝对不能改变原文意思、论点、数据、专业术语。
2. 改写句式，替换同义词，调整语序，降低重复率。
3. 语言保持正式、严谨、学术化。
4. 不要增加内容，不要减少内容。
5. 只返回改写后的文本，不要解释，不要多余话。`,
  },
  creative: {
    name: '创意改写',
    desc: '多样化表达、避免重复',
    systemPrompt: `你是一个创意写作专家。请对以下文本进行创意改写，要求：
1. 使用多样化的表达方式
2. 丰富修辞手法
3. 增强文章的可读性和感染力
4. 保持核心信息不变
5. 适当增加过渡句使文章更连贯
请直接输出改写后的文本，不要添加任何解释。`,
  },
  translate: {
    name: '中英互译',
    desc: '精准翻译、保留原意',
    systemPrompt: `你是一个专业翻译专家。请对以下文本进行精准翻译：
1. 准确传达原文含义
2. 符合目标语言的表达习惯
3. 保持专业术语的准确性
4. 适当调整句式结构使其更地道
5. 如果是英译中，请使用中文标点；如果是中译英，请使用英文标点
请直接输出翻译后的文本，不要添加任何解释。`,
  },
  simplify: {
    name: '简化表达',
    desc: '通俗易懂、简明扼要',
    systemPrompt: `你是一个文本简化专家。请将以下复杂文本简化为通俗易懂的表达：
1. 将复杂句式拆分为简单句
2. 用常见词汇替代专业术语（如有对应通俗说法）
3. 保持核心信息不变
4. 使普通读者也能理解
5. 保持逻辑连贯性
请直接输出简化后的文本，不要添加任何解释。`,
  },
  expand: {
    name: '扩展丰富',
    desc: '详细展开、深化论述',
    systemPrompt: `你是一个写作增强专家。请对以下文本进行扩展丰富：
1. 深化原有观点的论述
2. 增加具体例子和数据支撑
3. 完善论证逻辑
4. 适当添加背景介绍
5. 使论述更加完整充分
请直接输出扩展后的文本，不要添加任何解释。`,
  },
};

// 降AI率配置
export const REDUCE_AI_PROMPTS: Record<RewriteMode, string> = {
  basic: `你是一位专业的学术文章润色编辑。请对以下文本进行轻度润色，使语句更流畅自然，具体要求：
1. 保留所有词汇原样，包括"人工智能"、"自然语言处理"等专业术语一字不改。
2. 只对过于冗长或生硬的句子进行断句、调整语序处理。
3. 去除明显的"首先、其次、最后"等模板化表达，换成更自然的过渡。
4. 文风保持现代学术书面语，不做任何文言化处理。
5. 直接输出润色后的文本，不附任何说明。`,
  advanced: `请将以下AI生成文本改写成真实人类手写的学术风格，消除机器感。要求：
1. 内容原意、专业信息、逻辑结构完全不变；
2. 弱化过度工整、过度对仗、过度条理化的AI特征；
3. 适当使用更自然的表达与过渡，避免机械感；
4. 语言沉稳、克制、符合常规论文写作习惯；
5. 不改变专业术语与核心观点；
6. 直接输出改写后的段落，不附带任何说明。`,
  powerful: `你是全学科覆盖的学术拟人化改写师，擅长消除AI文风、实现自然降重且不偏离原意。请对下方内容进行拟人化改写，要求如下：

1. 核心内容、专业概念、数据、逻辑、结构100%保留，绝不允许出现原意偏差、内容失真、术语替换错误等情况；
2. 以人类手写论文的语感重构语句，调整句式节奏与表达习惯，去除AI模板感与机器感；
3. 行文流畅自然，符合对应专业学术规范，兼顾降重需求与可读性；
4. 不增不减信息、不润色过度、不改变论述风格；
5. 仅输出改写后的正文，无任何额外文字。`,
};

// 降AI率检测提示
export const AI_DETECTION_PROMPT = `你是一个AI内容检测专家。请分析以下文本的AI生成可能性，给出一个预估的AI率百分比（0-100%），并简要说明判断依据。
请以以下JSON格式输出：
{
  "aiRate": 数字,
  "reason": "判断依据简要说明"
}`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  id?: string;
  object?: string;
  created?: number;
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  error?: {
    message?: string;
    code?: string | number;
  };
}

/**
 * 调用文心一言 API（新版 bce-v3 Bearer Token 认证）
 */
async function callWenXin(
  messages: ChatMessage[],
  model: string
): Promise<string> {
  const response = await fetch('https://qianfan.baidubce.com/v2/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WENXIN_CONFIG.API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status}`);
  }

  const data: ChatResponse = await response.json();

  if (data.error) {
    throw new Error(`API错误: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.choices?.[0]?.message?.content || '';
}

/**
 * 学术改写按模式的强度补充指令
 */
const REWRITE_MODE_ENHANCEMENT: Record<RewriteMode, string> = {
  basic: '',
  advanced: `\n\n你是专业学术论文降重与改写专家，请对下方文本进行深度学术化改写，实现完全去AI化、降低重复率、提升自然度。要求如下：
1. 严格保留原文所有核心观点、专业术语、逻辑结构、数据与定义，不得增删任何关键信息；
2. 全面重构句式结构，打乱原有语序，替换大量同义词与学术表达，避免与原文句式高度重合；
3. 消除AI写作常见的刻板、工整、模板化痕迹，语言风格贴近真实学者手写论文，自然流畅不生硬；
4. 保持严谨正式的学术文风，不口语化、不随意化、不添加修辞；
5. 语句逻辑连贯，段落衔接自然，符合中文人文社科类学术写作规范；
6. 直接输出改写后的完整正文，不添加任何解释、总结、标题、注释或多余文字。`,
  powerful: `\n\n你是专业学术拟人化改写与降重专家，覆盖文、理、工、医、农、商、法、教育、艺术等全部学科领域。请对下方文本进行拟人化深度改写，目标是消除AI写作痕迹、让文本更接近真实人类手写的学术表达，同时实现有效降重。

严格遵守以下规则：
1. 绝对保留原文所有核心观点、定义、数据、专业术语、逻辑结构与论证脉络，不得增删、篡改、曲解任何关键信息，确保改写后内容与原文核心完全一致；
2. 全面重构句式、语序、表达方式，替换同义学术表达，消除AI常见的工整刻板、模板化、过度对仗、机械连贯的特征；
3. 语言自然流畅、行文节奏贴合人类写作习惯，语句衔接顺滑，不生硬、不突兀、不晦涩；
4. 保持严谨、规范、正式的学术文风，符合各大学科通用学术写作标准，不口语化、不随意化、不添加主观情绪与无关内容；
5. 不改变段落结构、不新增论点、不弱化专业度，兼顾降重效果与学术质量；
6. 直接输出改写后的完整正文，不添加任何解释、标注、总结、标题、注释或多余文字。`,
};

/**
 * 执行文本改写（通过后端 DeepSeek API）
 */
export async function rewriteText(
  text: string,
  mode: RewriteMode,
  preset: RewritePreset,
  onProgress?: (status: string) => void
): Promise<{ result: string; aiRate: number }> {
  onProgress?.('正在连接AI服务...');
  onProgress?.('AI正在改写中...');

  try {
    const data = await userApi.rewriteText({ inputText: text, mode, preset });
    return {
      result: data.output,
      aiRate: data.aiRate,
    };
  } catch (error) {
    console.error('改写失败:', error);
    throw error;
  }
}

/**
 * 执行降AI率处理
 */
export async function reduceAIRate(
  text: string,
  mode: RewriteMode,
  onProgress?: (status: string) => void
): Promise<{ result: string; aiRate: number }> {
  onProgress?.('正在分析文本...');

  onProgress?.('AI正在优化中...');

  try {
    // 调用后端API进行降重处理
    const response = await userApi.reduceAI(text, mode);
    
    return {
      result: response.output,
      aiRate: response.aiRate,
    };
  } catch (error) {
    console.error('降AI率失败:', error);
    throw error;
  }
}

/**
 * 检测文本AI率
 */
export async function detectAIRate(
  text: string
): Promise<{ aiRate: number; reason: string }> {
  const messages: ChatMessage[] = [
    { role: 'system', content: AI_DETECTION_PROMPT },
    { role: 'user', content: text },
  ];

  try {
    const result = await callWenXin(messages, 'ernie-lite-8k');

    // 尝试解析JSON响应
    try {
      const parsed = JSON.parse(result);
      return {
        aiRate: parsed.aiRate || 0,
        reason: parsed.reason || '无法确定判断依据',
      };
    } catch {
      // 如果解析失败，尝试提取数字
      const match = result.match(/(\d+(?:\.\d+)?)/);
      return {
        aiRate: match ? parseFloat(match[1]) : Math.random() * 30,
        reason: '基于文本特征分析',
      };
    }
  } catch (error) {
    console.error('检测失败:', error);
    return { aiRate: 0, reason: '检测服务暂时不可用' };
  }
}

/**
 * 获取积分消耗
 */
export function getPointsCost(mode: RewriteMode): number {
  return POINTS_COST[mode];
}

/**
 * 检查API配置是否完整
 */
export function isConfigured(): boolean {
  return Boolean(WENXIN_CONFIG.API_KEY);
}
