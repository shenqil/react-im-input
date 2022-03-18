import { IFilePayload } from './interface';

export interface ICacheData {
  innerHTML:string,
  files:any
}
export const cacheMap = new Map<string, ICacheData>();

export function saveHTML(id:string, html:string) {
  const oldItem = cacheMap.get(id);
  if (oldItem) {
    oldItem.innerHTML = html;
    cacheMap.set(id, oldItem);
  }
}

export function getCacheItem(id:string) {
  const curItem = cacheMap.get(id) || { innerHTML: '', files: {} };
  if (!cacheMap.has(id)) {
    cacheMap.set(id, curItem);
  }

  return curItem;
}

export function saveFile(id:string, fileid:string, file:IFilePayload) {
  const item = getCacheItem(id);
  item.files[fileid] = file;
}

export function getFile(id:string, fileid:string):IFilePayload | undefined {
  const item = getCacheItem(id);
  const file = item.files[fileid];
  if (!file) {
    return undefined;
  }

  return file as IFilePayload;
}

export function removeCache(id:string | undefined) {
  if (id) {
    cacheMap.delete(id);
  } else {
    cacheMap.clear();
  }
}
