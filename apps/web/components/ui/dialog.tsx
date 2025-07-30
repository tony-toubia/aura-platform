import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// Root dialog component
export const Dialog = RadixDialog.Root;

// Overlay for dimming the background
export const DialogOverlay: React.FC<React.ComponentProps<typeof RadixDialog.Overlay>> = ({ className, ...props }) => (
  <RadixDialog.Overlay
    className={cn(
      "fixed inset-0 bg-black/50",
      className
    )}
    {...props}
  />
);

// Content wrapper including portal and overlay
export const DialogContent: React.FC<React.ComponentProps<typeof RadixDialog.Content>> = ({ className, children, ...props }) => (
  <RadixDialog.Portal>
    <DialogOverlay />
    <RadixDialog.Content
      className={cn(
        "fixed top-1/2 left-1/2 w-[90vw] max-w-md max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg bg-white p-6",
        className
      )}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </RadixDialog.Portal>
);

// Header section for title & description
export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2",
      className
    )}
    {...props}
  />
);

// Footer section for action buttons
export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex justify-end space-x-2",
      className
    )}
    {...props}
  />
);

// Title text styling
export const DialogTitle: React.FC<React.ComponentProps<typeof RadixDialog.Title>> = ({ className, ...props }) => (
  <RadixDialog.Title
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

// Description text styling
export const DialogDescription: React.FC<React.ComponentProps<typeof RadixDialog.Description>> = ({ className, ...props }) => (
  <RadixDialog.Description
    className={cn(
      "text-sm text-gray-500",
      className
    )}
    {...props}
  />
);
