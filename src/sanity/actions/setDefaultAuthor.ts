import { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { singleAuthorMode } from '../env'
import { getFirstAuthor } from '../lib/defaultAuthor'

// This action runs when a new post is created and sets the default author
export const setDefaultAuthorAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { type, draft, published } = props
  
  // Only show for post documents that are new and in single author mode
  const shouldShow = type === 'post' && singleAuthorMode && draft && !published && !draft.author
  
  if (!shouldShow) {
    return null
  }
  
  // Return the action configuration
  return {
    label: 'Set Default Author',
    onHandle: async () => {
      try {
        const author = await getFirstAuthor()
        if (author) {
          console.log('Setting default author:', author)
          // Use the patch function from props directly
          if (props.draft && typeof props.draft.set === 'function') {
            props.draft.set({ author })
          }
          return { message: 'Default author set' }
        } else {
          console.warn('No default author found. Please create an author in your Sanity dataset.')
          return { message: 'No default author found' }
        }
      } catch (error) {
        console.error('Error setting default author:', error)
        return { message: 'Error setting default author' }
      }
    }
  }
}
