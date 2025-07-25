export interface HealthGrade {
  grade: string
  color: string
}

export function useHealthGrade(): {
  getHealthGrade: (score: number) => HealthGrade
  getScoreColor: (score: number) => string
} {
  const getHealthGrade = (score: number): HealthGrade => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' }
    if (score >= 80) return { grade: 'A', color: 'text-green-600' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-600' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'F', color: 'text-red-600' }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return { getHealthGrade, getScoreColor }
}