import { Post } from '../sanity.types';

export const ensurePostType = (posts: any[]): Post[] => {
  return posts.map((post) => ({
    ...post,
    _id: post._id || '',
    _type: post._type || 'post',
    _createdAt: post._createdAt || '',
    _updatedAt: post._updatedAt || '',
    _rev: post._rev || ''
  }));
};
