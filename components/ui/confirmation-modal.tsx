'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Vote, Users, MessageSquare } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'delete' | 'vote' | 'member' | 'communication' | 'custom';
  customIcon?: React.ReactNode;
  isLoading?: boolean;
}

const iconMap = {
  delete: Trash2,
  vote: Vote,
  member: Users,
  communication: MessageSquare,
  custom: null,
};

const variantStyles = {
  danger: {
    iconColor: 'text-red-500',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    iconColor: 'text-yellow-500',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    iconColor: 'text-blue-500',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'delete',
  customIcon,
  isLoading = false,
}: ConfirmationModalProps) {
  const IconComponent = icon === 'custom' ? null : iconMap[icon];
  const styles = variantStyles[variant];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-100 ${styles.iconColor}`}>
              {customIcon ? (
                customIcon
              ) : IconComponent ? (
                <IconComponent className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.confirmButton}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
