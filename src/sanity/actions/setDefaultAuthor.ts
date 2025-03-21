import { DocumentActionComponent, useDocumentOperation } from 'sanity'
import { singleAuthorMode } from '../env'
import { getFirstAuthor } from '../lib/defaultAuthor'
import { useEffect, useState } from 'react'

// This action runs when a new post is created and sets the default author
export const setDefaultAuthorAction: DocumentActionComponent = (props) => {
  const { type, draft, published, id } = props
  const { patch } = useDocumentOperation(id, type)
  const [didRun, setDidRun] = useState(false)
  
  // Use effect to run once when the component mounts
  useEffect(() => {
    // Only run for post documents that are new (no published version) and in single author mode
    // Also check that we haven't already run this effect
    if (type === 'post' && singleAuthorMode && draft && !published && !draft.author && !didRun) {
      setDidRun(true) // Mark as run to prevent multiple executions
      
      // Set the default author
      getFirstAuthor().then(author => {
        if (author) {
          console.log('Setting default author:', author)
          patch.execute([{ set: { author } }])
        } else {
          console.warn('No default author found. Please create an author in your Sanity dataset.')
        }
      }).catch(error => {
        console.error('Error setting default author:', error)
      })
    }
  }, [draft, published, type, patch, didRun])

  // Return null to not show any UI for this action
  return null
}
