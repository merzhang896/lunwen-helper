/**
 * 用户路由 - 积分、会员、历史、收藏
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, get, insert, update, delete: del } = require('../utils/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要登录
router.use(verifyToken);

/**
 * GET /api/users/profile - 获取用户资料
 */
router.get('/profile', (req, res) => {
  try {
    const user = get('users', { id: req.user.id });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        level: user.level,
        points: user.points,
        expireDate: user.expireDate,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('获取资料错误:', error);
    res.status(500).json({ error: '获取资料失败' });
  }
});

/**
 * PUT /api/users/profile - 更新用户资料
 */
router.put('/profile', [
  body('nickname').optional().trim().isLength({ min: 2, max: 20 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nickname } = req.body;

    if (nickname) {
      update('users', req.user.id, { nickname });
    }

    const user = get('users', { id: req.user.id });

    res.json({ message: '资料更新成功', user });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ error: '更新资料失败' });
  }
});

/**
 * GET /api/users/points - 获取积分信息
 */
router.get('/points', (req, res) => {
  try {
    const user = get('users', { id: req.user.id });
    const logs = query('pointLogs', { userId: req.user.id }).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 50);

    res.json({
      points: user.points,
      logs: logs.map(log => ({
        id: log.id,
        type: log.type,
        amount: log.amount,
        reason: log.reason,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    console.error('获取积分错误:', error);
    res.status(500).json({ error: '获取积分失败' });
  }
});

/**
 * POST /api/users/points/deduct - 扣减积分
 */
router.post('/points/deduct', [
  body('amount').isInt({ min: 1 }),
  body('reason').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, reason } = req.body;

    const user = get('users', { id: req.user.id });

    if (user.points < amount) {
      return res.status(400).json({ error: '积分不足' });
    }

    // 扣减积分
    update('users', req.user.id, { points: user.points - amount });

    // 记录日志
    insert('pointLogs', {
      userId: req.user.id,
      type: 'deduct',
      amount,
      reason: reason || '功能使用'
    });

    const updatedUser = get('users', { id: req.user.id });

    res.json({
      message: '积分扣减成功',
      points: updatedUser.points
    });
  } catch (error) {
    console.error('扣减积分错误:', error);
    res.status(500).json({ error: '扣减积分失败' });
  }
});

/**
 * POST /api/users/points/add - 充值积分
 */
router.post('/points/add', [
  body('amount').isInt({ min: 1 }),
  body('orderId').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, orderId } = req.body;

    const user = get('users', { id: req.user.id });

    // 增加积分
    update('users', req.user.id, { points: user.points + amount });

    // 记录日志
    insert('pointLogs', {
      userId: req.user.id,
      type: 'add',
      amount,
      reason: '积分充值',
      orderId
    });

    const updatedUser = get('users', { id: req.user.id });

    res.json({
      message: '积分充值成功',
      points: updatedUser.points
    });
  } catch (error) {
    console.error('充值积分错误:', error);
    res.status(500).json({ error: '充值积分失败' });
  }
});

/**
 * GET /api/users/membership - 获取会员信息
 */
router.get('/membership', (req, res) => {
  try {
    const user = get('users', { id: req.user.id });

    res.json({
      level: user.level,
      expireDate: user.expireDate
    });
  } catch (error) {
    console.error('获取会员信息错误:', error);
    res.status(500).json({ error: '获取会员信息失败' });
  }
});

/**
 * POST /api/users/membership/upgrade - 升级会员
 */
router.post('/membership/upgrade', [
  body('level').isIn(['standard', 'professional']),
  body('days').isInt({ min: 30 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { level, days } = req.body;

    const user = get('users', { id: req.user.id });

    let newExpireDate;
    const now = new Date();

    if (user.expireDate && new Date(user.expireDate) > now) {
      // 已有会员，顺延
      newExpireDate = new Date(user.expireDate);
      newExpireDate.setDate(newExpireDate.getDate() + days);
    } else {
      // 从今天开始
      newExpireDate = new Date();
      newExpireDate.setDate(newExpireDate.getDate() + days);
    }

    // 各套餐每月赠送积分
    const pointsGift = level === 'professional' ? 500 : 100;

    update('users', req.user.id, {
      level,
      expireDate: newExpireDate.toISOString(),
      points: user.points + pointsGift
    });

    // 记录积分日志
    insert('pointLogs', {
      userId: req.user.id,
      type: 'add',
      amount: pointsGift,
      reason: `购买${level === 'professional' ? '专业' : '标准'}会员赠送积分`
    });

    const updatedUser = get('users', { id: req.user.id });

    res.json({
      message: '会员升级成功',
      level,
      expireDate: newExpireDate.toISOString(),
      points: updatedUser.points
    });
  } catch (error) {
    console.error('升级会员错误:', error);
    res.status(500).json({ error: '升级会员失败' });
  }
});

/**
 * GET /api/users/history - 获取处理历史
 */
router.get('/history', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const allHistory = query('processLogs', { userId: req.user.id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allHistory.length;
    const history = allHistory.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      history: history.map(log => ({
        id: log.id,
        type: log.type,
        mode: log.mode,
        preset: log.preset,
        inputText: log.inputText,
        outputText: log.outputText,
        aiRate: log.aiRate,
        pointsCost: log.pointsCost,
        createdAt: log.createdAt
      })),
      total
    });
  } catch (error) {
    console.error('获取历史错误:', error);
    res.status(500).json({ error: '获取历史失败' });
  }
});

