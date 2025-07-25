import React from 'react'

export const TestPage = () => {
  React.useEffect(() => {
    console.info('[TestPage] Component mounted')
    return () => {
      console.info('[TestPage] Component unmounting')
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This is a test page to check navigation</p>
      <button
        onClick={() => console.info('[TestPage] Button clicked')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Button
      </button>
    </div>
  )
}

export default TestPage
