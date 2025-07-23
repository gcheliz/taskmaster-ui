import { useMemo } from 'react'
import { designTokens } from '../config/design-tokens'

// Hook to access design tokens in React components
export const useDesignTokens = () => {
  return useMemo(() => {
    // Helper functions to get token values
    const getColor = (path: string): string => {
      const keys = path.split('.')
      let result: any = designTokens.colors
      for (const key of keys) {
        result = result[key]
      }
      return result as string
    }

    const getSpacing = (size: keyof typeof designTokens.spacing): string => {
      return designTokens.spacing[size]
    }

    const getFontSize = (size: keyof typeof designTokens.typography.fontSize): string => {
      return designTokens.typography.fontSize[size]
    }

    const getLineHeight = (size: keyof typeof designTokens.typography.lineHeight): string => {
      return designTokens.typography.lineHeight[size]
    }

    const getFontWeight = (weight: keyof typeof designTokens.typography.fontWeight): number => {
      return designTokens.typography.fontWeight[weight]
    }

    const getBorderRadius = (size: keyof typeof designTokens.borderRadius): string => {
      return designTokens.borderRadius[size]
    }

    const getShadow = (type: keyof typeof designTokens.shadows): string => {
      return designTokens.shadows[type]
    }

    const getZIndex = (level: keyof typeof designTokens.zIndex): number | string => {
      return designTokens.zIndex[level]
    }

    const getBreakpoint = (size: keyof typeof designTokens.breakpoints): string => {
      return designTokens.breakpoints[size]
    }

    const getDuration = (speed: keyof typeof designTokens.animation.duration): string => {
      return designTokens.animation.duration[speed]
    }

    const getTiming = (type: keyof typeof designTokens.animation.timing): string => {
      return designTokens.animation.timing[type]
    }

    return {
      // Direct access to all tokens
      ...designTokens,
      
      // Helper functions
      getColor,
      getSpacing,
      getFontSize,
      getLineHeight,
      getFontWeight,
      getBorderRadius,
      getShadow,
      getZIndex,
      getBreakpoint,
      getDuration,
      getTiming,
      
      // Commonly used combinations
      typography: {
        displayLarge: {
          fontSize: designTokens.typography.fontSize['5xl'],
          lineHeight: designTokens.typography.lineHeight['5xl'],
          fontWeight: designTokens.typography.fontWeight.bold,
          letterSpacing: designTokens.typography.letterSpacing.tight,
        },
        displayMedium: {
          fontSize: designTokens.typography.fontSize['4xl'],
          lineHeight: designTokens.typography.lineHeight['4xl'],
          fontWeight: designTokens.typography.fontWeight.bold,
          letterSpacing: designTokens.typography.letterSpacing.tight,
        },
        displaySmall: {
          fontSize: designTokens.typography.fontSize['3xl'],
          lineHeight: designTokens.typography.lineHeight['3xl'],
          fontWeight: designTokens.typography.fontWeight.semibold,
          letterSpacing: designTokens.typography.letterSpacing.tight,
        },
        headlineLarge: {
          fontSize: designTokens.typography.fontSize['2xl'],
          lineHeight: designTokens.typography.lineHeight['2xl'],
          fontWeight: designTokens.typography.fontWeight.semibold,
        },
        headlineMedium: {
          fontSize: designTokens.typography.fontSize.xl,
          lineHeight: designTokens.typography.lineHeight.xl,
          fontWeight: designTokens.typography.fontWeight.semibold,
        },
        headlineSmall: {
          fontSize: designTokens.typography.fontSize.lg,
          lineHeight: designTokens.typography.lineHeight.lg,
          fontWeight: designTokens.typography.fontWeight.medium,
        },
        bodyLarge: {
          fontSize: designTokens.typography.fontSize.base,
          lineHeight: designTokens.typography.lineHeight.base,
          fontWeight: designTokens.typography.fontWeight.normal,
        },
        bodyMedium: {
          fontSize: designTokens.typography.fontSize.sm,
          lineHeight: designTokens.typography.lineHeight.sm,
          fontWeight: designTokens.typography.fontWeight.normal,
        },
        bodySmall: {
          fontSize: designTokens.typography.fontSize.xs,
          lineHeight: designTokens.typography.lineHeight.xs,
          fontWeight: designTokens.typography.fontWeight.normal,
        },
        code: {
          fontFamily: designTokens.typography.fontFamily.mono.join(', '),
          fontSize: designTokens.typography.fontSize.sm,
          lineHeight: designTokens.typography.lineHeight.sm,
        },
      },
      
      // Component presets
      components: {
        card: {
          padding: designTokens.spacing[6],
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.card,
          backgroundColor: designTokens.colors.background.primary,
          border: `1px solid ${designTokens.colors.border.light}`,
        },
        button: {
          primary: {
            backgroundColor: designTokens.colors.primary[500],
            color: designTokens.colors.text.inverse,
            padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.timing.easeInOut}`,
          },
          secondary: {
            backgroundColor: 'transparent',
            color: designTokens.colors.text.primary,
            padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            border: `1px solid ${designTokens.colors.border.default}`,
            transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.timing.easeInOut}`,
          },
        },
        input: {
          padding: designTokens.spacing[3],
          borderRadius: designTokens.borderRadius.md,
          fontSize: designTokens.typography.fontSize.base,
          border: `1px solid ${designTokens.colors.border.default}`,
          backgroundColor: designTokens.colors.background.primary,
          transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.timing.easeInOut}`,
        },
      },
    }
  }, [])
}

// Type exports
export type UseDesignTokensReturn = ReturnType<typeof useDesignTokens>