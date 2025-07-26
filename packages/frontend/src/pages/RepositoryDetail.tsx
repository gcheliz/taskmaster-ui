import React from 'react'
import { useParams } from 'react-router'
import { RepositoryDetailsView } from '../components/Repository/RepositoryDetailsView'

const RepositoryDetail = () => {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>Repository ID is required</div>
  }
  
  return <RepositoryDetailsView repositoryId={id} />
}

export default RepositoryDetail