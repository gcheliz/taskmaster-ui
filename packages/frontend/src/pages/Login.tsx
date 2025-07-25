import React from 'react'
import { Link, useNavigate, useLocation } from "react-router"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/atoms/Card'
import { Input } from '../components/ui/atoms/Input'
import { Button } from '../components/ui/atoms/Button'
import { Checkbox } from '../components/ui/atoms/Checkbox'
import { useAuth } from '../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { logger } from '../utils/logger'

interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()

  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (error) {
      logger.error('Login failed', error, { email: data.email })
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />

            <div className="flex items-center justify-between">
              <Checkbox label="Remember me" {...register('remember')} />
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={isLoading}>
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
