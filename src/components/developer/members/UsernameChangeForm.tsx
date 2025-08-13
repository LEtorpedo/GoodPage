"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, UserCog } from "lucide-react";
import { updateMemberUsername } from "@/app/actions/memberActions"; // Uncomment import
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Define the validation schema using Zod
const usernameSchema = z.object({
  newUsername: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

interface UsernameChangeFormProps {
  memberId: string;
  currentUsername: string | null | undefined;
  isOpen: boolean;
  onToggle: () => void;
  // TODO: Add logic to determine if the current user can change this username
}

export const UsernameChangeForm: React.FC<UsernameChangeFormProps> = ({
  memberId,
  currentUsername,
  isOpen,
  onToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      newUsername: currentUsername ?? "", // Pre-fill with current username if available
    },
  });

  // Watch the value of the newUsername field reactively
  const watchedUsername = form.watch("newUsername");

  const onSubmit = async (data: UsernameFormData) => {
    if (data.newUsername === currentUsername) {
      toast.info(
        "New username is the same as the current one. No changes made."
      );
      return;
    }

    setIsLoading(true);
    toast.info("Attempting to update username...");
    console.log(
      `Attempting username update for member: ${memberId} to ${data.newUsername}`
    );

    try {
      // Call the actual server action
      const result = await updateMemberUsername(memberId, data.newUsername);

      if (result.success) {
        toast.success(`Username updated successfully to: ${data.newUsername}`);
        // Update default value to reflect change immediately in the form
        form.reset({ newUsername: data.newUsername });
      } else {
        // Use the error message from the server action result
        toast.error(
          `Failed to update username: ${result.error || "Unknown error"}`
        );
        // Reset to current username on failure
        form.reset({ newUsername: currentUsername ?? "" });
      }
    } catch (error) {
      console.error("Username update error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast.error(`Error updating username: ${errorMessage}`);
      form.reset({ newUsername: currentUsername ?? "" }); // Reset on catch
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6 mb-6 overflow-hidden border-green-500/50 dark:border-green-400/40 rounded-xl">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer px-3 py-4"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`username-content-${memberId}`}
      >
        <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
          <UserCog className="h-5 w-5" />{" "}
          Change Username
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            isOpen ? "Collapse Change Username" : "Expand Change Username"
          }
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5 text-green-500" />
          </motion.div>
        </Button>
      </CardHeader>
      <motion.div
        id={`username-content-${memberId}`}
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="newUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="newUsername">New Username</FormLabel>
                    <FormControl>
                      <Input
                        id="newUsername"
                        type="text"
                        placeholder="Enter new username"
                        {...field}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isLoading || watchedUsername === currentUsername}
                className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  "Change Username"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </motion.div>
    </Card>
  );
};
