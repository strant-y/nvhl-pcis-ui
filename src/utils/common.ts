import Clipboard from "clipboard";

/**
 * 复制功能
 * @param text 要复制的文本
 * @param msg 文本名
 */
export function copyText (text: string, msg?: string) {
  const clipboard = new Clipboard('.copy-button', {
    text: () => text
  });

  clipboard.on('success', (e) => {
    if(!!msg){
      ElMessage.success(`${msg}复制成功！`);
    }
    clipboard.destroy();
  });

  clipboard.on('error', (e) => {
    if(!!msg){
      ElMessage.error(`${msg}复制失败！`);
    }
    clipboard.destroy();
  });
  clipboard.onClick({ currentTarget: document.querySelector('.copy-button') });
}
