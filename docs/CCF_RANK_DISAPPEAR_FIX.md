# Pending Publication 消失问题修复

## 问题描述

用户在 pending 区域添加 CCF rank 并且通过审核点击按键时，这些 publication 完全消失了，既不在 pending 区域，也不在 published 区域显示。

## 真正的问题原因

经过深入分析，发现了状态管理的逻辑错误：

### 问题1：错误的状态转换
在 `src/app/api/publications/pending/[id]/route.ts` 中：
- **错误行为**：用户在 pending 区域编辑 publication 时，状态被设置为 "approved"
- **正确行为**：编辑时应该保持 "pending_review" 状态

### 问题2：状态查询不匹配
- `getAllPublicationsFormatted` 只查询 `status: "published"` 的记录
- pending API 只查询 `status: "pending_review"` 的记录
- **结果**：状态为 "approved" 的记录既不在 pending 列表，也不在 published 列表

### 问题3：approve API 状态设置
- approve API 确实将状态设置为 "published"
- 但是如果之前的编辑已经将状态改为 "approved"，那么这些记录就"丢失"了

## 修复方案

### 修复1：纠正 pending 编辑的状态逻辑

修改 `src/app/api/publications/pending/[id]/route.ts`：

```typescript
// 修复前：
const finalStatus = "approved";

// 修复后：
const finalStatus = "pending_review";
```

**原理**：编辑 pending publication 时应该保持 "pending_review" 状态，只有 approve 操作才应该改为 "published"。

### 修复2：数据库修复脚本

创建了 `scripts/fix-approved-status.js` 来修复现有的错误数据：
- 查找所有状态为 "approved" 的记录
- 将它们的状态改为 "published"
- 这样它们就能在 published 区域正常显示

## 正确的状态流转

```
新建 publication -> "pending_review"
    ↓
编辑 publication -> 保持 "pending_review" 
    ↓
approve 操作 -> "published"
    ↓
显示在 published 区域
```

## 执行修复

### 1. 代码修复
代码已经修复，确保未来的编辑不会再出现状态错误。

### 2. 数据修复
运行修复脚本来恢复已经"丢失"的 publication：

```bash
cd GoodPage
node scripts/fix-approved-status.js
```

### 3. 验证修复
1. 运行修复脚本后，检查 published 区域是否显示了之前消失的 publication
2. 验证 CCF rank 信息是否正确保留
3. 测试新的编辑流程是否正常

## 预期结果

修复后：
- ✅ 之前消失的 CCF rank publication 重新出现在 published 区域
- ✅ CCF rank 信息完整保留
- ✅ 未来的编辑不会再导致 publication 消失
- ✅ 状态流转逻辑正确

## 注意事项

1. **备份数据**：在运行修复脚本前建议备份数据库
2. **测试环境**：建议先在测试环境验证修复效果
3. **监控**：修复后监控系统确保没有其他副作用
