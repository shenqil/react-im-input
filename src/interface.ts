/**
 * 消息类型
 * */
export enum EMsgType {
  text = 'TEXT',
  img = 'IMG',
  file = 'file',
}

/**
 * 聊天类型
 * */
export enum ECharType {
  single = 'singleMsg',
  group = 'groupMsg',
}

/**
 * 定义文件结构
 * */
export interface IFilePayload {
  fileRealName: string,
  fileSize: string,
  fileUrl?: string,
  localPath?:string // 本地路径
}

/**
 * 定义基本消息结构
 * */
export interface EMsgItem {
  type:EMsgType,
  data:string | IFilePayload
}

/**
 * 表情
 * */
export interface IEmojiItem {
  key:string,
  data:string
}

export default {};
