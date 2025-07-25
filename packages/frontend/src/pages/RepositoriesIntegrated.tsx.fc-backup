import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRepositoryList } from '../hooks/useRepositoryList'
import { useRepositoryOperations } from '../hooks/useRepositoryOperations'
import { RepositoryGrid } from '../components/Repository/RepositoryGrid'
import { RepositoryDashboard } from '../components/Repository/RepositoryDashboard'
import { AddRepository } from '../components/Repository/AddRepository'
import { GitSyncIndicator } from '../components/Repository/GitSyncIndicator'
import { RepositoryStatisticsCard } from '../components/Repository/RepositoryStatisticsCard'
import { CommitActivityChart } from '../components/Repository/CommitActivityChart'
import { ContributorsCard } from '../components/Repository/ContributorsCard'
import { BranchHealthVisualization } from '../components/Repository/BranchHealthVisualization'
import { Button } from '../components/ui/atoms/Button'
import { Modal } from '../components/ui/molecules/Modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/molecules/Tabs'
import { SearchField } from '../components/ui/molecules/SearchField'
import { Spinner } from '../components/ui/atoms/Spinner'
import { Alert } from '../components/ui/molecules/Alert'
import {
  GitBranch,
  Plus,
  Grid3X3,
  LayoutDashboard,
  RefreshCw,
  Settings,
} from 'lucide-react'

const RepositoriesIntegrated: React.FC = () => {
  const navigate = useNavigate()
  const { repositories, isLoading, error, refetch } = useRepositoryList()
  const { connectRepository, disconnectRepository, refreshRepository } = useRepositoryOperations()
  const [viewMode, setViewMode] = useState<'grid' | 'dashboard'>('grid')
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleAddRepository = async (data: { name: string; path: string; url?: string }) => {
    try {
      await connectRepository(data.path)
      setIsAddModalOpen(false)
      refetch()
    } catch (err) {
      logger.error('Failed to add repository:', err)
    }
  }

  const handleRemoveRepository = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this repository?')) {
      try {
        await disconnectRepository(id)
        if (selectedRepositoryId === id) {
          setSelectedRepositoryId(null)
        }
        refetch()
      } catch (err) {
        logger.error('Failed to remove repository:', err)
      }
    }
  }

  const handleSyncRepository = async (id: string) => {
    try {
      await refreshRepository(id)
    } catch (err) {
      logger.error('Failed to sync repository:', err)
    }
  }

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.path?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-600 mt-1">
            Manage your Git repositories and monitor their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedRepositoryId && (
            <GitSyncIndicator repositoryId={selectedRepositoryId} compact />
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Repository
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'dashboard' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="error">
          <p>Failed to load repositories: {error}</p>
        </Alert>
      )}

      {/* Repository Content */}
      {filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {repositories.length === 0 ? 'No repositories yet' : 'No matching repositories'}
          </h3>
          <p className="text-gray-600 mb-4">
            {repositories.length === 0 
              ? 'Add your first repository to get started'
              : 'Try adjusting your search criteria'
            }
          </p>
          {repositories.length === 0 && (
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Repository
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <RepositoryGrid
          repositories={filteredRepositories as any}
          onRepositoryClick={(repo: any) => setSelectedRepositoryId(repo.id)}
          onRepositoryManage={(id) => navigate(`/repositories/${id}/settings`)}
        />
      ) : (
        <Tabs
          value={selectedRepositoryId || filteredRepositories[0]?.id}
          onValueChange={setSelectedRepositoryId}
        >
          <TabsList>
            {filteredRepositories.map(repo => (
              <TabsTrigger key={repo.id} value={repo.id}>
                <GitBranch className="w-4 h-4 mr-2" />
                {repo.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {filteredRepositories.map(repository => (
            <TabsContent key={repository.id} value={repository.id}>
              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{repository.name}</h2>
                    <p className="text-gray-600">{repository.path}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSyncRepository(repository.id)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Sync
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/repositories/${repository.id}/settings`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RepositoryStatisticsCard repositoryId={repository.id} />
                  <CommitActivityChart repositoryId={repository.id} />
                  <ContributorsCard repositoryId={repository.id} />
                  <BranchHealthVisualization repositoryId={repository.id} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Add Repository Modal */}
      <Modal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      >
        <AddRepository
          onRepositoryAdd={async (path) => {
            await handleAddRepository({ name: path.split('/').pop() || 'Repository', path })
          }}
        />
      </Modal>
    </div>
  )
}

export default RepositoriesIntegrated