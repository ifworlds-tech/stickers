import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StickerPack } from '../types';
import './Home.css';

export default function Home() {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('stickers/index.json')
      .then(res => res.json())
      .then(data => {
        setPacks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load sticker index', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-page">
      <h1>IfWorlds 表情包</h1>
      <div className="pack-grid">
        {packs.map(pack => (
          <Link to={`/pack/${pack.path}`} key={pack.id} className="pack-card">
            <div className="pack-preview">
              <img src={`stickers/${pack.path}/${pack.previewImage}`} alt={pack.displayName} />
            </div>
            <div className="pack-name">{pack.displayName}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
