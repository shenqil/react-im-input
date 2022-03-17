export interface ICacheData {
  innerHTML:string,
  files:object
}
export const cacheMap = new Map<string, ICacheData>();
