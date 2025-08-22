import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import {
  validateFilePathEnhanced,
  safeReadFile,
  safeFileExists,
} from "@/lib/security/filePathValidator";

const prisma = new PrismaClient();
const DBLP_DIR = path.join(process.cwd(), "data", "dblp");

// DBLP 文件验证选项
const dblpValidationOptions = {
  allowedExtensions: [".txt"],
  baseDirectory: DBLP_DIR,
  maxFilenameLength: 30, // 更安全的文件名长度限制
  allowSubdirectories: false,
};

interface DblpPaper {
  title: string;
  authors: string[];
  year: string;
  venue: string;
  pages?: string;
  doi?: string;
  type: "journal" | "conference";
  volume?: string;
  number?: string;
}

/**
 * 解析 DBLP 输出文件（仅支持 TXT 格式）
 */
function parseDblpFile(content: string, fileName: string): DblpPaper[] {
  if (!fileName.endsWith(".txt")) {
    throw new Error("仅支持 .txt 格式的 DBLP 输出文件");
  }

  return parseDblpTxt(content);
}

/**
 * 解析 TXT 格式的 DBLP 输出（推荐格式）
 * 基于实际 output.txt 文件的结构优化
 */
function parseDblpTxt(content: string): DblpPaper[] {
  const papers: DblpPaper[] = [];
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let currentPaper: Partial<DblpPaper> = {};

  for (const line of lines) {
    if (/^\d{4}$/.test(line)) {
      // 年份行，开始新的年份组
      continue;
    } else if (line.startsWith("Authors: ")) {
      // 如果有之前的论文，保存它
      if (currentPaper.title && currentPaper.venue && currentPaper.year) {
        papers.push(currentPaper as DblpPaper);
      }

      // 开始新论文
      const rawAuthors = line
        .substring(9)
        .split(",")
        .map((author) => author.trim())
        .filter((author) => author);

      // 转换作者格式为 "名, 姓" 格式（与 yaml-import 一致）
      const formattedAuthors = rawAuthors.map((author) => {
        // 移除 DBLP 数字标识（如 "0001", "0071" 等）
        const cleanAuthor = author.replace(/\s+\d{4}$/, "").trim();

        // 如果已经是 "名, 姓" 格式，保持不变
        if (cleanAuthor.includes(", ")) {
          return cleanAuthor;
        }

        // 将 "名 姓" 转换为 "名, 姓"
        const parts = cleanAuthor.split(" ");
        if (parts.length >= 2) {
          const firstName = parts.slice(0, -1).join(" "); // 除最后一个词外的所有词作为名
          const lastName = parts[parts.length - 1]; // 最后一个词作为姓
          return `${firstName}, ${lastName}`;
        }

        return cleanAuthor; // 如果只有一个词，保持原样
      });

      currentPaper = {
        authors: formattedAuthors,
        type: "journal", // 默认类型，后面会根据 venue 调整
      };
    } else if (line.startsWith("Title: ")) {
      // 清理标题末尾的句号
      let title = line.substring(7).trim();
      if (title.endsWith(".")) {
        title = title.slice(0, -1).trim();
      }
      currentPaper.title = title;
    } else if (line.startsWith("Journal: ")) {
      currentPaper.venue = line.substring(9).trim();
      currentPaper.type = "journal";
    } else if (line.startsWith("Booktitle: ")) {
      currentPaper.venue = line.substring(11).trim();
      currentPaper.type = "conference";
    } else if (line.startsWith("Volume: ")) {
      const volumeInfo = line.substring(8).trim();
      // 处理 "12, Number: 1" 格式
      if (volumeInfo.includes(", Number: ")) {
        const parts = volumeInfo.split(", Number: ");
        currentPaper.volume = parts[0].trim();
        currentPaper.number = parts[1].trim();
      } else {
        currentPaper.volume = volumeInfo;
      }
    } else if (line.startsWith("Pages: ")) {
      currentPaper.pages = line.substring(7).trim();
    } else if (line.startsWith("Year: ")) {
      currentPaper.year = line.substring(6).trim();
    }
  }

  // 保存最后一篇论文
  if (currentPaper.title && currentPaper.venue && currentPaper.year) {
    papers.push(currentPaper as DblpPaper);
  }

  return papers;
}

/**
 * 将 DBLP 论文数据转换为数据库格式
 */