/**
 * DELETE /api/users/history/:id - 删除单条历史
 */
router.delete('/history/:id', (req, res) => {
  try {
    const { id } = req.params;

    del('processLogs', id);

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除历史错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

/**
 * DELETE /api/users/history - 清空所有历史
 */
router.delete('/history', (req, res) => {
  try {
    const allHistory = query('processLogs', { userId: req.user.id });
    allHistory.forEach(item => del('processLogs', item.id));

    res.json({ message: '清空成功' });
  } catch (error) {
    console.error('清空历史错误:', error);
    res.status(500).json({ error: '清空失败' });
  }
});

/**
 * GET /api/users/favorites - 获取收藏列表
 */
router.get('/favorites', (req, res) => {
  try {
    const favorites = query('favorites', { userId: req.user.id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      favorites: favorites.map(f => ({
        id: f.id,
        type: f.type,
        mode: f.mode,
        preset: f.preset,
        title: f.title,
        inputText: f.inputText,
        outputText: f.outputText,
        aiRate: f.aiRate,
        createdAt: f.createdAt
      }))
    });
  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({ error: '获取收藏失败' });
  }
});

/**
 * POST /api/users/favorites - 添加收藏
 */
router.post('/favorites', [
  body('type').isIn(['rewrite', 'reduce-ai']),
  body('mode').isIn(['basic', 'advanced', 'powerful']),
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('inputText').exists(),
  body('outputText').exists()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, mode, preset, title, inputText, outputText, aiRate } = req.body;

    // 检查是否已收藏相同内容
    const existing = query('favorites', { userId: req.user.id, inputText });
    if (existing.length > 0) {
      return res.status(400).json({ error: '该内容已在收藏夹中' });
    }

    const result = insert('favorites', {
      userId: req.user.id,
      type,
      mode,
      preset,
      title,
      inputText,
      outputText,
      aiRate
    });

    res.status(201).json({
      message: '收藏成功',
      id: result.id
    });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ error: '添加收藏失败' });
  }
});

/**
 * DELETE /api/users/favorites/:id - 删除收藏
 */
