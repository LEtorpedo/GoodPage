"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { ANIMATION_CONFIG, CARD_STYLES } from "../constants";
import type { CollapsibleCardProps } from "../types";

/**
 * 可折叠卡片组件
 */
export function CollapsibleCard({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  className = "",
}: CollapsibleCardProps) {
  return (
    <Card className={`${CARD_STYLES.base} ${className}`}>
      <CardHeader className={CARD_STYLES.header} onClick={onToggle}>
        <CardTitle className={CARD_STYLES.title}>
          {icon}
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
          className="self-center text-green-500 dark:text-green-400"
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5 text-green-500" />
          </motion.div>
        </Button>
      </CardHeader>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: ANIMATION_CONFIG.duration,
          ease: ANIMATION_CONFIG.ease,
        }}
        style={{ overflow: "hidden" }}
      >
        <CardContent className={CARD_STYLES.content}>{children}</CardContent>
      </motion.div>
    </Card>
  );
}
