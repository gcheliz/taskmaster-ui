import React from 'react'
import {
  Sparkles,
  Code2,
  GitBranch,
  Terminal,
  Folder,
  GitBranchPlus,
  Rocket,
  CheckCircle,
  Briefcase,
  BarChart3,
  Users,
  Calendar,
  LayoutDashboard,
  Settings,
  Hand,
  Compass,
  ArrowRight,
  Check,
  Eye,
  ChevronDown,
  List,
  Plus,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { Icon as BaseIcon, type IconProps as BaseIconProps } from './atoms/Icon'

// Map of icon names to icon components
const iconMap = {
  sparkles: Sparkles,
  code: Code2,
  'git-branch': GitBranch,
  terminal: Terminal,
  folder: Folder,
  git: GitBranchPlus,
  rocket: Rocket,
  'check-circle': CheckCircle,
  briefcase: Briefcase,
  'chart-bar': BarChart3,
  users: Users,
  calendar: Calendar,
  dashboard: LayoutDashboard,
  settings: Settings,
  'hand-wave': Hand,
  compass: Compass,
  'arrow-right': ArrowRight,
  check: Check,
  eye: Eye,
  'chevron-down': ChevronDown,
  list: List,
  plus: Plus,
  minimize: Minimize2,
  maximize: Maximize2,
} as const

export interface IconWrapperProps extends Omit<BaseIconProps, 'icon'> {
  name: keyof typeof iconMap
}

export const Icon: React.FC<IconWrapperProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`)
    return null
  }
  
  return <BaseIcon icon={IconComponent} {...props} />
}