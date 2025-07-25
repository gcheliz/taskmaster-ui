import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import * as zxcvbn from 'zxcvbn'
import { cn } from '../../utils/cn'
import { Button } from '../ui/atoms/Button'
import { Input } from '../ui/atoms/Input'
import { Label } from '../ui/atoms/Label'
import { Checkbox } from '../ui/atoms/Checkbox'
import { Select } from '../ui/atoms/Select'
import { SocialLoginButtons } from './SocialLoginButtons'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import {
  Icon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  BriefcaseIcon,
} from '../ui/atoms/Icon'

export interface RegisterFormProps {
  /**
   * Callback when registration is successful
   */
  onSuccess?: (data: { email: string; name: string; role: string; token: string }) => void
  /**
   * Whether to show social login options
   * @default true
   */
  showSocialLogins?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

// User roles available for registration
const USER_ROLES = [
  { value: 'developer', label: 'Developer' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'qa-engineer', label: 'QA Engineer' },
  { value: 'devops-engineer', label: 'DevOps Engineer' },
  { value: 'product-owner', label: 'Product Owner' },
  { value: 'scrum-master', label: 'Scrum Master' },
  { value: 'other', label: 'Other' },
] as const

// Zod schema for form validation
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .max(100, 'Email must be less than 100 characters'),
    role: z.string().min(1, 'Please select your role'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((password) => {
        const result = zxcvbn(password)
        return result.score >= 3
      }, 'Password is too weak. Please create a stronger password.'),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((value) => value === true, 'You must accept the Terms of Service'),
    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof registerSchema>

export const RegisterForm = ({
  onSuccess,
  showSocialLogins = true,
  className,
}: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      newsletter: false,
    },
  })

  const watchedPassword = watch('password', '')

  // Calculate password strength using zxcvbn
  const passwordStrength = useMemo(() => {
    if (!watchedPassword) return { score: 0, feedback: [] }

    const result = zxcvbn(watchedPassword)

    // Convert zxcvbn score (0-4) to percentage (0-100)
    const score = (result.score / 4) * 100

    // Get feedback from zxcvbn
    const feedback = [
      ...(result.feedback.warning ? [result.feedback.warning] : []),
      ...result.feedback.suggestions,
    ]

    return {
      score: Math.round(score),
      feedback,
      zxcvbnResult: result,
    }
  }, [watchedPassword])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful registration
      const mockToken = 'mock-jwt-token-' + Date.now()
      onSuccess?.({
        email: data.email,
        name: data.name,
        role: data.role,
        token: mockToken,
      })
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Registration failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Social Login Section */}
      {showSocialLogins && (
        <>
          <SocialLoginButtons
            onSuccess={
              onSuccess
                ? (data) =>
                    onSuccess({
                      email: data.email,
                      name: data.name,
                      role: 'other', // Default role for social login
                      token: data.token,
                    })
                : undefined
            }
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or create account with email</span>
            </div>
          </div>
        </>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full Name
          </Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...register('name')}
              error={!!errors.name}
              leftIcon={<Icon icon={UserIcon} size="sm" className="text-slate-400" />}
              className={cn(
                'pl-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-[border-color,background-color,color] duration-300'
              )}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              error={!!errors.email}
              leftIcon={<Icon icon={EnvelopeIcon} size="sm" className="text-slate-400" />}
              className={cn(
                'pl-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-[border-color,background-color,color] duration-300'
              )}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        {/* Role Selection Field */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-slate-700">
            Your Role
          </Label>
          <div className="relative">
            <select
              id="role"
              {...register('role')}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 ease-in-out',
                'pl-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                errors.role && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            >
              <option value="">Select your role...</option>
              {USER_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon icon={BriefcaseIcon} size="sm" />
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password')}
              error={!!errors.password}
              leftIcon={<Icon icon={LockClosedIcon} size="sm" className="text-slate-400" />}
              className={cn(
                'pl-10 pr-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-[border-color,background-color,color] duration-300'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Icon icon={showPassword ? EyeSlashIcon : EyeIcon} size="sm" />
            </button>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {watchedPassword && (
            <PasswordStrengthIndicator password={watchedPassword} strength={passwordStrength} />
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              leftIcon={<Icon icon={LockClosedIcon} size="sm" className="text-slate-400" />}
              className={cn(
                'pl-10 pr-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-[border-color,background-color,color] duration-300'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Icon icon={showConfirmPassword ? EyeSlashIcon : EyeIcon} size="sm" />
            </button>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Terms and Newsletter */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox id="acceptTerms" {...register('acceptTerms')} className="mt-0.5" />
            <Label htmlFor="acceptTerms" className="text-sm text-slate-600 leading-relaxed">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="newsletter" {...register('newsletter')} />
            <Label htmlFor="newsletter" className="text-sm text-slate-600">
              Send me product updates and newsletters
            </Label>
          </div>
        </div>

        {/* Submit Error */}
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading || !isValid}
          className={cn(
            'w-full',
            'bg-gradient-to-r from-purple-600 to-pink-600',
            'hover:from-purple-700 hover:to-pink-700',
            'shadow-lg hover:shadow-xl',
            'backdrop-blur-sm',
            'transition-[border-color,background-color,color] duration-300'
          )}
          size="lg"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* Additional Help */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">
            Sign in instead
          </span>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
