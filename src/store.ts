export interface ICacheData {
  innerHTML:string,
  files:object
}
export const cacheMap = new Map<string, ICacheData>();

export function removeCache(id:string | undefined) {
  if (id) {
    cacheMap.delete(id);
  } else {
    cacheMap.clear();
  }
}
