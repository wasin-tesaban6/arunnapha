'use client';
import { useState } from 'react';
import { ProductCard, Empty } from './Cards';
import { MARKET_CATEGORIES } from '@/lib/constants';

export default function MarketBrowser({ items }) {
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [hideSold, setHideSold] = useState(false);
  const list = items.filter((p) => (!cat || p.category === cat) && (!hideSold || p.status !== 'sold') && (!q || (p.title + p.description).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="filters">
        <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => setCat('')}>ทั้งหมด</button>
        {MARKET_CATEGORIES.map((c) => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="row" style={{ marginBottom: 22 }}>
        <input className="input" style={{ maxWidth: 360 }} placeholder="ค้นหาสินค้า..." value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="check"><input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} /> ซ่อนสินค้าที่ขายแล้ว</label>
      </div>
      {list.length ? <div className="grid market-grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        : <Empty icon="shop" title={items.length ? 'ไม่พบสินค้า' : 'ยังไม่มีสินค้าในตลาด'}>{items.length ? 'ลองเปลี่ยนตัวกรอง' : 'เป็นคนแรกที่ฝากขายได้เลย!'}</Empty>}
    </>
  );
}