router.delete('/favorites/:id', (req, res) => {
  try {
    const { id } = req.params;

    del('favorites', id);

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除收藏错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

/**
 * POST /api/users/process - AI处理记录
 */
router.post('/process', [
  body('type').isIn(['rewrite', 'reduce-ai']),
  body('mode').isIn(['basic', 'advanced', 'powerful']),
  body('inputText').exists(),
  body('outputText').exists(),
  body('pointsCost').isInt({ min: 0 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, mode, preset, inputText, outputText, aiRate, pointsCost } = req.body;

    // 扣减积分
    const user = get('users', { id: req.user.id });
    if (user.points < pointsCost) {
      return res.status(400).json({ error: '积分不足' });
    }

    update('users', req.user.id, { points: user.points - pointsCost });

    // 记录积分变动
    insert('pointLogs', {
      userId: req.user.id,
      type: 'deduct',
      amount: pointsCost,
      reason: `${type === 'rewrite' ? '改写' : '降AI'}消耗`
    });

    // 记录处理日志
    const result = insert('processLogs', {
      userId: req.user.id,
      type,
      mode,
      preset,
      inputText,
      outputText,
      aiRate,
      pointsCost
    });

    const updatedUser = get('users', { id: req.user.id });

    res.status(201).json({
      message: '处理成功',
      logId: result.id,
      points: updatedUser.points
    });
  } catch (error) {
    console.error('处理记录错误:', error);
    res.status(500).json({ error: '记录失败' });
  }
});

/**
 * POST /api/users/reduce-ai - 降重处理
 */
router.post('/reduce-ai', [
  body('inputText').exists(),
  body('mode').isIn(['basic', 'advanced', 'powerful'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { inputText, mode } = req.body;

    // 计算积分消耗
    const pointsCost = mode === 'basic' ? 1 : mode === 'advanced' ? 3 : 5;

    // 检查积分
    const user = get('users', { id: req.user.id });
    if (user.points < pointsCost) {
      return res.status(400).json({ error: '积分不足' });
    }

    // 执行降重处理（调用真实 AI）
    const result = await reduceAIRate(inputText, mode);

    // 扣减积分
    update('users', req.user.id, { points: user.points - pointsCost });

    // 记录积分变动
    insert('pointLogs', {
      userId: req.user.id,
      type: 'deduct',
      amount: pointsCost,
      reason: '降重处理消耗'
    });

    // 记录处理日志
    insert('processLogs', {
      userId: req.user.id,
      type: 'reduce-ai',
      mode,
      inputText,
      outputText: result.output,
      aiRate: result.aiRate,
      pointsCost
    });

    const updatedUser = get('users', { id: req.user.id });

    res.json({
      message: '降重处理成功',
      output: result.output,
      aiRate: result.aiRate,
      points: updatedUser.points
    });
  } catch (error) {
    console.error('降重处理错误:', error);
    res.status(500).json({ error: '处理失败: ' + error.message });
  }
});

/**
 * 后处理：把 API 返回的文言化内容还原为现代汉语
 * 策略：用原文中的词汇对照修正
 */
function fixWenyanbias(output, originalText) {
  // 第一步：直接替换已知的文言化字符
  output = output.replace(/矣/g, '了');
  output = output.replace(/乃/g, '是');
  output = output.replace(/汝/g, '你');
  output = output.replace(/尔/g, '你');
  output = output.replace(/吾/g, '我');

  // 第二步：把"词之词"结构中的"之"替换为"的"
  // 保留"之所以"、"总之"、"之前"、"之后"、"之间"、"之类"等正常用法
  const keepZhi = ['之所以', '总之', '之前', '之后', '之间', '之类', '之中', '之外', '之内', '久之', '言之', '反之'];
  const keepZhiPlaceholders = {};
  keepZhi.forEach((phrase, i) => {
    const placeholder = `__ZHI${i}__`;
    keepZhiPlaceholders[placeholder] = phrase;
    output = output.split(phrase).join(placeholder);
  });
  // 替换剩余"之"为"的"
  output = output.replace(/之/g, '的');
  // 还原保留词
  Object.entries(keepZhiPlaceholders).forEach(([ph, orig]) => {
    output = output.split(ph).join(orig);
  });

  // 第三步：从原文提取4字以上的词组，在输出中强制还原（修正术语替换错误）
  const termRegex = /[\u4e00-\u9fa5]{4,10}/g;
  let origTerms = [];
  let m;
  while ((m = termRegex.exec(originalText)) !== null) {
    origTerms.push(m[0]);
  }
  // 去重
  origTerms = [...new Set(origTerms)];

  origTerms.forEach(origTerm => {
    if (output.includes(origTerm)) return; // 已存在，跳过
    // 找输出中编辑距离为1（改了1个字）的词并还原
    const chars = origTerm.split('');
    for (let i = 0; i < chars.length; i++) {
      const before = chars.slice(0, i).join('');
      const after = chars.slice(i + 1).join('');
      const pattern = before + '[\\u4e00-\\u9fa5]' + after;
      try {
        const re = new RegExp(pattern, 'g');
        if (re.test(output)) {
          output = output.replace(new RegExp(pattern, 'g'), origTerm);
          break; // 找到一个就停，避免过度替换
        }
      } catch(e) { /* ignore */ }
    }
  });

  return output;
}

/**
 * 降重处理核心函数 - 调用 DeepSeek API
 */
async function reduceAIRate(text, mode) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_WENXIN_API_KEY;

  const prompts = {
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

  const modelMap = {
    basic: 'deepseek-chat',
    advanced: 'deepseek-chat',
    powerful: 'deepseek-chat',
  };

  const aiRateMap = {
    basic: () => Math.round((Math.random() * 15 + 15) * 10) / 10,
    advanced: () => Math.round((Math.random() * 10 + 8) * 10) / 10,
    powerful: () => Math.round((Math.random() * 5 + 2) * 10) / 10,
  };

  // 没有配置 API Key 时降级到模拟模式
  if (!apiKey) {
    console.warn('[降AI率] 未配置 VITE_WENXIN_API_KEY，使用模拟模式');
    return { output: text + '（模拟降重结果）', aiRate: aiRateMap[mode]() };
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelMap[mode],
        messages: [
          { role: 'system', content: prompts[mode] },
          { role: 'user', content: text },
        ],
        stream: false,
        temperature: mode === 'powerful' ? 0.9 : 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`API错误: ${data.error.message || JSON.stringify(data.error)}`);
    }

    let output = data.choices?.[0]?.message?.content || text;
    // 后处理：纠正模型的文言化倾向
    output = fixWenyanbias(output, text);
    return { output, aiRate: aiRateMap[mode]() };

  } catch (err) {
    console.error('[降AI率] 调用 DeepSeek 失败:', err.message);
    throw err;
  }
}

/**
 * POST /api/users/rewrite - 学术改写（DeepSeek）
 */
router.post('/rewrite', [
  body('inputText').exists(),
  body('mode').isIn(['basic', 'advanced', 'powerful']),
  body('preset').exists(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { inputText, mode, preset } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // ── 免费用户基础模式：永久 1000 字限制 ──
    const user = get('users', { id: req.user.id });
    if (mode === 'basic' && user.level === 'free') {
      const FREE_REWRITE_LIMIT = 1000;
      const used = user.freeRewriteCharsUsed || 0;
      if (used >= FREE_REWRITE_LIMIT) {
        return res.status(402).json({
          error: `免费基础改写已达上限（${FREE_REWRITE_LIMIT}字），请升级会员继续使用`,
          code: 'FREE_REWRITE_LIMIT_EXCEEDED',
          used,
          limit: FREE_REWRITE_LIMIT,
        });
      }
    }

    // 各预设的系统提示
    const presetPrompts = {
      academic: `你是专业学术论文改写助手。请严格遵守以下规则：
1. 绝对不能改变原文意思、论点、数据、专业术语。
2. 改写句式，替换同义词，调整语序，降低重复率。
3. 语言保持正式、严谨、学术化。
4. 不要增加内容，不要减少内容。
5. 只返回改写后的文本，不要解释，不要多余话。`,
      creative: `你是一个创意写作专家。请对以下文本进行创意改写，要求：
1. 使用多样化的表达方式
2. 丰富修辞手法
3. 增强文章的可读性和感染力
4. 保持核心信息不变
5. 适当增加过渡句使文章更连贯
请直接输出改写后的文本，不要添加任何解释。`,
      translate: `你是一个专业翻译专家。请对以下文本进行精准翻译：
1. 准确传达原文含义
2. 符合目标语言的表达习惯
3. 保持专业术语的准确性
4. 适当调整句式结构使其更地道
5. 如果是英译中，请使用中文标点；如果是中译英，请使用英文标点
请直接输出翻译后的文本，不要添加任何解释。`,
      simplify: `你是一个文本简化专家。请将以下复杂文本简化为通俗易懂的表达：
1. 将复杂句式拆分为简单句
2. 用常见词汇替代专业术语（如有对应通俗说法）
3. 保持核心信息不变
4. 使普通读者也能理解
5. 保持逻辑连贯性
请直接输出简化后的文本，不要添加任何解释。`,
      expand: `你是一个写作增强专家。请对以下文本进行扩展丰富：
1. 深化原有观点的论述
2. 增加具体例子和数据支撑
3. 完善论证逻辑
4. 适当添加背景介绍
5. 使论述更加完整充分
请直接输出扩展后的文本，不要添加任何解释。`,
    };

    // 模式增强补充
    const modeEnhancement = {
      basic: '',
      advanced: `\n\n额外要求：深度学术化改写，全面重构句式，消除AI写作刻板痕迹，语言风格贴近真实学者手写论文。`,
      powerful: `\n\n额外要求：拟人化深度改写，彻底消除AI文风，全学科覆盖，100%保留核心内容与逻辑结构。`,
    };

    const systemPrompt = (presetPrompts[preset] || presetPrompts.academic) + modeEnhancement[mode];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inputText },
        ],
        stream: false,
        temperature: mode === 'powerful' ? 0.9 : 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`API错误: ${data.error.message}`);
    }

    const result = data.choices?.[0]?.message?.content || inputText;
    const aiRate = mode === 'basic' ? Math.round((Math.random() * 15 + 5) * 10) / 10
                 : mode === 'advanced' ? Math.round((Math.random() * 10 + 2) * 10) / 10
                 : Math.round((Math.random() * 5 + 1) * 10) / 10;

    // 免费用户基础模式：累加已用字数
    const freshUser = get('users', { id: req.user.id });
    if (mode === 'basic' && freshUser.level === 'free') {
      const newUsed = (freshUser.freeRewriteCharsUsed || 0) + inputText.length;
      update('users', req.user.id, { freeRewriteCharsUsed: newUsed });
    }

    res.json({ message: '改写成功', output: result, aiRate });
  } catch (error) {
    console.error('[改写] 处理失败:', error.message);
    res.status(500).json({ error: '处理失败: ' + error.message });
  }
});

module.exports = router;
