#!/usr/bin/env python3
"""
PDF 转 Word 转换脚本
用于Node.js后端调用
用法: python pdf_converter.py <input_pdf_path> <output_docx_path>
"""

import sys
import os

def convert_pdf_to_word(pdf_path, docx_path):
    """将PDF转换为Word文档"""
    try:
        from pdf2docx import Converter
        
        # 创建转换器
        cv = Converter(pdf_path)
        
        # 转换PDF到Word
        cv.convert(
            docx_path,
            start=0,    # 从第0页开始
            end=None,   # 转换全部页面
        )
        cv.close()
        
        return True, "转换成功"
    except ImportError:
        return False, "缺少pdf2docx库，请安装: pip install pdf2docx"
    except Exception as e:
        return False, f"转换失败: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python pdf_converter.py <input_pdf_path> <output_docx_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]
    
    # 检查输入文件是否存在
    if not os.path.exists(pdf_path):
        print(f"错误: 输入文件不存在: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    # 执行转换
    success, message = convert_pdf_to_word(pdf_path, docx_path)
    
    if success:
        print(message)
        sys.exit(0)
    else:
        print(message, file=sys.stderr)
        sys.exit(1)
