import path from "path";
import fs from "fs";

/**
 * 安全文件路径验证工具
 * 防止目录遍历攻击和其他文件系统安全问题
 */

export interface FileValidationOptions {
  /** 允许的文件扩展名（包含点号，如 ['.txt', '.yml', '.yaml']） */
  allowedExtensions: string[];
  /** 基础目录路径 */
  baseDirectory: string;
  /** 最大文件名长度 */
  maxFilenameLength?: number;
  /** 是否允许子目录 */
  allowSubdirectories?: boolean;
}

export interface ValidationResult {
  /** 验证是否通过 */
  isValid: boolean;
  /** 错误信息（如果验证失败） */
  error?: string;
  /** 安全的完整文件路径（如果验证通过） */
  safePath?: string;
  /** 规范化的文件名 */
  normalizedFilename?: string;
  /** 错误类型分类 */
  errorType?: 'PATH_TRAVERSAL' | 'INVALID_EXTENSION' | 'DANGEROUS_CHARS' | 'RESERVED_NAME' | 'SYSTEM_FILE' | 'SHELL_INJECTION' | 'UNICODE_ATTACK' | 'LENGTH_LIMIT' | 'PLATFORM_SPECIFIC';
  /** 风险等级 */
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// 验证结果缓存（提高性能）
const validationCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 1000;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

interface CacheEntry {
  result: ValidationResult;
  timestamp: number;
}

/**
 * 清理过期的缓存条目
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of validationCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      validationCache.delete(key);
    }
  }
}

/**
 * 从缓存获取验证结果
 */
function getCachedResult(cacheKey: string): ValidationResult | null {
  const entry = validationCache.get(cacheKey);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    validationCache.delete(cacheKey);
    return null;
  }

  return entry.result;
}

/**
 * 将验证结果存入缓存
 */
function setCachedResult(cacheKey: string, result: ValidationResult): void {
  // 如果缓存已满，清理过期条目
  if (validationCache.size >= CACHE_MAX_SIZE) {
    cleanExpiredCache();

    // 如果清理后仍然满了，删除最旧的条目
    if (validationCache.size >= CACHE_MAX_SIZE) {
      const firstKey = validationCache.keys().next().value;
      if (firstKey) {
        validationCache.delete(firstKey);
      }
    }
  }

  validationCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
}

