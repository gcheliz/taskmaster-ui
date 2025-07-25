# RepositoryHealthModal Component Analysis

## Current Structure (963 lines)

### Main Component
- **RepositoryHealthModal** (lines 113-843)
  - Main modal component with state management
  - Handles period selection, view tabs, and data fetching
  - Contains multiple render methods for different views

### Sub-components
- **HealthSummaryCard** (lines 63-111)
  - Reusable card component for health metrics
  - Already well-separated

### Icon Components (lines 846-961)
- Multiple inline icon components at the bottom of the file

## Identified Logical Boundaries

### 1. **Data Management & Hooks**
- Mock data handling logic (lines 125-218)
- Data transformation logic (chartData, metricsData, issuesBySeverity)
- Could be extracted to custom hooks

### 2. **View Components**
- **Overview View** (renderOverview, lines 294-402)
  - Overall health score display
  - Metrics summary cards
  - Quick stats
  
- **Metrics View** (renderMetrics, lines 404-517)
  - Metrics comparison chart
  - Detailed metrics cards

- **Issues View** (renderIssues, lines 519-605)
  - Issues by severity chart
  - Issues list

- **Trends View** (renderTrends, lines 607-697)
  - Period selector
  - Health trend chart
  - Activity trends

### 3. **Charts & Visualizations**
- Multiple Recharts implementations
- Could be extracted into dedicated chart components

### 4. **Navigation & Controls**
- Tab navigation (lines 729-773)
- Period selector (lines 621-639)

### 5. **Modal Structure**
- Header with navigation
- Body with conditional content
- Footer with actions

## Proposed Component Hierarchy

```
RepositoryHealthModal/
├── index.tsx (main modal container ~150 lines)
├── hooks/
│   ├── useRepositoryHealthData.ts
│   └── useHealthChartData.ts
├── components/
│   ├── HealthOverview.tsx
│   ├── HealthMetrics.tsx
│   ├── HealthIssues.tsx
│   ├── HealthTrends.tsx
│   ├── HealthSummaryCard.tsx (existing)
│   └── charts/
│       ├── HealthScoreRadial.tsx
│       ├── MetricsBarChart.tsx
│       ├── IssuesPieChart.tsx
│       └── TrendsLineChart.tsx
└── icons/
    └── index.tsx (all icon components)
```

## Benefits of Refactoring
1. **Reduced file size**: Target < 300 lines per component
2. **Better maintainability**: Each component has a single responsibility
3. **Improved reusability**: Charts and views can be used elsewhere
4. **Better testing**: Smaller components are easier to test
5. **Performance**: Memoization opportunities for individual components