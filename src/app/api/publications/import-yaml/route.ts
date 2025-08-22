import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import {
  validateFilePathEnhanced,
  safeReadFile,
  safeFileExists
} from "@/lib/security/filePathValidator";

const prisma = new PrismaClient();

// YAML 文件存储目录
const YAML_DIR = path.join(process.cwd(), "data", "yaml");

// YAML 文件验证选项
const yamlValidationOptions = {
  allowedExtensions: ['.yml', '.yaml'],
  baseDirectory: YAML_DIR,
  maxFilenameLength: 30, // 更安全的文件名长度限制
  allowSubdirectories: false,
};

// 类型映射：YAML type → 数据库 PublicationType
// 只取 '-' 前的部分进行映射
const TYPE_MAPPING: Record<string, string> = {
  journal: "JOURNAL",
  conference: "CONFERENCE",
  book: "BOOK",
  preprint: "PREPRINT",
  workshop: "WORKSHOP",
  thesis: "THESIS",
  patent: "PATENT",
  technical: "TECHNICAL_REPORT",
};

/**
 * 转换 YAML publication 为数据库格式
 */
function convertYamlToDbFormat(yamlWork: any) {
  // 处理标题 - 清理引号和多余空格
  let title =
    typeof yamlWork.title === "string"
      ? yamlWork.title
      : yamlWork.title?.value || "Untitled";

  // 清理标题中的引号和多余空格
  title = title.replace(/"/g, "").trim();

  // 处理年份
  const year =
    parseInt(yamlWork.publicationDate?.year) || new Date().getFullYear();

  // 处理会议/期刊名称
  const venue = yamlWork.journalTitle || yamlWork.venue || null;

  // 处理作者列表 - 转换为 "First, Last" 格式并用分号分隔
  const authors = yamlWork.authors || [];
  const authors_full_string =
    authors.length > 0
      ? authors
          .map((author: string) => {
            // 将 "First Last" 转换为 "First, Last"
            const parts = author.trim().split(" ");
            if (parts.length >= 2) {
              const firstName = parts.slice(0, -1).join(" "); // 除最后一个词外的所有词作为名
              const lastName = parts[parts.length - 1]; // 最后一个词作为姓
              return `${firstName}, ${lastName}`;
            }
            return author; // 如果只有一个词，保持原样
          })
          .join("; ")
      : null;

  // 处理类型 - 只取 '-' 前的部分
  const typePrefix = yamlWork.type ? yamlWork.type.split("-")[0] : "";
  const type = TYPE_MAPPING[typePrefix] || "OTHER";

  // 构建数据库记录
  return {
    title,
    year,
    venue,
    authors_full_string,
    type,
    // 其他字段设为默认值
    abstract: null,
    keywords: null,
    pdf_url: null,
    ccf_rank: null,
    volume: null,
    number: null,
    pages: null,
    publisher: null,
    slides_url: null,
    video_url: null,
    code_repository_url: null,
    project_page_url: null,
    is_peer_reviewed: yamlWork.type === "journal-article" ? true : null,
  };
}

/**
 * 检查重复标题
 */
async function checkDuplicateTitles(publications: any[]) {
  const titles = publications.map((pub) => pub.title);

  const existingPublications = await prisma.publication.findMany({
    where: {
      title: {
        in: titles,
      },
      // 检查所有状态的记录，避免重复导入
    },
    select: {
      title: true,
    },
  });

  const existingTitles = new Set(existingPublications.map((pub) => pub.title));

  return {
    duplicates: titles.filter((title) => existingTitles.has(title)),
    uniquePublications: publications.filter(
      (pub) => !existingTitles.has(pub.title)
    ),
  };
}

/**
 * 简单的 YAML 解析器（专门处理 JiahuiHu.yml 的结构）
 */
function parseSimpleYaml(yamlContent: string): any {
  const lines = yamlContent.split("\n");
  const result: any = { works: [] };
  let currentWork: any = null;
  let currentArray: string[] = [];
  let currentPublicationDate: any = {};
  let currentState = "none"; // 'authors', 'publicationDate', 'title'
  let titleLines: string[] = [];
  let collectingTitleValue = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    // 检查缩进级别
    const indent = line.length - line.trimStart().length;

    if (trimmedLine === "works:") {
      continue;
    } else if (indent === 2 && trimmedLine.startsWith("- ")) {
      // 新的 work 项目开始
      if (currentWork) {
        // 保存前一个 work - 修复：不依赖 currentState
        if (currentArray.length > 0) {
          currentWork.authors = currentArray;
        }
        if (Object.keys(currentPublicationDate).length > 0) {
          currentWork.publicationDate = currentPublicationDate;
        }
        if (titleLines.length > 0) {
          currentWork.title = { value: titleLines.join(" ").trim() };
        }
        result.works.push(currentWork);
      }

      // 重置状态
      currentWork = {};
      currentArray = [];
      currentPublicationDate = {};
      titleLines = [];
      currentState = "none";
      collectingTitleValue = false;

      // 检查是否有同行的键值对
      const content = trimmedLine.substring(2).trim();
      if (content && content.includes(":")) {
        const [key, value] = content.split(":", 2);
        const trimmedKey = key.trim();
        const trimmedValue = value.trim().replace(/"/g, "");

        if (trimmedKey === "authors") {
          currentState = "authors";
          currentArray = [];
        } else {
          currentWork[trimmedKey] = trimmedValue;
        }
      }
    } else if (indent === 4 && trimmedLine.includes(":")) {
      // 4个空格缩进的主要属性
      const colonIndex = trimmedLine.indexOf(":");
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      if (key === "authors") {
        currentState = "authors";
        currentArray = [];
      } else if (key === "publicationDate") {
        currentState = "publicationDate";
        currentPublicationDate = {};
      } else if (key === "title") {
        currentState = "title";
        titleLines = [];
        collectingTitleValue = false;
      } else if (currentState === "publicationDate") {
        // publicationDate 的子属性
        currentPublicationDate[key] = value
          .replace(/"/g, "")
          .replace(/null/g, "");
      } else {
        // 其他直接属性
        currentWork[key] = value.replace(/"/g, "");
        currentState = "none";
      }
    } else if (indent === 6) {
      if (currentState === "authors" && trimmedLine.startsWith("- ")) {
        // 作者列表项
        currentArray.push(trimmedLine.substring(2).trim());
      } else if (currentState === "title" && trimmedLine.startsWith("value:")) {
        // 标题的 value 开始
        const titleValue = trimmedLine.substring(6).trim().replace(/"/g, "");
        titleLines.push(titleValue);
        collectingTitleValue = true;
      } else if (
        currentState === "publicationDate" &&
        trimmedLine.includes(":")
      ) {
        // publicationDate 的子属性
        const colonIndex = trimmedLine.indexOf(":");
        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();
        currentPublicationDate[key] = value
          .replace(/"/g, "")
          .replace(/null/g, "");
      }
    } else if (indent === 8 && collectingTitleValue) {
      // 多行标题的续行
      titleLines.push(trimmedLine);
    }
  }

  // 处理最后一个 work - 修复：不依赖 currentState
  if (currentWork) {
    if (currentArray.length > 0) {
      currentWork.authors = currentArray;
    }
    if (Object.keys(currentPublicationDate).length > 0) {
      currentWork.publicationDate = currentPublicationDate;
    }
    if (titleLines.length > 0) {
      currentWork.title = { value: titleLines.join(" ").trim() };
    }
    result.works.push(currentWork);
  }

  return result;
}

export async function POST(request: Request) {
  console.log("Received POST request to /api/publications/import-yaml");

  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: "文件名是必需的" },
        { status: 400 }
      );
    }

    // 安全验证文件路径（使用增强验证，包含 Linux 特定检查）
    const validation = validateFilePathEnhanced(fileName, yamlValidationOptions);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `无效的文件名: ${validation.error}` },
        { status: 400 }
      );
    }

    // 使用验证后的安全路径
    const safePath = validation.safePath!;

    // 安全检查文件是否存在
    if (!safeFileExists(safePath, YAML_DIR)) {
      return NextResponse.json(
        { error: "文件未找到" },
        { status: 404 }
      );
    }

    // 安全读取文件内容
    const yamlContent = safeReadFile(safePath, YAML_DIR);
    if (yamlContent === null) {
      return NextResponse.json(
        { error: "无法读取文件" },
        { status: 500 }
      );
    }

    // 解析 YAML
    let yamlData: any;
    try {
      yamlData = parseSimpleYaml(yamlContent);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid YAML format" },
        { status: 400 }
      );
    }

    if (!yamlData.works || !Array.isArray(yamlData.works)) {
      return NextResponse.json(
        { error: "YAML file must contain a 'works' array" },
        { status: 400 }
      );
    }

    console.log(`Found ${yamlData.works.length} publications in YAML`);

    // 转换数据格式
    const convertedPublications = yamlData.works.map(convertYamlToDbFormat);

    // 检查重复
    const { duplicates, uniquePublications } = await checkDuplicateTitles(
      convertedPublications
    );

    console.log(
      `Found ${duplicates.length} duplicates, ${uniquePublications.length} unique publications`
    );

    // 批量创建 pending publications
    const createdPublications = [];
    for (const publication of uniquePublications) {
      try {
        const created = await prisma.publication.create({
          data: {
            ...publication,
            status: "pending_review",
            raw_authors: publication.authors_full_string || null,
            source: "yaml_import",
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
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdPublications.length} publications to pending review`,
      data: {
        imported: createdPublications.length,
        duplicatesSkipped: duplicates.length,
        total: yamlData.works.length,
        duplicateTitles: duplicates,
        fileName: validation.normalizedFilename || "unknown",
      },
    });
  } catch (error) {
    console.error("Error importing YAML:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to import YAML: ${errorMessage}` },
      { status: 500 }
    );
  }
}
