import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  // Optional deactivate action for aura deletion
  deactivateText?: string;
  onDeactivate?: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  deactivateText,
  onDeactivate
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-left">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription className="text-left mt-2">
          {description}
        </DialogDescription>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          {deactivateText && onDeactivate && (
            <Button
              variant="outline"
              onClick={handleDeactivate}
              className="w-full sm:w-auto bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {deactivateText}
            </Button>
          )}
          <Button
            variant="default"
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : ""
            }`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}