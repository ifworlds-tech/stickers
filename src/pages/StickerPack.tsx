import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { StickerPack } from '../types';
import './StickerPack.css';

export default function StickerPackPage() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<StickerPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`stickers/${id}/manifest.json`)
      .then(res => res.json())
      .then(data => {
        setPack({ ...data, path: id });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load sticker pack', err);
        setLoading(false);
      });
  }, [id]);

  const copyToClipboard = (filename: string) => {
    if (!pack) return;
    
    // 1. 立即根据文件名推断 MIME type，以便同步构造 ClipboardItem
    const ext = filename.split('.').pop()?.toLowerCase();
    let mimeType = 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'webp') mimeType = 'image/webp';

    // 2. 构造一个 Promise，在其中执行耗时的异步操作（Fetch -> Convert -> Blob）
    const blobPromise = (async () => {
      let step = 'fetch_image';
      try {
        const response = await fetch(`stickers/${pack.path}/${filename}`);
        
        step = 'get_blob';
        const blob = await response.blob();
        
        // 如果是PNG，转换为带白色背景的图片以避免黑底问题
        if (blob.type === 'image/png') {
          step = 'create_img_element';
          const img = new Image();
          const url = URL.createObjectURL(blob);
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          
          step = 'create_canvas';
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          
          // 填充白色背景
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 绘制图片
          ctx.drawImage(img, 0, 0);
          
          URL.revokeObjectURL(url);
          
          step = 'canvas_to_blob';
          return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(b => {
              if (b) resolve(b);
              else reject(new Error('Canvas to Blob returned null'));
            }, 'image/png');
          });
        } else {
          // 非PNG直接返回原Blob
          return blob;
        }
      } catch (err: any) {
        // 将步骤信息附加到错误对象上，以便外层捕获
        err.step = step;
        throw err;
      }
    })();

    // 3. 立即调用 write，传入 Promise
    // 这样 Safari 会认为这是用户交互的一部分，并等待 Promise 完成
    try {
      navigator.clipboard.write([
        new ClipboardItem({
          [mimeType]: blobPromise as any // 类型断言：TS 可能尚未完全支持 Promise 作为值
        })
      ]).then(() => {
        showToast('已复制到剪贴板!');
      }).catch((err: any) => {
        console.error('Failed to copy', err);
        
        const errorDetails = [
          `Step: ${err.step || 'clipboard_write'}`,
          `Error: ${err?.name || 'Unknown'}`,
          `Message: ${err?.message || String(err)}`,
          `Type: ${err?.constructor?.name || typeof err}`,
          '--- Stack ---',
          err?.stack || 'No stack trace available'
        ].join('\n');

        setError(errorDetails);
        showToast('复制失败，请尝试长按图片保存');
      });
    } catch (err: any) {
      console.error('Failed to initiate copy', err);
      setError(`Init Error: ${err.message}`);
      showToast('复制启动失败');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!pack) return <div className="error">Pack not found</div>;

  return (
    <div className="sticker-pack-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <div className="pack-header">
        <div className="pack-header-image">
          <img src={`stickers/${pack.path}/${pack.previewImage}`} alt={pack.displayName} />
        </div>
        <h1>{pack.displayName}</h1>
      </div>

      <div className="sticker-grid">
        {pack.stickers.map(sticker => (
          <div key={sticker} className="sticker-card" onClick={() => copyToClipboard(sticker)}>
            <img src={`stickers/${pack.path}/${sticker}`} alt={sticker} loading="lazy" />
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
      
      {error && (
        <div className="error-modal-overlay" onClick={() => setError(null)}>
          <div className="error-modal" onClick={e => e.stopPropagation()}>
            <h3>复制出错</h3>
            <pre>{error}</pre>
            <button onClick={() => setError(null)}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
