# NCU GOOD Lab 主页 (Homepage4good)

本项目是南昌大学 GOOD 实验室新版主页的前端实现，使用 Next.js, TypeScript, Tailwind CSS 和 Framer Motion 构建。

## 环境要求

在开始之前，请确保您的开发环境中安装了以下软件：

* [Node.js](https://nodejs.org/) (建议使用 LTS 版本，例如 v18 或 v20)
* [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装)

> 注意：本项目统一使用 npm 作为包管理工具，以确保团队开发环境的一致性。

## 快速开始 (Getting Started)

请按照以下步骤在本地运行项目进行开发：

1. **克隆仓库 (Clone Repository):**
   ```bash
   git clone https://github.com/LEtorpedo/GoodPage
   ```

2. **安装依赖 (Install Dependencies):**
   进入项目根目录 (包含 `package.json` 文件的目录)，然后运行以下命令：
   ```bash
   npm ci
   ```
   > 💡 使用 `npm ci` 而非 `npm install` 可确保依赖版本与团队完全一致，避免环境差异。

3. **运行开发服务器 (Run Development Server):**
   安装完依赖后，运行以下命令启动 Next.js 开发服务器：
   ```bash
   npm run dev
   ```
   此命令会启动一个本地服务器，通常监听在 `http://localhost:3000`。

4. **在浏览器中查看 (View in Browser):**
   打开您的浏览器，访问 [http://localhost:3000](http://localhost:3000)。您应该能看到正在开发的实验室主页。

5. **开始编辑 (Start Editing):**
   项目的主要页面代码位于 `src/app/page.tsx`。您可以开始修改这个文件，保存后页面会自动更新以反映您的更改。

## 主要技术栈

* **框架:** [Next.js](https://nextjs.org/) v15.3.0 (App Router)
* **语言:** [TypeScript](https://www.typescriptlang.org/) v5
* **样式:** [Tailwind CSS](https://tailwindcss.com/) v4.1.3
* **动画:** [Framer Motion](https://www.framer.com/motion/) v12.6.3
* **React:** v19.0.0

## 项目结构 (简要)

```
homepage4good/
├── public/           # 存放静态资源，如图片
├── src/
│   ├── app/          # Next.js App Router 核心目录
│   │   ├── globals.css # 全局 CSS 样式
│   │   ├── layout.tsx  # 根布局文件
│   │   └── page.tsx    # 主页组件
│   └── ...           # 其他组件或页面可以放在这里
├── .env.local        # 本地环境变量 (需自行创建，已加入 .gitignore)
├── .eslintrc.json    # ESLint 配置文件
├── .gitignore        # Git 忽略文件配置
├── next-env.d.ts     # Next.js 类型声明
├── next.config.mjs   # Next.js 配置文件
├── package.json      # 项目依赖和脚本
├── package-lock.json # 依赖版本锁定文件 (请勿手动修改)
├── postcss.config.mjs # PostCSS 配置文件 (用于 Tailwind CSS)
├── README.md         # 项目说明文件 (就是您正在看的这个)
├── tailwind.config.js # Tailwind CSS 配置文件
└── tsconfig.json     # TypeScript 配置文件
```

## 团队协作规范

### Git 工作流
* **主分支:** `main` - 用于生产环境版本，保持稳定
* **开发分支:** `dev` - 用于整合功能，测试稳定后合并到主分支
* **功能分支:** `feature/功能名称` - 从dev分支创建，开发完成后合并回dev

### 代码提交规范
提交信息应当简洁明了，遵循以下格式：
```
<类型>: <简短描述>

<详细描述（可选）>
```

常用类型：
* `feat`: 新功能
* `fix`: 修复bug
* `docs`: 文档更新
* `style`: 代码格式调整（不影响代码运行）
* `refactor`: 代码重构（既不是新功能也不是修bug）
* `test`: 添加测试
* `chore`: 构建过程或辅助工具的变动

### 依赖管理
* 添加新依赖前请在团队内讨论
* 添加依赖使用 `npm install <package> --save` 或 `npm install <package> --save-dev`
* 确保提交代码时同时提交 `package.json` 和 `package-lock.json`

## 常见问题解决

如果遇到依赖问题或环境不一致的情况，可尝试：
```bash
# 清理并重新安装依赖
rm -rf node_modules
npm ci

# 如果出现字体下载问题，可能是网络问题，通常可以忽略
# Next.js 会使用后备字体
```

## 部署指南

项目可部署在 Vercel 上：
1. 将代码推送到 GitHub
2. 在 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 创建新项目并连接仓库
3. 配置环境变量 (如果需要)
4. 点击部署 🚀

更多详情请查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

---
