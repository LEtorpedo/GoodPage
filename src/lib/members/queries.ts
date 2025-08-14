// src/lib/members/queries.ts
// 成员数据查询函数

import prisma from "@/lib/prisma";
import { Prisma, MemberStatus } from "@prisma/client";
import type {
  Member,
  Publication,
  Award,
  Project,
  ProjectMember,
  Teaching,
  Presentation,
  SoftwareDataset,
  Patent,
  AcademicService,
  News,
} from "@prisma/client";
import type {
  MemberForCard,
  MemberProfileData,
  PublicationInfo,
  DisplayAuthor,
} from "@/lib/types";
import { calculateMemberGradeStatus, calculateGraduationStatus } from "./utils";

/**
 * 获取所有公开成员信息，用于成员列表页。
 * 在代码中进行分组和排序。
 * @returns 按状态分组的 MemberForCard 数组对象
 */
export async function getAllMembersGrouped(): Promise<
  Record<string, MemberForCard[]>
> {
  console.log("DB: 获取所有公开成员信息 (用于分组)");
  try {
    const members = await prisma.member.findMany({
      where: { is_profile_public: true },
      select: {
        // 选择卡片所需字段
        id: true,
        name_en: true,
        name_zh: true,
        status: true,
        title_zh: true,
        title_en: true,
        avatar_url: true,
        enrollment_year: true,
        favorite_emojis: true,
        research_interests: true,
        display_order: true,
      },
      orderBy: [{ enrollment_year: "asc" }, { name_en: "asc" }], // 数据库层面基础排序
    });
    console.log(`DB: 获取到 ${members.length} 位成员`);

    // 定义 SelectedMember 类型以注解 map 回调参数 m
    type SelectedMember = (typeof members)[0];

    // 计算显示状态和毕业状态
    const membersWithStatus: MemberForCard[] = members.map(
      (m: SelectedMember) => ({
        ...m,
        displayStatus: calculateMemberGradeStatus(
          m as Pick<Member, "status" | "enrollment_year" | "title_zh">
        ), // 确保类型匹配
        isGraduated: calculateGraduationStatus(
          m as Pick<Member, "status" | "enrollment_year">
        ), // 新增：计算毕业状态
      })
    );

    // 按状态分组
    const grouped: Record<string, MemberForCard[]> = {};
    membersWithStatus.forEach((member) => {
      const groupKey = member.status || MemberStatus.OTHER; // 使用导入的 Enum
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(member);
    });

    // 定义分组顺序
    const statusOrder: Record<MemberStatus, number> = {
      [MemberStatus.PROFESSOR]: 1,
      [MemberStatus.POSTDOC]: 2,
      [MemberStatus.PHD_STUDENT]: 3,
      [MemberStatus.MASTER_STUDENT]: 4,
      [MemberStatus.UNDERGRADUATE]: 5,
      [MemberStatus.VISITING_SCHOLAR]: 6,
      [MemberStatus.RESEARCH_STAFF]: 7,
      [MemberStatus.ALUMNI]: 8,
      [MemberStatus.OTHER]: 99,
    };

    // 按自定义顺序对分组进行排序
    const sortedGroupedData: Record<string, MemberForCard[]> = {};
    Object.keys(grouped)
      .sort(
        (a, b) =>
          (statusOrder[a as MemberStatus] || 99) -
          (statusOrder[b as MemberStatus] || 99)
      )
      .forEach((key) => {
        // 组内排序 - 所有分组都按 display_order 排序
        sortedGroupedData[key] = grouped[key].sort((a, b) => {
          // @ts-ignore: MemberForCard 包含 display_order（来源于 Member）
          const orderA = a.display_order ?? 0;
          // @ts-ignore
          const orderB = b.display_order ?? 0;
          
          // 首先按 display_order 排序
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          // 如果 display_order 相同，按原有逻辑作为备用排序
          const yearA = a.enrollment_year ?? Infinity;
          const yearB = b.enrollment_year ?? Infinity;
          const isStudentA =
            a.status === MemberStatus.PHD_STUDENT ||
            a.status === MemberStatus.MASTER_STUDENT ||
            a.status === MemberStatus.UNDERGRADUATE;

          if (yearA !== yearB) {
            return isStudentA ? yearA - yearB : yearB - yearA; // 学生升序，其他降序
          }
          // 使用 ?? '' 保证 localeCompare 操作字符串
          return (a.name_en ?? a.name_zh ?? "").localeCompare(
            b.name_en ?? b.name_zh ?? ""
          );
        });
      });
    return sortedGroupedData;
  } catch (error) {
    console.error("获取所有成员信息失败:", error);
    throw new Error("Failed to fetch members.");
  }
}

