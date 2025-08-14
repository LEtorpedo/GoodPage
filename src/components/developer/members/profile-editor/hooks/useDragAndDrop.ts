import { useSensors, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import type { EditablePublication } from "../types";

/**
 * 拖拽和排序功能Hook
 * @returns 传感器配置和拖拽结束处理函数
 */
export const useDragAndDrop = () => {
  // @dnd-kit传感器设置
  const sensors = useSensors(
    useSensor(PointerSensor), // 使用指针事件（鼠标、触摸）
    useSensor(KeyboardSensor, {
      // 使用键盘以实现无障碍功能
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * 拖拽结束处理函数
   * @param event 拖拽结束事件
   * @param items 当前项目列表
   * @param setItems 设置项目列表的函数
   * @returns 更新后的项目列表
   */
  const handleDragEnd = <T extends { id: number }>(
    event: DragEndEvent,
    items: T[],
    setItems: (items: T[]) => void
  ) => {
    const { active, over } = event;

    // 确保'over'不为null再继续
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item) => item.id.toString() === active.id
      );
      const newIndex = items.findIndex(
        (item) => item.id.toString() === over.id
      );

      // 在移动前检查索引是否有效
      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find dragged item index in state.");
        return; // 如果索引查找失败，返回原始项目
      }

      // 使用arrayMove工具进行正确的重排序
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      return newItems;
    }
    return items;
  };

  /**
   * 专门用于发表论文的拖拽结束处理函数
   * @param event 拖拽结束事件
   * @param publications 发表论文列表
   * @param setPublications 设置发表论文列表的函数
   */
  const handlePublicationDragEnd = (
    event: DragEndEvent,
    publications: EditablePublication[],
    setPublications: (publications: EditablePublication[]) => void
  ) => {
    handleDragEnd(event, publications, setPublications);
  };

  return {
    sensors,
    handleDragEnd,
    handlePublicationDragEnd,
  };
};