function convertDblpToDbFormat(paper: DblpPaper) {
  // 构建 venue 字符串
  let venueString = paper.venue;
  if (paper.type === "journal" && paper.volume) {
    venueString += ` ${paper.volume}`;
    if (paper.number) {
      venueString += `(${paper.number})`;
    }
  }

  // 将作者数组转换为分号分隔的字符串（与 yaml-import 格式一致）
  const authors_full_string = paper.authors.join("; ");

  return {
    title: paper.title,
    authors_full_string: authors_full_string,
    year: parseInt(paper.year) || new Date().getFullYear(),
    venue: venueString,
    pages: paper.pages || null,
    volume: paper.volume || null,
    number: paper.number || null,
    abstract: null, // DBLP 通常不提供摘要
    keywords: null, // DBLP 通常不提供关键词
    pdf_url: null,
    dblp_url: paper.doi || null,
    ccf_rank: null,
    publisher: null,
    slides_url: null,
    video_url: null,
    code_repository_url: null,
    project_page_url: null,
    is_peer_reviewed: paper.type === "journal" ? true : null,
    type: paper.type === "journal" ? "JOURNAL" : "CONFERENCE",
    publication_status: null,
  };
}

/**
 * 检查重复标题（检查所有状态的 publication）
 */
async function checkDuplicateTitles(publications: any[]) {
  // 检查数据库中是否已存在相同标题（包括所有状态的 publication）
  const existingPublications = await prisma.publication.findMany({
    select: {
      title: true,
      status: true,
      id: true,
    },
  });

  console.log(
    `Found ${existingPublications.length} existing publications in database`
  );

  // 创建现有标题的集合，用于快速查找
  const existingTitles = new Set(
    existingPublications.map((pub) => pub.title.toLowerCase().trim())
  );

  const duplicates: string[] = [];
  const uniquePublications: any[] = [];

  publications.forEach((pub) => {
    const normalizedTitle = pub.title.toLowerCase().trim();

    // 检查是否与现有标题重复（精确匹配）
    if (existingTitles.has(normalizedTitle)) {
      duplicates.push(pub.title);
      console.log(`Skipping duplicate: "${pub.title}" (found in database)`);
    } else {
      uniquePublications.push(pub);
      existingTitles.add(normalizedTitle); // 防止同批次内重复
    }
  });

  console.log(
    `Duplicates found: ${duplicates.length}, Unique publications: ${uniquePublications.length}`
  );
  return { duplicates, uniquePublications };
}

/**
 * POST /api/publications/import-dblp
 * 从 DBLP 文件导入论文到待审核状态
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ error: "文件名是必需的" }, { status: 400 });
    }

    // 安全验证文件路径（使用增强验证，包含 Linux 特定检查）
    const validation = validateFilePathEnhanced(
      fileName,
      dblpValidationOptions
    );
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `无效的文件名: ${validation.error}` },
        { status: 400 }
      );
    }

    // 使用验证后的安全路径
    const safePath = validation.safePath!;

    // 安全检查文件是否存在
    if (!safeFileExists(safePath, DBLP_DIR)) {
      return NextResponse.json({ error: "文件未找到" }, { status: 404 });
    }

    // 安全读取文件内容
    const fileContent = safeReadFile(safePath, DBLP_DIR);
    if (fileContent === null) {
      return NextResponse.json({ error: "无法读取文件" }, { status: 500 });
    }

    // 解析 DBLP 文件
    let papers: DblpPaper[];
    try {
      papers = parseDblpFile(fileContent, validation.normalizedFilename!);
    } catch (error) {
      return NextResponse.json(
        { error: "无效的 DBLP 文件格式" },
        { status: 400 }
      );
    }

    if (papers.length === 0) {
      return NextResponse.json(
        { error: "文件中未找到有效的论文数据" },
        { status: 400 }
      );
    }

    console.log(
      `Found ${papers.length} publications in DBLP file: ${fileName}`
    );

    // 转换数据格式
    const convertedPublications = papers.map(convertDblpToDbFormat);

    // 检查重复
    const { duplicates, uniquePublications } = await checkDuplicateTitles(
      convertedPublications
    );

    console.log(
      `Found ${duplicates.length} duplicates, ${uniquePublications.length} unique publications`
    );

    // 批量创建唯一的出版物记录（使用与 yaml-import 相同的方式）
    const createdPublications = [];
    for (const publication of uniquePublications) {
      try {
        const created = await prisma.publication.create({
          data: {
            ...publication,
            status: "pending_review",
            raw_authors: publication.authors_full_string || null,
            source: "dblp_import",
            // 确保 authors_full_string 不是字符串 "null"
            authors_full_string: publication.authors_full_string || null,
          },
        });
        createdPublications.push(created);
      } catch (error) {
        console.error(
          `Failed to create publication: ${publication.title}`,
          error
        );
        // 继续处理其他记录，不因单个错误而中断
      }
    }

    console.log(
      `Successfully created ${createdPublications.length} publications`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdPublications.length} publications to pending review status`,
      data: {
        imported: createdPublications.length,
        duplicatesSkipped: duplicates.length,
        total: papers.length,
        duplicateTitles: duplicates,
        fileName: validation.normalizedFilename!,
      },
    });
  } catch (error) {
    console.error("DBLP import error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `DBLP import failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
