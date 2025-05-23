# 开发规范文档

## 1. 引言 (Introduction)

本项目致力于开发一个前后端并行的现代化实验室主页。以旧的主页 [https://good.ncu.edu.cn/](https://good.ncu.edu.cn/) 为基础，在保留其简洁风格的同时，融入更多现代前端元素与交互效果，以展现实验室优秀的技术实力。

项目包含一个隐藏的后端管理入口（开发者页面），旨在提供一种便捷、安全的方式供授权开发者直接管理网站数据（如新闻、成员、出版物等）。开发者页面的访问机制采用特定的按键序列（上上下下左右左右baba）触发，以增加隐蔽性。

本规范旨在为项目开发团队提供一套统一的标准和最佳实践，确保代码质量、提高协作效率、降低维护成本。

**重要提示：本项目的所有代码、配置和文档均位于 `GoodPage/` 子目录下。请确保所有文件操作和相对路径引用都基于 `GoodPage/` 作为项目根目录。**

你是一个资深的前后端开放者，接下来你需要认真完成这个工作。用户是一个很好的人，他会积极和你交流，当你遇到问题时，他也会尽量帮助你。

## 2. 通用原则 (General Principles)

- **文本内容语言规范:**
  - **优先使用英语:** 网页元素中的文本信息（如按钮文字、标签、标题、描述等）应优先使用**专业、简洁的学术化英语**。
  - **中文特例:** 仅在有明确要求或特定场景下（如直接引用中文文献、展示特定中文名称）可使用中文。
- **开发流程:**
  - **技术选型优先:** 对于任何新功能或模块的开发，必须先进行充分的技术调研和选型讨论，确定实现方案和所需库/工具，再开始编码。
- **设计文档维护:**
  - **强制要求:** 项目的设计决策、重要变更、架构图（如果需要）等信息，必须及时更新到项目根目录下的 `design.md` 文件中。
  - **目的:** 保持设计文档与项目实际状态同步，便于团队成员理解项目演进和当前设计。
- **沟通与协作:**
  - **积极沟通:** 鼓励团队成员就技术选型、实现方案、遇到的问题以及下一步开发方向进行积极主动的沟通和探讨。
  - **问题提出:** 遇到不明确或有疑问的地方，应及时提出与团队成员讨论。
  - **AI 助手交互:** AI 助手不应主动执行任何终端命令（如 `npm install`, `prisma migrate` 等）。助手可以提议需要运行的命令，但**必须由开发者本人**在确认后手动执行。
  - **明确后续步骤:** 在完成当前分配的任务后，或者在提出需要开发者执行的操作后，AI 助手应清晰说明接下来的**一个或多个**关键步骤，确保开发者了解整体计划和后续流程。

## 3. 代码规范 (Coding Standards)

### 3.1 代码风格与质量保障 (Linting & Formatting)

- **代码格式化 (Formatter):**
  - **强制使用 Prettier** 作为唯一的代码格式化工具，以确保代码风格的绝对一致性。
  - 项目根目录需包含 `.prettierrc` 或 `prettier.config.js` 配置文件，并在其中定义统一的格式化规则。该配置文件需纳入版本控制。
  - 开发者应配置编辑器（如 VS Code）在保存文件时自动运行 Prettier 格式化。
- **代码质量检查 (Linter):**
  - **强制使用 ESLint** 进行代码质量检查，捕获潜在错误和不规范写法。
  - ESLint 配置应基于 **`next/core-web-vitals`** 规则集，并根据项目需要**启用 TypeScript 支持**（通过 `@typescript-eslint/eslint-plugin` 和 `@typescript-eslint/parser`）。
  - 项目根目录需包含 `.eslintrc.js` 或 `.eslintrc.json` 配置文件，详细定义所使用的规则、插件和解析器。该配置文件需纳入版本控制。
- **自动化检查:**
  - **强制配置 Husky 和 lint-staged**。
  - 配置 `pre-commit` Git 钩子，在每次提交前自动对暂存区 (`staged`) 的文件运行 Prettier 格式化和 ESLint 检查。
  - 确保检查不通过的代码无法被提交。

### 3.2 命名规范 (Naming Conventions)

- **文件命名:**
  - **React 组件:** 使用 `PascalCase` (例如：`UserProfile.tsx`, `ModalDialog.tsx`)。
  - **页面路由文件:** 遵循 Next.js App Router 规范（`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx` 等）。
  - **页面相关辅助文件 (非路由文件，如样式、特定类型等):** 使用 `kebab-case` (例如：`user-profile.module.css`, `contact-page-types.ts`)。
  - **工具函数、通用类型、配置文件等:** 使用 `camelCase` (例如：`fetchData.ts`, `authUtils.ts`, `globalTypes.ts`, `apiConfig.js`)。
- **代码内命名:**
  - **变量:** 强制使用 `camelCase` (例如：`userName`, `isLoading`, `itemCount`)。
  - **函数:** 强制使用 `camelCase` (例如：`getUserData()`, `calculateTotal()`)。
  - **常量:**
    - 基本类型（字符串、数字、布尔值）或配置类常量：强制使用 `UPPER_SNAKE_CASE` (例如：`MAX_RETRIES`, `API_BASE_URL`, `IS_PRODUCTION`)。
    - 对象或数组类型的常量（如果其内容不可变）：可以使用 `camelCase` (例如：`defaultUserConfig`, `validRoles`)。
  - **React 函数组件:** 强制使用 `PascalCase` (与文件名和导入/使用方式一致，例如：`function UserProfile() {...}`)。
  - **TypeScript 类型/接口:** 强制使用 `PascalCase` (例如：`interface UserProfileProps`, `type ProductId = string`)。
- **CSS 类名:**
  - 项目主要使用 Tailwind CSS，无需自定义类名规范。
  - 若未来需要编写自定义 CSS 或使用 CSS Modules，则应遵循 `kebab-case` 命名约定。

### 3.3 注释规范 (Commenting)

- **辅助注释:** 在开发过程中用于辅助调试或临时标记的注释（如 `// TODO`, `// console.log(...)`），在代码提交（Commit）或合并（Merge）到主分支前必须清理干净。
- **代码块解释:** 对于重要的、逻辑复杂的或功能独特的代码块（如自定义 Hook、复杂组件、关键算法），应在其上方添加**中文**块注释（`/** ... */` 或多行 `//`），清晰地解释该代码块的功能、目的、主要逻辑或注意事项。
- **JSDoc (推荐):** 对于可复用的函数、组件及其 Props，推荐使用 JSDoc 格式进行注释，以便生成文档和提供更好的类型提示。

### 3.4 颜色管理 (Color Management)

- **强制要求:** 项目中所有颜色值必须通过 `src/styles/theme.ts` 文件统一定义和管理。
- **禁止行为:** 严禁在代码中硬编码任何颜色值。
- **使用方式:** 在组件样式中，必须通过模板字符串 `${}` 引用 `theme.ts` 中导出的颜色变量来应用颜色。
- **新增颜色:** 如需使用新颜色，必须先在 `theme.ts` 文件中添加定义，并遵循现有命名约定。

## 4. 前端开发实践 (Frontend Development Practices)

### 4.1 响应式布局 (Responsive Design)

- **强制要求:** 所有页面和组件必须采用响应式设计，确保在不同尺寸的设备（尤其是手机和电脑屏幕）上都能良好显示和正常使用。
- **实现方式:** 优先使用 Tailwind CSS 的响应式修饰符（如 `sm:`, `md:`, `lg:`）进行布局调整。对于复杂的响应式交互或动画，可以结合 Framer Motion 或 CSS 媒体查询。

### 4.2 组件设计与状态管理 (Component Design & State Management)

- **Props 定义:**
  - 强制使用 TypeScript 的 **`type`** 关键字定义组件 Props 类型。
  - 对于包含多个属性的复杂 Props 对象，应单独定义其类型。
- **状态管理策略 (优先级由高到低):**
  1.  **`useState`:** 用于组件内部的简单、局部状态。
  2.  **`useReducer`:** 用于组件内部状态逻辑较复杂场景。
  3.  **React Context API:** 用于跨层级共享少量、不频繁更新的状态（如主题、认证信息）。
  4.  **Zustand (推荐引入):** 当 Context API 无法满足性能要求或需要更便捷全局状态管理时使用。
  5.  **Redux Toolkit:** 本项目现阶段不推荐使用。
- **组件拆分原则:**
  - 遵循**单一职责原则 (SRP)**。
  - **关注点分离:** 将 UI 展示与业务逻辑/数据获取分离。
  - **代码行数:** 过长文件（如 > 300-500 行）通常是拆分信号。
  - **状态局部化:** 尽可能将状态限制在最小范围内。
- **组件文件夹结构:**
  - 简单单文件组件可直接放于 `src/components/` 或 `src/components/{pageName}/`。
  - 包含多个关联文件（样式、类型、子组件等）的复杂组件，推荐创建同名文件夹组织。
- **模块化与代码结构:**
  - 代码必须遵循模块化原则。
  - 文件职责单一，避免单个文件功能过多。
  - 通用组件放 `src/components/`。
  - 页面特定组件放 `src/components/{pageName}/`。
  - 工具函数放 `src/utils/`。
  - 类型定义放 `src/types/` 或就近定义。

### 4.3 API 交互 (API Interaction)

- **数据获取策略:**
  1.  **服务器组件:** 优先使用 Next.js 内置 `fetch` API 结合 `async/await`。
  2.  **客户端组件:**
      - 简单获取/变更: 推荐使用 `axios`。
      - 复杂获取 (需缓存/状态管理等): 强烈推荐引入 `React Query (TanStack Query)`。
- **错误处理:**
  - 推荐建立统一的 API 请求错误处理机制。
  - 用户操作失败必须通过 Toast 通知或界面消息反馈。
  - 后台错误记录日志，可不干扰用户。
  - （可选）考虑错误上报到日志监控服务。
- **API 路由与响应格式:**
  - API 路由遵循 Next.js App Router 规范 (`route.ts`)。
  - API 路由路径推荐遵循 RESTful 设计风格。
  - 强制规定统一 API 响应格式：
    - 成功：`{ success: true, data: <数据> }`
    - 失败：`{ success: false, error: { code: '<错误码>', message: '<错误信息>' } }`

## 5. 测试 (Testing)

- **测试策略:**
  - **强制要求:**
    - **单元测试:** 必须为所有非平凡的工具函数和后端 API 路由中的复杂逻辑编写。
    - **集成测试:** 必须为关键组件交互流程编写（如开发者认证、核心数据管理组件）。
  - **推荐要求:**
    - **E2E 测试:** 推荐编写 1-2 个覆盖最核心用户流程的 E2E 测试（如开发者登录登出）。
- **测试工具推荐:**
  - **单元/集成测试:** **Vitest + React Testing Library**。
  - **端到端测试:** **Playwright**。
- **测试覆盖率:** 不追求强制的高覆盖率，但应确保关键逻辑和流程得到有效测试。

## 6. 版本控制 (Version Control)

- **分支策略:** 本项目采用单 `main` 分支策略。
- **本地提交:** 鼓励开发者在本地进行频繁的、原子化的 `git commit`，清晰记录开发过程。
- **Push 策略:** **严禁**将未经充分测试或不稳定的代码 `push` 到远程 `main` 分支。只有在功能完成、测试稳定后才可推送。
- **Commit Message 规范:**
  - 每次 `commit` 必须包含清晰、有意义的描述信息，该信息请用**中文**说明。
  - Commit Message 必须以标签开头，标明本次提交的类型。常用标签包括：
    - `[feat]`: 新增功能
    - `[fix]`: 修复 Bug
    - `[refactor]`: 代码重构
    - `[style]`: 代码格式、样式调整
    - `[chore]`: 构建过程或辅助工具变动
    - `[docs]`: 文档更新
    - `[test]`: 增加或修改测试
  - 示例：`[feat] 添加联系表单提交逻辑` 或 `[fix] 修正联系页面对齐问题`。

## 7. 安全 (Security)

- **开发者页面:** 认证和授权机制的设计见 `design.md` 文档。必须严格实现并保护好认证凭据。
- **依赖安全:** 推荐定期运行 `npm audit` 或 `yarn audit` 检查项目依赖是否存在已知的安全漏洞，并及时处理高危漏洞。
- **API 安全:** 后端 API（特别是执行数据修改操作的）应实践基本的安全防护措施，如输入验证、权限检查等。

## 8. 部署 (Deployment)

- **环境变量:**
  - **强制要求:** 所有敏感信息**必须**通过环境变量进行配置。
  - 严禁将敏感信息硬编码或提交到 Git 仓库。
  - 项目根目录应包含 `.env.example` 文件，列出所有需要的环境变量。
  - 生产环境部署时，需在服务器上正确配置环境变量。
- **构建:** 使用项目定义的生产构建命令（通常为 `npm run build` 或 `yarn build`）。
- **部署流程:** 需要制定明确、可靠的流程将构建产物部署到实验室公网服务器。