/**
 * 验证并清理文件名，防止目录遍历攻击
 * @param filename 用户提供的文件名
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateFilePath(
  filename: string,
  options: FileValidationOptions
): ValidationResult {
  // 生成缓存键（移到 try 外面）
  const cacheKey = `${filename}:${JSON.stringify(options)}`;

  try {
    // 尝试从缓存获取结果
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 1. 基本输入验证
    if (!filename || typeof filename !== "string") {
      const result: ValidationResult = {
        isValid: false,
        error: "文件名不能为空",
        errorType: 'DANGEROUS_CHARS',
        riskLevel: 'HIGH'
      };
      setCachedResult(cacheKey, result);
      return result;
    }

    // 2. 文件名长度检查（更严格的限制）
    const maxLength = options.maxFilenameLength || 30; // 默认限制为30字符，更安全
    if (filename.length > maxLength) {
      const result: ValidationResult = {
        isValid: false,
        error: `文件名长度不能超过 ${maxLength} 个字符（当前: ${filename.length} 字符）`,
        errorType: 'LENGTH_LIMIT',
        riskLevel: filename.length > 200 ? 'HIGH' : 'MEDIUM' // 超过200字符视为高风险
      };
      setCachedResult(cacheKey, result);
      return result;
    }

    // 2.1 检查是否为异常短的文件名（可能是攻击）
    if (filename.length < 3) {
      const result: ValidationResult = {
        isValid: false,
        error: "文件名过短，至少需要3个字符",
        errorType: 'LENGTH_LIMIT',
        riskLevel: 'MEDIUM'
      };
      setCachedResult(cacheKey, result);
      return result;
    }

    // 3. 检查危险字符和路径遍历模式
    const dangerousPatterns = [
      /\.\./,           // 路径遍历 (..)
      /[<>:"|?*]/,      // Windows 保留字符
      /[\x00-\x1f]/,    // 控制字符
      /^\.+$/,          // 只包含点号的文件名
      /\/$|\\$/,        // 以路径分隔符结尾
      /;|&|\||`|\$|\(|\)/,  // Linux shell 特殊字符
      /\s+$/,           // 以空白字符结尾
      /^\s+/,           // 以空白字符开头
    ];

    for (let i = 0; i < dangerousPatterns.length; i++) {
      const pattern = dangerousPatterns[i];
      if (pattern.test(filename)) {
        const result: ValidationResult = {
          isValid: false,
          error: "文件名包含非法字符或路径遍历模式",
          errorType: i === 0 ? 'PATH_TRAVERSAL' : 'DANGEROUS_CHARS', // 第一个是路径遍历模式
          riskLevel: 'CRITICAL'
        };
        setCachedResult(cacheKey, result);
        return result;
      }
    }

    // 4. 检查路径分隔符（如果不允许子目录）
    if (!options.allowSubdirectories) {
      if (filename.includes("/") || filename.includes("\\")) {
        const result: ValidationResult = {
          isValid: false,
          error: "文件名不能包含路径分隔符",
          errorType: 'PATH_TRAVERSAL',
          riskLevel: 'HIGH'
        };
        setCachedResult(cacheKey, result);
        return result;
      }
    }

    // 5. 规范化文件名
    const normalizedFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, "");
    
    // 6. 验证文件扩展名
    const fileExtension = path.extname(normalizedFilename).toLowerCase();
    if (!options.allowedExtensions.includes(fileExtension)) {
      const result: ValidationResult = {
        isValid: false,
        error: `不支持的文件类型。允许的扩展名: ${options.allowedExtensions.join(", ")}`,
        errorType: 'INVALID_EXTENSION',
        riskLevel: 'MEDIUM'
      };
      setCachedResult(cacheKey, result);
      return result;
    }

    // 7. 构建安全的完整路径
    const safePath = path.resolve(options.baseDirectory, normalizedFilename);
    
    // 8. 确保解析后的路径仍在基础目录内（防止符号链接攻击）
    const resolvedBaseDir = path.resolve(options.baseDirectory);
    if (!safePath.startsWith(resolvedBaseDir + path.sep) && safePath !== resolvedBaseDir) {
      const result: ValidationResult = {
        isValid: false,
        error: "文件路径超出允许的目录范围",
        errorType: 'PATH_TRAVERSAL',
        riskLevel: 'CRITICAL'
      };
      setCachedResult(cacheKey, result);
      return result;
    }

    // 9. 检查系统保留文件名（Windows 和 Linux）
    const baseFilename = path.basename(normalizedFilename, fileExtension);
    const baseFilenameUpper = baseFilename.toUpperCase();

    // Windows 保留设备名（不区分大小写）
    const windowsReservedDevices = new Set([
      "CON", "PRN", "AUX", "NUL",
      "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
      "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
    ]);

    // Linux/Unix 系统敏感文件名（区分大小写）
    const unixSensitiveFiles = new Set([
      "passwd", "shadow", "group", "gshadow", "hosts", "fstab", "sudoers",
      "crontab", "profile", "bashrc", "bash_profile", "authorized_keys",
      "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519", "known_hosts"
    ]);

    // 特殊目录名和文件名
    const specialNames = new Set([
      ".", "..", "~", "$", "#"
    ]);

    // 检查 Windows 保留设备名
    if (windowsReservedDevices.has(baseFilenameUpper)) {
      return {
        isValid: false,
        error: "文件名不能使用 Windows 系统保留设备名",
      };
    }

    // 检查 Unix 敏感文件名
    if (unixSensitiveFiles.has(baseFilename)) {
      return {
        isValid: false,
        error: "文件名与系统敏感文件过于相似，存在安全风险",
      };
    }

    // 检查特殊名称
    if (specialNames.has(baseFilename)) {
      return {
        isValid: false,
        error: "文件名不能使用特殊系统字符",
      };
    }

    // 检查是否以系统敏感前缀开头
    const sensitivePatterns = [
      /^\.ssh/i,        // SSH 配置目录
      /^\.gnupg/i,      // GPG 配置目录
      /^\.aws/i,        // AWS 配置目录
      /^\.docker/i,     // Docker 配置目录
      /^\.kube/i,       // Kubernetes 配置目录
      /^config\./i,     // 配置文件
      /^secret/i,       // 密钥文件
      /^private/i,      // 私有文件
      /^backup/i,       // 备份文件
      /^dump/i,         // 转储文件
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(baseFilename)) {
        return {
          isValid: false,
          error: "文件名包含敏感系统前缀，可能存在安全风险",
        };
      }
    }

    // 10. 平台特定检查
    if (process.platform === 'linux' || process.platform === 'darwin') {
      // Unix/Linux 特定检查

      // 阻止创建隐藏文件（以点开头，但不是 . 或 ..）
      if (normalizedFilename.startsWith('.') && !specialNames.has(normalizedFilename)) {
        return {
          isValid: false,
          error: "不允许创建隐藏文件或以点开头的文件",
        };
      }

      // 检查是否包含 Unix 特殊字符
      const unixSpecialChars = /[~`!@#$%^&*()+={}[\]|\\:";'<>?,]/;
      if (unixSpecialChars.test(baseFilename)) {
        return {
          isValid: false,
          error: "文件名包含 Unix 系统特殊字符",
        };
      }

      // 检查文件权限相关的敏感名称
      const permissionSensitivePatterns = [
        /sudo/i, /root/i, /admin/i, /wheel/i, /staff/i,
        /daemon/i, /sys/i, /bin/i, /sbin/i, /usr/i, /var/i,
        /etc/i, /proc/i, /dev/i, /tmp/i, /opt/i, /mnt/i
      ];

      for (const pattern of permissionSensitivePatterns) {
        if (pattern.test(baseFilename)) {
          return {
            isValid: false,
            error: "文件名包含系统权限相关的敏感词汇",
          };
        }
      }
    } else if (process.platform === 'win32') {
      // Windows 特定检查

      // 检查 Windows 特殊字符（更严格）
      const windowsSpecialChars = /[<>:"|?*\x00-\x1f]/;
      if (windowsSpecialChars.test(normalizedFilename)) {
        return {
          isValid: false,
          error: "文件名包含 Windows 系统不允许的字符",
        };
      }

      // 检查是否以空格或点结尾（Windows 不允许）
      if (normalizedFilename.endsWith(' ') || normalizedFilename.endsWith('.')) {
        return {
          isValid: false,
          error: "Windows 系统不允许文件名以空格或点结尾",
        };
      }
    }

    const result: ValidationResult = {
      isValid: true,
      safePath,
      normalizedFilename,
      riskLevel: 'LOW'
    };

    setCachedResult(cacheKey, result);
    return result;

  } catch (error) {
    const result: ValidationResult = {
      isValid: false,
      error: `文件路径验证失败: ${error instanceof Error ? error.message : "未知错误"}`,
      errorType: 'DANGEROUS_CHARS',
      riskLevel: 'HIGH'
    };
    setCachedResult(cacheKey, result);
    return result;
  }
}

/**
 * 安全地检查文件是否存在
 * @param filePath 文件路径
 * @param baseDirectory 基础目录
 * @returns 文件是否存在
 */
