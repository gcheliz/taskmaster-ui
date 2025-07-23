import React, { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { Card } from '../ui/molecules/Card'
import { Spinner } from '../ui/atoms/Spinner'
import { GitCommit } from 'lucide-react'
import { useRepositoryStatistics } from '../../hooks/useRepositoryData'

export interface CommitActivityChartProps {
  repositoryId: string
  className?: string
  height?: number
}

interface ActivityDay {
  date: string
  commits: number
  dayOfWeek: number
  weekNumber: number
}

export const CommitActivityChart: React.FC<CommitActivityChartProps> = ({
  repositoryId,
  className,
  height = 200,
}) => {
  const { statistics, isLoading, error } = useRepositoryStatistics({ repositoryId })

  const activityData = useMemo(() => {
    if (!statistics?.commits?.byDay) return []

    // Create a map of the last 52 weeks of activity
    const today = new Date()
    const weeks: ActivityDay[][] = []
    const dayMap = new Map<string, number>()

    // Map commits by date
    statistics.commits.byDay.forEach(day => {
      dayMap.set(day.date, day.count)
    })

    // Generate grid for the last year
    for (let week = 51; week >= 0; week--) {
      const weekDays: ActivityDay[] = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (week * 7 + (6 - day)))
        const dateStr = date.toISOString().split('T')[0]
        
        weekDays.push({
          date: dateStr,
          commits: dayMap.get(dateStr) || 0,
          dayOfWeek: day,
          weekNumber: 51 - week,
        })
      }
      weeks.push(weekDays)
    }

    return weeks
  }, [statistics])

  const maxCommits = useMemo(() => {
    return Math.max(...activityData.flat().map(d => d.commits), 1)
  }, [activityData])

  const getIntensityClass = (commits: number) => {
    if (commits === 0) return 'bg-slate-100 dark:bg-slate-800'
    const intensity = commits / maxCommits
    if (intensity < 0.25) return 'bg-green-200 dark:bg-green-900'
    if (intensity < 0.5) return 'bg-green-400 dark:bg-green-700'
    if (intensity < 0.75) return 'bg-green-600 dark:bg-green-500'
    return 'bg-green-800 dark:bg-green-300'
  }

  const monthLabels = useMemo(() => {
    const labels: { month: string; position: number }[] = []
    let lastMonth = -1
    
    activityData.forEach((week, weekIndex) => {
      const month = new Date(week[0].date).getMonth()
      if (month !== lastMonth) {
        labels.push({
          month: new Date(week[0].date).toLocaleDateString('en', { month: 'short' }),
          position: weekIndex
        })
        lastMonth = month
      }
    })
    
    return labels
  }, [activityData])

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center" style={{ height }}>
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !statistics) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-slate-500">
          <GitCommit className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Unable to load commit activity</p>
        </div>
      </Card>
    )
  }

  const totalCommits = activityData.flat().reduce((sum, day) => sum + day.commits, 0)

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Commit Activity</h3>
          </div>
          <p className="text-sm text-slate-500">
            {totalCommits.toLocaleString()} commits in the last year
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex absolute -top-6 left-12" style={{ width: `${activityData.length * 14}px` }}>
          {monthLabels.map((label, i) => (
            <div
              key={i}
              className="absolute text-xs text-slate-500"
              style={{ left: `${label.position * 14}px` }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div className="absolute -left-10 top-0 flex flex-col gap-[2px]">
          <div className="h-3" />
          <div className="text-xs text-slate-500 h-3 leading-3">Mon</div>
          <div className="h-3" />
          <div className="text-xs text-slate-500 h-3 leading-3">Wed</div>
          <div className="h-3" />
          <div className="text-xs text-slate-500 h-3 leading-3">Fri</div>
          <div className="h-3" />
        </div>

        {/* Activity grid */}
        <div className="flex gap-[3px] ml-12">
          {activityData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-500',
                    getIntensityClass(day.commits)
                  )}
                  title={`${day.date}: ${day.commits} commits`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-6 justify-end">
          <span className="text-xs text-slate-500">Less</span>
          <div className="flex gap-[3px]">
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-300" />
          </div>
          <span className="text-xs text-slate-500">More</span>
        </div>
      </div>
    </Card>
  )
}

export default CommitActivityChart