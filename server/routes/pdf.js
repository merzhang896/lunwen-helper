/**
 * PDF转换路由
 * 提供PDF转Word等功能
 * 使用Python pdf2docx库进行真正的PDF转换
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const router = express.Router();
const execPromise = util.promisify(exec);

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB限制
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传PDF文件'));
    }
  }
});

/**
 * 使用Python脚本转换PDF到Word
 * @param {string} pdfPath - PDF文件路径
 * @param {string} docxPath - 输出Word文件路径
 * @returns {Promise<boolean>}
 */
async function convertWithPython(pdfPath, docxPath) {
  const pythonScript = path.join(__dirname, '../pdf_converter.py');
  // 优先使用 managed Python，fallback 到系统 python
  const pythonExe = 'C:\\Users\\ZhuanZ\\.workbuddy\\binaries\\python\\versions\\3.13.12\\python.exe';
  const command = `"${pythonExe}" "${pythonScript}" "${pdfPath}" "${docxPath}"`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (stdout) console.log('Python转换输出:', stdout);
      if (stderr) console.log('Python日志:', stderr); // pdf2docx 把 INFO/WARNING 都输出到 stderr，属正常
      
      if (error) {
        // exit code 非 0 才是真正失败
        console.error('Python转换失败，exit code:', error.code);
        reject(new Error(stderr || error.message || '转换失败'));
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * POST /api/convert/pdf-to-word
 * PDF转Word - 使用Python pdf2docx库
 */
router.post('/pdf-to-word', upload.single('pdf'), async (req, res) => {
  let pdfPath = null;
  let docxPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传PDF文件' });
    }

    pdfPath = req.file.path;
    const originalName = req.file.originalname;
    
    console.log('PDF文件已上传:', pdfPath);
    console.log('文件大小:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // 生成Word文件路径
    const wordFileName = originalName.replace('.pdf', '.docx');
    docxPath = path.join(__dirname, '../uploads', `word-${Date.now()}-${Math.round(Math.random() * 1E9)}.docx`);
    
    // 使用Python进行真正的PDF转换
    console.log('开始PDF转换...');
    await convertWithPython(pdfPath, docxPath);
    console.log('PDF转换完成');
    
    // 检查Word文件是否生成成功
    if (!fs.existsSync(docxPath)) {
      throw new Error('Word文件生成失败');
    }
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(wordFileName)}"`);
    
    // 读取并发送Word文件
    const wordBuffer = fs.readFileSync(docxPath);
    res.send(wordBuffer);
    
    console.log('Word文件已发送:', wordFileName);
    
  } catch (error) {
    console.error('PDF转换失败:', error);
    res.status(500).json({ 
      error: 'PDF转换失败',
      message: error.message || '请稍后重试'
    });
  } finally {
    // 清理临时文件
    setTimeout(() => {
      try {
        if (pdfPath && fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          console.log('已清理PDF文件:', pdfPath);
        }
        if (docxPath && fs.existsSync(docxPath)) {
          fs.unlinkSync(docxPath);
          console.log('已清理Word文件:', docxPath);
        }
      } catch (error) {
        console.error('清理临时文件失败:', error);
      }
    }, 5000);
  }
});

/**
 * GET /api/convert/status
 * 获取转换服务状态
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    services: ['pdf-to-word'],
    engine: 'pdf2docx (Python)',
    limits: {
      maxFileSize: '50MB',
      maxPages: 100
    }
  });
});

module.exports = router;