/**
 * 获取所有成员信息，用于管理列表。
 * @returns 排序后的 Member 数组
 */
export async function getAllMembersForManager(): Promise<Member[]> {
  console.log("DB: 获取所有成员信息 (用于管理列表)");
  try {
    const members = await prisma.member.findMany({
      // Fetch full Member objects
      orderBy: [{ enrollment_year: "asc" }, { name_en: "asc" }],
    });
    console.log(`DB: 获取到 ${members.length} 位成员 (管理列表)`);

    // Define status order mapping (ensure this is defined only once)
    const statusOrderMap: Record<MemberStatus, number> = {
      [MemberStatus.PROFESSOR]: 1,
      [MemberStatus.POSTDOC]: 2,
      [MemberStatus.PHD_STUDENT]: 3,
      [MemberStatus.MASTER_STUDENT]: 4,
      [MemberStatus.UNDERGRADUATE]: 5,
      [MemberStatus.VISITING_SCHOLAR]: 6,
      [MemberStatus.RESEARCH_STAFF]: 7,
      [MemberStatus.ALUMNI]: 8,
      [MemberStatus.OTHER]: 99,
    };

    // Sort the flat list - 现在所有成员都按 display_order 排序
    const sortedMemberList = [...members].sort((a, b) => {
      const statusA = a.status || MemberStatus.OTHER;
      const statusB = b.status || MemberStatus.OTHER;
      const statusOrderA = statusOrderMap[statusA as MemberStatus] || 99;
      const statusOrderB = statusOrderMap[statusB as MemberStatus] || 99;

      // 首先按状态分组排序
      if (statusOrderA !== statusOrderB) {
        return statusOrderA - statusOrderB;
      }

      // 同状态内按 display_order 排序
      const displayOrderA = a.display_order ?? 0;
      const displayOrderB = b.display_order ?? 0;
      if (displayOrderA !== displayOrderB) {
        return displayOrderA - displayOrderB;
      }

      // 如果 display_order 相同，按原有逻辑作为备用排序
      const yearA = a.enrollment_year ?? Infinity;
      const yearB = b.enrollment_year ?? Infinity;
      const isStudentA =
        a.status === MemberStatus.PHD_STUDENT ||
        a.status === MemberStatus.MASTER_STUDENT ||
        a.status === MemberStatus.UNDERGRADUATE;

      if (yearA !== yearB && yearA !== Infinity && yearB !== Infinity) {
        return isStudentA ? yearA - yearB : yearB - yearA;
      }
      // Ensure consistent return type (number) even if years are Infinity
      if (yearA !== yearB) {
        // If one year is Infinity (null), treat it as larger/smaller consistently
        return yearA === Infinity ? 1 : -1; // Treat null year as "later"
      }

      return (a.name_en ?? a.name_zh ?? "").localeCompare(
        b.name_en ?? b.name_zh ?? ""
      );
    });

    return sortedMemberList;
  } catch (error) {
    console.error("获取所有成员信息 (管理列表) 失败:", error);
    throw new Error("Failed to fetch members for manager.");
  }
}

/**
 * 根据 ID 获取单个成员的完整档案信息。
 * 实现智能作者显示逻辑：合并 authors_full_string 和内部关联作者。
 * @param id - 成员的唯一 ID (string)
 * @param forEditing - 可选，如果为 true，则不检查 is_profile_public 状态 (用于开发者编辑页)。默认为 false。
 * @returns 包含所有关联数据的成员对象 MemberProfileData，或 null
 */