export function safeFileExists(filePath: string, baseDirectory: string): boolean {
  try {
    const resolvedPath = path.resolve(filePath);
    const resolvedBaseDir = path.resolve(baseDirectory);
    
    // 确保文件路径在基础目录内
    if (!resolvedPath.startsWith(resolvedBaseDir + path.sep) && resolvedPath !== resolvedBaseDir) {
      return false;
    }
    
    return fs.existsSync(resolvedPath);
  } catch {
    return false;
  }
}

/**
 * 安全地读取文件内容
 * @param filePath 文件路径
 * @param baseDirectory 基础目录
 * @param encoding 文件编码
 * @returns 文件内容或 null
 */
export function safeReadFile(
  filePath: string, 
  baseDirectory: string, 
  encoding: BufferEncoding = "utf8"
): string | null {
  try {
    const resolvedPath = path.resolve(filePath);
    const resolvedBaseDir = path.resolve(baseDirectory);
    
    // 确保文件路径在基础目录内
    if (!resolvedPath.startsWith(resolvedBaseDir + path.sep) && resolvedPath !== resolvedBaseDir) {
      return null;
    }
    
    if (!fs.existsSync(resolvedPath)) {
      return null;
    }
    
    return fs.readFileSync(resolvedPath, encoding);
  } catch {
    return null;
  }
}

/**
 * 为 DBLP 文件验证创建预配置的验证器
 */
export function createDblpFileValidator(baseDirectory: string) {
  return (filename: string) => validateFilePath(filename, {
    allowedExtensions: ['.txt'],
    baseDirectory,
    maxFilenameLength: 30, // DBLP 文件名通常较短，30字符足够
    allowSubdirectories: false,
  });
}

/**
 * 为 YAML 文件验证创建预配置的验证器
 */
export function createYamlFileValidator(baseDirectory: string) {
  return (filename: string) => validateFilePath(filename, {
    allowedExtensions: ['.yml', '.yaml'],
    baseDirectory,
    maxFilenameLength: 30, // YAML 配置文件名通常较短，30字符足够
    allowSubdirectories: false,
  });
}

