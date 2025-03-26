export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  process.env.SANITY_STUDIO_SANITY_API_VERSION ||
  '2023-05-03';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production',
  'Missing environment variable for dataset'
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable for project ID'
);

export const singleAuthorMode =
  process.env.NEXT_PUBLIC_SINGLE_AUTHOR_MODE === 'true' ||
  process.env.SANITY_STUDIO_SINGLE_AUTHOR_MODE === 'true' ||
  false;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}
