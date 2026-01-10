import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { StickerPack } from '../types';
import './StickerPack.css';

export default function StickerPackPage() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<StickerPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

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

  const copyToClipboard = async (filename: string) => {
    if (!pack) return;
    let step = 'init';
    try {
      step = 'fetch_image';
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
        // 转换为blob并复制
        const newBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (newBlob) {
          step = 'write_clipboard_png';
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': newBlob
            })
          ]);
          showToast('已复制到剪贴板!');
        } else {
          throw new Error('Canvas to Blob returned null');
        }
      } else {
        step = 'write_clipboard_other';
        // 非PNG直接复制
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        showToast('已复制到剪贴板!');
      }
    } catch (err: any) {
      console.error('Failed to copy', err);
      
      const errorDetails = [
        `Step: ${step}`,
        `Error: ${err?.name || 'Unknown'}`,
        `Message: ${err?.message || String(err)}`,
        `Type: ${err?.constructor?.name || typeof err}`,
        `Code: ${err?.code || 'N/A'}`,
        '--- Stack ---',
        err?.stack || 'No stack trace available'
      ].join('\n');

      setError(new Error(errorDetails));
      showToast('复制失败，请尝试长按图片保存');
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
            <pre>{error.stack || error.message}</pre>
            <button onClick={() => setError(null)}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
