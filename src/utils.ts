import { EMsgItem, EMsgType } from './interface';

function mergeText(text:string, result:Array<EMsgItem>) {
  const lastItem = result.slice(-1)[0];
  if (lastItem?.type === EMsgType.text) {
    lastItem.data += text;
  } else {
    result.push({
      type: EMsgType.text,
      data: text,
    });
  }
}

export function getMsgListByNode(el:Node | null, result:EMsgItem[] = []) {
  if (!el) {
    return result;
  }

  Array.from(el.childNodes).forEach((child) => {
    if (child.nodeName === '#text' || child.nodeName === 'SPAN') {
      // 1.处理文本类型
      const text = child.nodeName === '#text'
        ? `${child.nodeValue}`
        : (child as HTMLSpanElement).innerHTML;

      mergeText(text, result);
    } else if (child.nodeName === 'IMG') {
      const imgNode = (child as HTMLImageElement);
      // 2.处理图片类型
      const payload = imgNode.getAttribute('payload') || '';

      switch (imgNode.title) {
        case 'img':
          // 2.1图片
          if (payload) {
            try {
              result.push({
                type: EMsgType.img,
                data: JSON.parse(payload),
              });
            } catch (error) {
              console.error(error);
            }
          }
          break;
        case 'file':
          // 2.2文件
          if (payload) {
            try {
              result.push({
                type: EMsgType.file,
                data: JSON.parse(payload),
              });
            } catch (error) {
              console.error(error);
            }
          }
          break;
        default:
          // 2.3 emoji
          mergeText(`${imgNode.alt}`, result);
          break;
      }
    } else if (child.nodeName === 'DIV') {
      // 递归
      getMsgListByNode(child, result);
    }
  });
  return result;
}

export default {
  getMsgListByNode,
};
