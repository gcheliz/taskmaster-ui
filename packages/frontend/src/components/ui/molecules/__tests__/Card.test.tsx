import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card'

describe('Card', () => {
  it('renders basic card', () => {
    render(
      <Card data-testid="card">
        <div>Card content</div>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    render(
      <Card variant="elevated" data-testid="card">
        Content
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveClass('shadow-md')
  })

  it('applies size classes correctly', () => {
    render(
      <Card size="lg" data-testid="card">
        Content
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveClass('p-8')
  })

  it('renders CardHeader with proper styling', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>)

    expect(screen.getByTestId('header')).toHaveClass(
      'flex',
      'flex-col',
      'space-y-1.5',
      'items-start',
      'text-left'
    )
  })

  it('renders CardTitle with proper styling', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)

    expect(screen.getByTestId('title')).toHaveClass(
      'text-headline-medium',
      'font-semibold',
      'leading-none',
      'tracking-tight'
    )
  })

  it('renders CardDescription with proper styling', () => {
    render(<CardDescription data-testid="description">Description</CardDescription>)

    expect(screen.getByTestId('description')).toHaveClass('text-secondary-600')
  })

  it('renders CardContent with proper styling', () => {
    render(<CardContent data-testid="content">Content</CardContent>)

    expect(screen.getByTestId('content')).toHaveClass('pt-0')
  })

  it('renders CardFooter with proper styling', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)

    expect(screen.getByTestId('footer')).toHaveClass(
      'flex',
      'items-center',
      'pt-6',
      'justify-start'
    )
  })
})
