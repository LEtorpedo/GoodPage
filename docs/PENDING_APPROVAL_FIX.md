# Pending Publication 审核问题修复

## 问题描述

在管理面板的 publication pending 区域，当用户添加 CCF rank 后点击审核通过（approve）按钮时，出现以下问题：

1. 页面没有正确刷新
2. 所有加了 CCF rank 的 publication 从 pending 区域消失
3. 这些 publication 没有出现在 published 区域
4. 用户以为数据丢失了

## 问题分析

经过代码分析，发现这不是服务端逻辑错误，而是前端状态同步问题：

1. **后端逻辑正确**：
   - approve API (`/api/publications/pending/${id}/approve`) 正确将状态从 "pending_review" 更新为 "published"
   - 数据库中的数据确实被正确更新

2. **前端状态同步问题**：
   - pending 区域在 approve 成功后正确移除了该 publication
   - 但是 published 区域没有自动刷新数据
   - 用户看不到新审核通过的 publication，以为数据丢失

## 修复方案

实现了一个简单的组件间通信机制：

### 1. 修改主容器组件 (`MainPublicationContainer.tsx`)

- 添加了 `publishedManagerRef` 来获取 PublishedManager 的刷新方法
- 创建了 `handlePendingApproved` 回调函数
- 将回调传递给 PendingManager

### 2. 修改 PublishedManager (`PublishedManager.tsx`)

- 使用 `forwardRef` 包装组件
- 通过 `useImperativeHandle` 暴露 `refreshPublications` 方法
- 添加了 `PublishedManagerRef` 接口定义

### 3. 修改 PendingManager (`PendingManager.tsx`)

- 添加了 `onApproved` 回调属性
- 在 approve 成功后调用回调函数

### 4. 修改 usePendingActions (`usePendingActions.ts`)

- 让 `approvePublication` 函数返回操作结果（成功/失败）
- 确保只有在操作真正成功时才触发回调

## 修复效果

修复后的流程：

1. 用户在 pending 区域点击 approve 按钮
2. 后端成功将 publication 状态更新为 "published"
3. pending 区域移除该 publication
4. **自动触发 published 区域的数据刷新**
5. 用户可以在 published 区域看到新审核通过的 publication

## 技术细节

### 组件通信架构

```
MainPublicationContainer
├── PublishedManager (ref: publishedManagerRef)
│   └── 暴露: refreshPublications()
└── PendingManager (props: onApproved)
    └── 调用: onApproved() 当 approve 成功时
```

### 关键代码变更

1. **主容器回调机制**：
```typescript
const handlePendingApproved = useCallback(() => {
  if (publishedManagerRef.current) {
    publishedManagerRef.current.refreshPublications();
  }
}, []);
```

2. **PublishedManager ref 暴露**：
```typescript
useImperativeHandle(ref, () => ({
  refreshPublications,
}), [refreshPublications]);
```

3. **PendingManager 成功回调**：
```typescript
const handleApprove = async (id: number) => {
  const success = await approvePublication(id);
  if (success && onApproved) {
    onApproved();
  }
};
```

## 测试建议

1. 在 pending 区域添加一个带 CCF rank 的 publication
2. 点击 approve 按钮
3. 确认 publication 从 pending 区域消失
4. 切换到 published 区域，确认该 publication 出现在列表中
5. 验证 CCF rank 信息正确显示

## 注意事项

- 这个修复保持了现有的模块化架构
- 没有引入复杂的全局状态管理
- 使用了 React 的标准 ref 和回调机制
- 修改最小化，不影响其他功能