export async function getMemberProfileData(
  id: string,
  forEditing: boolean = false // Add optional parameter
): Promise<MemberProfileData | null> {
  console.log(
    `DB: 开始获取成员 ${id} 的完整档案${forEditing ? " (for editing)" : " (for public view)"}`
  );
  try {
    // --- Dynamically build the where clause ---
    const whereCondition: Prisma.MemberWhereUniqueInput = {
      id: id,
    };
    if (!forEditing) {
      whereCondition.is_profile_public = true;
    }
    console.log(`DB: Using where condition:`, whereCondition);

    // 1. 获取成员基本信息 + 简单直接关联 (导师/学生)
    const member = await prisma.member.findUnique({
      where: whereCondition, // Use the dynamically built condition
      include: {
        // 只 include 简单的直接关系或必要的 select
        supervisor: { select: { id: true, name_zh: true, name_en: true } },
        supervisees: {
          select: {
            id: true,
            name_zh: true,
            name_en: true,
            status: true,
            avatar_url: true,
          },
          orderBy: { enrollment_year: "asc" },
        },
      },
    });

    if (!member) {
      // Adjust log message based on context
      const reason = forEditing
        ? `ID 为 ${id} 的成员不存在`
        : `ID 为 ${id} 的公开成员档案不存在`;
      console.log(`DB: ${reason}`);
      return null;
    }
    console.log(`DB: 成功获取成员 ${id} 基础信息`);

    // 2. 分别获取其他所有关联数据 (包括出版物及其完整作者信息)
    console.log(`DB: 开始获取成员 ${id} 的关联数据...`);
    const [
      educationHistory,
      awards,
      projectMembersRaw,
      teachingRoles,
      presentations,
      softwareAndDatasets,
      patents,
      academicServices,
      newsMentions,
      memberPublicationsRaw,
    ] = await Promise.all([
      prisma.education.findMany({
        where: { member_id: id },
        orderBy: { end_year: "desc" },
      }),
      prisma.award.findMany({
        where: { member_id: id },
        orderBy: [{ year: "desc" }, { display_order: "asc" }],
      }),
      prisma.projectMember.findMany({
        where: { member_id: id },
        include: { project: true },
        orderBy: { project: { start_year: "desc" } },
      }),
      prisma.teaching.findMany({
        where: { member_id: id },
        orderBy: [{ year: "desc" }, { display_order: "asc" }],
      }),
      prisma.presentation.findMany({
        where: { member_id: id },
        orderBy: [{ year: "desc" }, { display_order: "asc" }],
      }),
      prisma.softwareDataset.findMany({
        where: { member_id: id },
        orderBy: { display_order: "asc" },
      }),
      prisma.patent.findMany({
        where: { member_id: id },
        orderBy: { issue_date: "desc" },
      }),
      prisma.academicService.findMany({
        where: { member_id: id },
        orderBy: [{ display_order: "asc" }],
      }),
      prisma.news.findMany({
        where: { related_member_id: id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.publication.findMany({
        // 获取该成员的论文
        where: {
          AND: [
            { authors: { some: { member_id: id } } },
            { status: "published" }, // 只获取已发布的出版物
          ],
        },
        orderBy: [{ year: "desc" }, { id: "desc" }],
        select: {
          // 选择 Publication 的所有需要字段 + authors 关联
          id: true,
          title: true,
          venue: true,
          year: true,
          volume: true,
          number: true,
          pages: true,
          publisher: true,
          ccf_rank: true,
          dblp_url: true,
          pdf_url: true,
          abstract: true,
          keywords: true,
          type: true,
          slides_url: true,
          video_url: true,
          code_repository_url: true,
          project_page_url: true,
          is_peer_reviewed: true,
          publication_status: true,
          authors_full_string: true,
          authors: {
            // 包含关联的 PublicationAuthor (用于获取内部作者信息)
            select: {
              author_order: true,
              is_corresponding_author: true,
              author: {
                // 关联的 Member
                select: { id: true, name_en: true, name_zh: true },
              },
            },
            orderBy: { author_order: "asc" }, // 确保内部作者列表有序
          },
        },
      }),
    ]);
    console.log(`DB: 成功获取成员 ${id} 的所有关联数据`);

    // 3. 格式化出版物列表 (实现智能作者显示)
    // First, get PublicationAuthor records specifically for this member to access isFeatured and order
    const publicationAuthorRecords = await prisma.publicationAuthor.findMany({
      where: {
        member_id: id,
        publication_id: {
          in: memberPublicationsRaw.map(
            (p: PublicationWithAuthorsPayload) => p.id
          ),
        },
      },
      select: {
        // Select only the necessary fields
        publication_id: true,
        isFeaturedOnProfile: true,
        profileDisplayOrder: true,
      },
    });

    // Create a map for easy lookup of isFeatured and order by publication_id
    const pubAuthorDetailsMap = new Map<
      number,
      { isFeatured: boolean; order: number | null }
    >();
    publicationAuthorRecords.forEach(
      (pa: {
        publication_id: number;
        isFeaturedOnProfile: boolean | null;
        profileDisplayOrder: number | null;
      }) => {
        pubAuthorDetailsMap.set(pa.publication_id, {
          isFeatured: pa.isFeaturedOnProfile ?? false,
          order: pa.profileDisplayOrder, // Keep null as null
        });
      }
    );

    type PublicationWithAuthorsPayload = Prisma.PublicationGetPayload<{
      select: {
        id: true;
        title: true;
        venue: true;
        year: true;
        volume: true;
        number: true;
        pages: true;
        publisher: true;
        ccf_rank: true;
        dblp_url: true;
        pdf_url: true;
        abstract: true;
        keywords: true;
        type: true;
        slides_url: true;
        video_url: true;
        code_repository_url: true;
        project_page_url: true;
        is_peer_reviewed: true;
        publication_status: true;
        authors_full_string: true;
        authors: {
          select: {
            author_order: true;
            is_corresponding_author: true;
            author: {
              select: { id: true; name_en: true; name_zh: true };
            };
          };
          orderBy: { author_order: "asc" };
        };
      };
    }>;

    let publicationsFormatted: PublicationInfo[] = memberPublicationsRaw.map(
      (p: PublicationWithAuthorsPayload): PublicationInfo => {
        // 将内部作者信息提取到 Map 中，方便按 order 查找
        // 将内部作者信息提取到数组中，方便按名字匹配
        const internalAuthors = p.authors.map(
          (ap: {
            author_order: number;
            is_corresponding_author: boolean;
            author: { id: string; name_en: string; name_zh: string | null };
          }) => ({
            id: ap.author.id,
            name_en: ap.author.name_en,
            name_zh: ap.author.name_zh,
            is_corresponding: ap.is_corresponding_author,
            author_order: ap.author_order,
          })
        );

        // 辅助函数：检查作者名字是否匹配
        const findMatchingMember = (authorName: string) => {
          const cleanName = authorName.trim().toLowerCase();

          return internalAuthors.find((member) => {
            const nameEn = member.name_en.toLowerCase();
            const nameZh = member.name_zh?.toLowerCase();

            // 【修复】处理两种格式：
            // 1. "LastName, FirstName" -> "FirstName LastName" (原有数据格式)
            // 2. "FirstName, LastName" -> "FirstName LastName" (新数据格式)
            let normalizedAuthorName1 = cleanName; // "LastName, FirstName" -> "FirstName LastName"
            let normalizedAuthorName2 = cleanName; // "FirstName, LastName" -> "FirstName LastName"

            if (cleanName.includes(",")) {
              const parts = cleanName.split(",").map((p) => p.trim());
              if (parts.length === 2) {
                // 尝试两种格式转换
                normalizedAuthorName1 = `${parts[1]} ${parts[0]}`.toLowerCase(); // "LastName, FirstName" -> "FirstName LastName"
                normalizedAuthorName2 = `${parts[0]} ${parts[1]}`.toLowerCase(); // "FirstName, LastName" -> "FirstName LastName"
              }
            }

            // 多种匹配策略
            return (
              // 直接匹配原始名字
              nameEn === cleanName ||
              nameEn.includes(cleanName) ||
              cleanName.includes(nameEn) ||
              // 匹配转换后的名字格式1 ("LastName, FirstName" -> "FirstName LastName")
              nameEn === normalizedAuthorName1 ||
              nameEn.includes(normalizedAuthorName1) ||
              normalizedAuthorName1.includes(nameEn) ||
              // 匹配转换后的名字格式2 ("FirstName, LastName" -> "FirstName LastName")
              nameEn === normalizedAuthorName2 ||
              nameEn.includes(normalizedAuthorName2) ||
              normalizedAuthorName2.includes(nameEn) ||
              // 中文名匹配
              (nameZh &&
                (nameZh === cleanName ||
                  nameZh.includes(cleanName) ||
                  cleanName.includes(nameZh)))
            );
          });
        };

        const displayAuthors: DisplayAuthor[] = [];
        const authorString = p.authors_full_string;

        if (authorString) {
          const fragments = authorString
            .split(";")
            .map((f: string) => f.trim())
            .filter((f: string) => f);
          fragments.forEach((fragment: string, index: number) => {
            // 【修复】按名字匹配而不是按index匹配
            const matchedMember = findMatchingMember(fragment);
            if (matchedMember) {
              // 匹配到内部作者
              displayAuthors.push({
                type: "internal",
                id: matchedMember.id,
                name_en: matchedMember.name_en,
                name_zh: matchedMember.name_zh,
                order: index,
                is_corresponding: matchedMember.is_corresponding,
              });
            } else {
              // 未匹配到内部作者，作为外部作者处理
              let formattedText = fragment;
              // 【修复】简单去掉逗号，不做格式转换
              if (fragment.includes(",")) {
                const parts = fragment.split(",").map((p) => p.trim());
                // 如果恰好分割成2部分且两部分都不为空，直接用空格连接
                if (parts.length === 2 && parts[0] && parts[1]) {
                  formattedText = `${parts[0]} ${parts[1]}`;
                }
                // 否则保持原样
              }
              displayAuthors.push({
                type: "external",
                text: formattedText,
                order: index,
              });
            }
          });
        } else {
          // 如果没有 authors_full_string，则回退到只显示内部作者 (可能不理想)
          console.warn(
            `Publication ID ${p.id} is missing authors_full_string. Falling back to internal authors only.`
          );
          p.authors.forEach(
            (ap: {
              author_order: number;
              is_corresponding_author: boolean;
              author: { id: string; name_en: string; name_zh: string | null };
            }) => {
              displayAuthors.push({
                type: "internal",
                id: ap.author.id,
                name_en: ap.author.name_en,
                name_zh: ap.author.name_zh,
                order: ap.author_order,
                is_corresponding: ap.is_corresponding_author,
              });
            }
          );
        }

        // Get the featured status and order from the map
        const authorDetails = pubAuthorDetailsMap.get(p.id) || {
          isFeatured: false,
          order: null,
        };

        // Construct the final PublicationInfo object explicitly
        // Ensuring all fields required by PublicationInfo are present and correctly typed
        return {
          id: p.id,
          title: p.title,
          year: p.year,
          venue: p.venue,
          ccf_rank: p.ccf_rank,
          dblp_url: p.dblp_url,
          pdf_url: p.pdf_url,
          code_repository_url: p.code_repository_url,
          project_page_url: p.project_page_url,
          video_url: p.video_url,
          slides_url: p.slides_url,
          number: p.number,
          volume: p.volume,
          pages: p.pages,
          publisher: p.publisher,
          abstract: p.abstract,
          keywords: p.keywords,
          type: p.type,
          displayAuthors: displayAuthors,
          isFeatured: authorDetails.isFeatured,
          profileDisplayOrder: authorDetails.order,
          // publicationAuthors: p.authors // Removed: Not assigning raw authors relation
        };
      }
    );

    // Sort the formatted publications based on profileDisplayOrder
    publicationsFormatted.sort((a, b) => {
      const orderA = a.profileDisplayOrder ?? Infinity; // Treat null/undefined as last
      const orderB = b.profileDisplayOrder ?? Infinity;
      if (orderA !== orderB) {
        return orderA - orderB; // Sort by order first
      }
      // If order is the same or both are null, fallback to year descending
      const yearA = a.year ?? 0;
      const yearB = b.year ?? 0;
      return yearB - yearA;
    });

    // 4. 计算显示状态
    const displayStatus = calculateMemberGradeStatus(member);

    // 5. 组装最终返回给页面的对象 (符合 MemberProfileData 类型)
    const profileData = {
      ...member,
      displayStatus,
      educationHistory,
      awards,
      projects: projectMembersRaw, // 注意：这里还是原始的，如果前端需要格式化，也要处理
      teachingRoles,
      presentations,
      softwareAndDatasets,
      patents,
      academicServices,
      publications: publicationsFormatted, // 使用格式化后的出版物列表
      newsMentions,
    };

    console.log(`DB: 成功组装成员 ${id} 的完整档案`);
    return profileData as MemberProfileData;
  } catch (error) {
    console.error(`获取成员 ${id} 档案失败:`, error);
    throw new Error(`Failed to retrieve profile for member ${id}`);
  }
}
