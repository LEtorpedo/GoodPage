import React from "react";
import { themeColors } from "@/styles/theme"; // 假设 themeColors 提供了有效的 Tailwind 类名字段串
import { Book, Video, FileText } from "lucide-react";

// 示例 themeColors 结构 (请替换为你实际的主题配置)
// const themeColors = {
//   backgroundLight: 'bg-gradient-to-br from-gray-50 via-stone-50 to-slate-50', // 示例背景
//   textColorPrimary: 'text-gray-900', // 主文字颜色
//   textColorSecondary: 'text-gray-700', // 次要文字颜色 (可能用于作者?)
//   textColorTertiary: 'text-gray-500', // 第三层文字颜色 (用于作者)
//   linkColor: 'text-indigo-600 font-medium', // 链接颜色
//   accentColor: 'text-teal-600', // 图标等强调色
// };

// 学生资源数据数组
const studentResources = [
  {
    icon: Book,
    href: "/MUST_READ_IN_GOOD.pdf",
    title: "GOOD Lab member MUST read",
    author: "Prof. Zichen Xu, NCU",
  },
  {
    icon: FileText,
    href: "http://www.cs.cmu.edu/~harchol/gradschooltalk.pdf",
    title: "Do I really want a Ph.D.?",
    author: "Prof. Mor Harchol-Balter, CMU",
  },
  {
    icon: FileText,
    href: "https://cacm.acm.org/magazines/2017/7/218869-the-beginners-creed/fulltext",
    title: "The Beginner's Creed",
    author: "Prof. Peter J. Denning, Naval Postgraduate School",
  },
  {
    icon: Video,
    href: "https://www.youtube.com/watch?v=a1zDuOPkMSw",
    title: "You and Your Research [video]",
    author: "Dr. Richard Hamming",
  },
  {
    icon: FileText,
    href: "https://www.guan-group.com/documents/research/PhD-Research-Elements-of-Excellence.pdf",
    title: "PhD Research: Elements of Excellence",
    author: "Prof. Ness B. Shroff, The Ohio State University",
  },
  {
    icon: Video,
    href: "https://www.youtube.com/watch?v=kBdfcR-8hEY&list=PL30C13C91CFFEFEA6",
    title: "Justice: What's The Right Thing To Do?",
    author: "Prof. Sandel Michael J, Harvard University",
  },
  {
    icon: Video,
    href: "https://youtu.be/0lpwwOkSR-w",
    title: "How to Succeed in Grad School",
    author: "Panel discussion at The Networking Channel",
  },
  {
    icon: FileText,
    href: "https://drive.google.com/file/d/0Bzis5MXW83vCdUdXYnFIVDVOSkE/view?resourcekey=0-z3gPdGk4ptNuguAM8e8liQ",
    title:
      "How to Have a Bad Career In Research/Academia - A very long title example to demonstrate truncation handling on smaller screens",
    author: "Prof. David Patterson, UC Berkeley",
  }, // 加长标题示例
  {
    icon: FileText,
    href: "http://www.comm.utoronto.ca/~dkundur/2010/04/managing-your-career-as-a-phd/",
    title: "Managing Your Career as a PhD",
    author: "Prof. Deepa Kundur, University of Toronto",
  },
  {
    icon: FileText,
    href: "https://svr-sk818-web.cl.cam.ac.uk/keshav/wiki/index.php/HTRAP",
    title: "How to Read a Paper",
    author: "Prof. Srinivasan Keshav, University of Cambridge",
  },
  {
    icon: FileText,
    href: "https://medium.com/digital-diplomacy/how-to-look-for-ideas-in-computer-science-research-7a3fa6f4696f",
    title: "How to Look for Ideas in Computer Science Research",
    author: "Prof. Zhiyun Qian, University of California, Riverside",
  },
  {
    icon: FileText,
    href: "http://web.mit.edu/dimitrib/www/Ten_Rules.pdf",
    title: "Ten Simple Rules for Mathematical Writing",
    author: "Prof. Dimitri Bertsekas, MIT",
  },
  {
    icon: FileText,
    href: "http://tex.loria.fr/typographie/mathwriting.pdf",
    title: "Mathematical Writing",
    author: "Profs. Donald E. Knuth, Tracy Larrabee, and Paul M. Roberts",
  },
  {
    icon: FileText,
    href: "https://www.cs.cityu.edu.hk/~jia/research/the-art-of-presentation.pdf",
    title: "The Art of Presentations",
    author: "Prof. Baochun Li, University of Toronto",
  },
  {
    icon: Video,
    href: "https://www.youtube.com/watch?v=ji5_MqicxSo",
    title: "Last Lecture: Achieving Your Childhood Dreams",
    author: "Prof. Randy Pausch, CMU",
  },
  {
    icon: Video,
    href: "https://www.youtube.com/watch?v=oTugjssqOT0",
    title: "Time Management",
    author: "Prof. Randy Pausch, CMU",
  },
  {
    icon: FileText,
    href: "https://mp.weixin.qq.com/s/Uh6K2eiUaSDZIGgNJkID5g",
    title: "寒门子弟上名校之后",
    author: "郑雅君, 复旦大学",
  },
  {
    icon: FileText,
    href: "https://www.cecm.sfu.ca/CAG/papers/AdvancedLatex.pdf",
    title: "Advanced LATEX",
    author: "Dan Parker and David Schwein",
  },
];
const StudentsPage: React.FC = () => {
  return (
    // 主容器: 浅色背景, 响应式内边距, 最小高度占满屏幕
    <div
      className={`${themeColors.backgroundLight} min-h-screen p-4 md:p-6 lg:p-8`}
    >
      {/* 内容包装器: 限制最大宽度并在大屏幕上居中 */}
      <div className="max-w-screen-xl mx-auto">
        {" "}
        {/* 保持较宽的最大宽度 */}
        {/* 标题: 响应式文字大小, 居中, 主题色, 底部外边距 */}
        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-center ${themeColors.textColorPrimary} mb-10 md:mb-12 lg:mb-16`}
        >
          For Students
        </h1>
        {/* 列表容器: 始终为单列, 项目之间有垂直间距 */}
        <ul className="space-y-4 md:space-y-5">
          {studentResources.map((item, index) => {
            const IconComponent = item.icon; // 将组件赋给大写字母开头的变量
            return (
              // 列表项 (卡片): 增加大屏幕下的内边距使其更高
              <li
                key={index}
                className="bg-white rounded-lg shadow-md p-4 md:p-6 flex items-start space-x-3 md:space-x-4 hover:shadow-lg hover:bg-gray-50 transition duration-300 ease-in-out"
                // 修改: p-4 -> p-4 md:p-6 使卡片在 md 及以上屏幕更高
              >
                {/* 图标: 主题色, 响应式大小, 固定宽高防止被压缩 */}
                <IconComponent
                  className={`w-5 h-5 md:w-6 md:h-6 ${themeColors.accentColor} flex-shrink-0 mt-1`}
                  aria-hidden="true"
                />

                {/* 文本内容包装器: 占据剩余空间, 管理标题和作者的布局 */}
                <div className="flex-grow min-w-0 md:flex md:flex-row md:items-baseline md:justify-between">
                  {/* 标题链接:
                      小屏幕: 块级显示, 文本溢出时显示省略号 (truncate)
                      大屏幕: 恢复正常换行和显示 (md:whitespace-normal md:overflow-visible)
                  */}
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${themeColors.linkColor} hover:underline text-sm md:text-base font-medium block truncate md:whitespace-normal md:overflow-visible`}
                  >
                    {item.title}
                  </a>

                  {/* 作者/出处:
                      小屏幕: 块级显示, 在标题下方 (mt-1), 允许自然换行
                      大屏幕: 与标题同行右侧, 字体大小调整, 无顶部外边距, 不收缩, 文本溢出时显示省略号 (md:truncate)
                  */}
                  <span
                    className={`${themeColors.textColorTertiary} text-xs md:text-sm block mt-1 md:mt-0 md:ml-4 flex-shrink-0 md:truncate`}
                  >
                    - {item.author}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default StudentsPage;
