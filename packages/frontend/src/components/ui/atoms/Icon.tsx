import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
// Heroicons imports
import {
  CheckIcon as HeroCheckIcon,
  XMarkIcon as HeroXMarkIcon,
  PlusIcon as HeroPlusIcon,
  PencilIcon as HeroPencilIcon,
  TrashIcon as HeroTrashIcon,
  EyeIcon as HeroEyeIcon,
  EyeSlashIcon as HeroEyeSlashIcon,
  ChevronDownIcon as HeroChevronDownIcon,
  ArrowPathIcon as HeroArrowPathIcon,
  // Task Management Icons
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  // Navigation Icons
  HomeIcon,
  Cog6ToothIcon,
  BellIcon,
  // Action Icons
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  // Auth Icons
  LockClosedIcon,
  EnvelopeIcon,
  // Drag & Drop Icons
  Bars3Icon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';

const iconVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-10 w-10',
    },
    color: {
      current: 'text-current',
      primary: 'text-blue-600',
      secondary: 'text-slate-500',
      success: 'text-green-600',
      warning: 'text-amber-600',
      error: 'text-red-600',
      muted: 'text-slate-400',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'sm',
    color: 'current',
  },
});

// Common TaskMaster Icons - Use Heroicons for consistency
export const CheckIcon = HeroCheckIcon;
export const XMarkIcon = HeroXMarkIcon;
export const PlusIcon = HeroPlusIcon;
export const PencilIcon = HeroPencilIcon;
export const TrashIcon = HeroTrashIcon;
export const EyeIcon = HeroEyeIcon;
export const EyeSlashIcon = HeroEyeSlashIcon;

export const ChevronDownIcon = HeroChevronDownIcon;

export const LoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <HeroArrowPathIcon className="animate-spin" {...props} />
);

// Export Heroicons with dark theme support
export const TaskIcon = ClipboardDocumentListIcon;
export const CompleteIcon = CheckCircleIcon;
export const WarningIcon = ExclamationTriangleIcon;
export const TimeIcon = ClockIcon;
export const UserCircleIcon = UserIcon;
export const CalendarDaysIcon = CalendarIcon;
export const TaggedIcon = TagIcon;
export const HomeFilledIcon = HomeIcon;
export const SettingsIcon = Cog6ToothIcon;
export const NotificationIcon = BellIcon;
export const DuplicateIcon = DocumentDuplicateIcon;
export const ArchiveIcon = ArchiveBoxIcon;
export const ShareSocialIcon = ShareIcon;
export const FavoriteIcon = HeartIcon;
export const StarFilledIcon = StarIcon;
export const DragHandleIcon = Bars3Icon;
export const ExpandIcon = ArrowsPointingOutIcon;
export const CursorIcon = CursorArrowRaysIcon;

// Auth icons from Heroicons
export { UserIcon, LockClosedIcon, EnvelopeIcon };

export interface IconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof iconVariants> {
  /**
   * The icon component to render (e.g., CheckIcon, PlusIcon)
   */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Accessible label for the icon
   */
  'aria-label'?: string;
  /**
   * Size of the icon
   * @default 'sm'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Color variant of the icon
   * @default 'current'
   */
  color?:
    | 'current'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'muted'
    | 'white';
}

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      className,
      size,
      color,
      icon: IconComponent,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(iconVariants({ size, color, className }))}
        aria-label={ariaLabel}
        role={ariaLabel ? 'img' : undefined}
        {...props}
      >
        <IconComponent className="h-full w-full" aria-hidden="true" />
      </span>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon, iconVariants };
