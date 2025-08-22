import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateFilePathEnhanced } from "@/lib/security/filePathValidator";

const DBLP_DIR = path.join(process.cwd(), "data", "dblp");

// DBLP 文件验证选项
const dblpValidationOptions = {
  allowedExtensions: [".txt"],
  baseDirectory: DBLP_DIR,
  maxFilenameLength: 30, // 更安全的文件名长度限制
  allowSubdirectories: false,
};

/**
 * 获取所有可用的 DBLP 文件列表
 */
export async function GET() {
  try {
    // 确保目录存在
    if (!fs.existsSync(DBLP_DIR)) {
      fs.mkdirSync(DBLP_DIR, { recursive: true });
    }

    // 读取目录中的所有 .txt 文件
    const files = fs
      .readdirSync(DBLP_DIR)
      .filter((file) => /\.txt$/i.test(file))
      .map((fileName) => {
        const filePath = path.join(DBLP_DIR, fileName);
        const stats = fs.statSync(filePath);

        return {
          name: fileName,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          path: `/data/dblp/${fileName}`,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
      );

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error loading DBLP files:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to load DBLP files: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 上传新的 DBLP 文件
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    // 安全验证文件名（使用增强验证，包含 Linux 特定检查）
    const validation = validateFilePathEnhanced(
      file.name,
      dblpValidationOptions
    );
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `无效的文件名: ${validation.error}` },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小必须小于 10MB" },
        { status: 400 }
      );
    }

    // 确保目录存在
    if (!fs.existsSync(DBLP_DIR)) {
      fs.mkdirSync(DBLP_DIR, { recursive: true });
    }

    // 使用验证后的安全路径
    const safePath = validation.safePath!;
    if (fs.existsSync(safePath)) {
      return NextResponse.json(
        { error: `文件 "${validation.normalizedFilename}" 已存在` },
        { status: 409 }
      );
    }

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(safePath, buffer);

    console.log(
      `Successfully uploaded DBLP file: ${validation.normalizedFilename}`
    );

    return NextResponse.json({
      success: true,
      message: `文件 "${validation.normalizedFilename}" 上传成功`,
      data: {
        name: validation.normalizedFilename,
        size: file.size,
        path: `/data/dblp/${validation.normalizedFilename}`,
      },
    });
  } catch (error) {
    console.error("Error uploading DBLP file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `上传失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
