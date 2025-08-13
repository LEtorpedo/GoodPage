"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2, KeyRound } from "lucide-react";
import { updateMemberPassword } from "@/app/actions/memberActions"; // Uncomment the import
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Define the validation schema using Zod
const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Set the error on the confirmPassword field
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangeFormProps {
  memberId: string;
  isOpen: boolean;
  onToggle: () => void;
  // TODO: Add logic to determine if the current user can change this password
  // For now, assume it's allowed based on page access.
  // canChangePassword?: boolean;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  memberId,
  isOpen,
  onToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    toast.info("Attempting to update password...");
    console.log(`Attempting password update for member: ${memberId}`);

    try {
      // Call the actual server action
      const result = await updateMemberPassword(memberId, data.newPassword);

      if (result.success) {
        toast.success("Password updated successfully!");
        form.reset(); // Clear the form
      } else {
        // Use the error message from the server action result
        toast.error(
          `Failed to update password: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Password update error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast.error(`Error updating password: ${errorMessage}`);
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
        aria-controls={`password-content-${memberId}`}
      >
        <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
          <KeyRound className="h-5 w-5" />{" "}
          Change Password
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            isOpen ? "Collapse Change Password" : "Expand Change Password"
          }
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5 text-green-500" />
          </motion.div>
        </Button>
      </CardHeader>
      <motion.div
        id={`password-content-${memberId}`}
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
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <FormControl>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                        className="dark:bg-gray-700 dark:border-gray-600"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
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
                disabled={isLoading}
                className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </motion.div>
    </Card>
  );
};
