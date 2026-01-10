import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { StickerPack } from '../types';
import './StickerPack.css';

export default function StickerPackPage() {
  const { id } = useParams<{ id: string }>();
  const [pack, setPack] = useState<StickerPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

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
    try {
      const response = await fetch(`stickers/${pack.path}/${filename}`);
      const blob = await response.blob();
      
      // 如果是PNG，转换为带白色背景的图片以避免黑底问题
      if (blob.type === 'image/png') {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        
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
        
        // 转换为blob并复制
        canvas.toBlob(async (newBlob) => {
          if (newBlob) {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': newBlob
              })
            ]);
            showToast('已复制到剪贴板!');
          }
        }, 'image/png');
      } else {
        // 非PNG直接复制
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        showToast('已复制到剪贴板!');
      }
    } catch (err) {
      console.error('Failed to copy', err);
      showToast('复制失败');
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
    </div>
  );
}
