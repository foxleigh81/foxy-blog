import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

// Create a client for fetching data
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

// Function to get the first author
// Returns a reference object that can be used as an initialValue for a reference field
export async function getFirstAuthor() {
  try {
    const authors = await client.fetch(`*[_type == "author"] | order(_createdAt asc)[0]`);
    if (authors?._id) {
      return { _ref: authors._id, _type: 'reference' };
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching default author:', error);
    return undefined;
  }
}