/**
 * Linux/Unix 环境特定的高级安全检查
 * @param filename 文件名
 * @returns 是否通过安全检查
 */
export function linuxSecurityCheck(filename: string): { isValid: boolean; error?: string } {
  // 1. Shell 元字符检查（更全面）
  const shellMetaChars = /[;&|`$(){}[\]<>'"\\*?~#!]/;
  if (shellMetaChars.test(filename)) {
    return {
      isValid: false,
      error: "文件名包含 shell 元字符，存在命令注入风险",
    };
  }

  // 2. 系统目录路径模拟检查（更精确）
  const systemPathPatterns = [
    /^(dev|proc|sys|tmp|var|etc|usr|bin|sbin|lib|lib64|opt|mnt|media|run|boot)\//i,
    /^\/?(dev|proc|sys|tmp|var|etc|usr|bin|sbin|lib|lib64|opt|mnt|media|run|boot)\//i,
    /\/(dev|proc|sys|tmp|var|etc|usr|bin|sbin|lib|lib64|opt|mnt|media|run|boot)\//i
  ];

  for (const pattern of systemPathPatterns) {
    if (pattern.test(filename)) {
      return {
        isValid: false,
        error: "文件名不能包含系统目录路径",
      };
    }
  }

  // 3. Unicode 控制字符和零宽字符检查
  const dangerousUnicodeChars = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/;
  if (dangerousUnicodeChars.test(filename)) {
    return {
      isValid: false,
      error: "文件名包含不可见的控制字符或零宽字符",
    };
  }

  // 4. 系统配置文件名相似性检查（使用 Set 提高性能）
  const systemFileNames = new Set([
    'passwd', 'shadow', 'group', 'gshadow', 'hosts', 'fstab', 'sudoers',
    'crontab', 'profile', 'bashrc', 'bash_profile', 'zshrc', 'vimrc',
    'authorized_keys', 'known_hosts', 'ssh_config', 'sshd_config',
    'resolv.conf', 'nsswitch.conf', 'pam.conf', 'login.defs',
    'motd', 'issue', 'hostname', 'timezone', 'locale.conf'
  ]);

  const baseFilename = filename.split('.')[0].toLowerCase();
  if (systemFileNames.has(baseFilename)) {
    return {
      isValid: false,
      error: "文件名与系统配置文件名称相同",
    };
  }

  // 5. 检查是否包含系统服务相关名称
  const servicePatterns = [
    /^(apache|nginx|mysql|postgresql|redis|mongodb|docker|kubernetes|systemd)/i,
    /^(ssh|ftp|smtp|http|https|dns|dhcp|nfs|samba|cron|rsyslog)/i,
    /(service|daemon|server|client|admin|root|sudo)$/i
  ];

  for (const pattern of servicePatterns) {
    if (pattern.test(baseFilename)) {
      return {
        isValid: false,
        error: "文件名包含系统服务相关名称，存在安全风险",
      };
    }
  }

  // 6. 检查环境变量注入模式
  const envVarPattern = /\$\{?[A-Z_][A-Z0-9_]*\}?/;
  if (envVarPattern.test(filename)) {
    return {
      isValid: false,
      error: "文件名包含环境变量注入模式",
    };
  }

  // 7. 检查脚本执行模式
  const scriptPatterns = [
    /\.(sh|bash|zsh|csh|ksh|fish)$/i,
    /^(run|exec|start|stop|restart|reload)/i,
    /\|\s*(sh|bash|zsh|csh|ksh|fish|python|perl|ruby|node)/i
  ];

  for (const pattern of scriptPatterns) {
    if (pattern.test(filename)) {
      return {
        isValid: false,
        error: "文件名包含脚本执行相关模式",
      };
    }
  }

  return { isValid: true };
}

/**
 * 增强的文件路径验证（包含 Linux 特定检查）
 */
export function validateFilePathEnhanced(
  filename: string,
  options: FileValidationOptions
): ValidationResult {
  // 首先进行基本验证
  const basicValidation = validateFilePath(filename, options);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // 在 Linux 环境下进行额外的安全检查
  if (process.platform === 'linux' || process.platform === 'darwin') {
    const linuxCheck = linuxSecurityCheck(filename);
    if (!linuxCheck.isValid) {
      return {
        isValid: false,
        error: linuxCheck.error,
      };
    }
  }

  return basicValidation;
}
