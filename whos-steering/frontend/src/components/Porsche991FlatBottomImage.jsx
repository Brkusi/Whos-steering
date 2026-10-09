import { useEffect, useState } from 'react';
import { DEFAULT_CONFIG } from '../lib/data';
import { bmwFSeriesConfiguration } from '../lib/bmwFSeriesConfiguration';
import { createFSeriesCompositor } from '../lib/bmwFSeriesComposite';

let previewImage;

function loadPreviewImage() {
  if (!previewImage) {
    const compositor = createFSeriesCompositor('porsche-991');
    const config = bmwFSeriesConfiguration({
      ...DEFAULT_CONFIG,
      brand: 'PORSCHE', wheelStyleType: '911 Performance (991)', bmwShape: 'Flat bottom',
      topBottomMat: 'Perforated Leather', topBottomCol: '#111111',
      sideMat: 'Perforated Leather', sideCol: '#111111', stitchColor: '#111111',
    }, () => null);
    previewImage = compositor.render(config).then(canvas => canvas.toDataURL('image/webp', .92))
      .catch(error => { previewImage = null; throw error; })
      .finally(() => compositor.dispose());
  }
  return previewImage;
}

export default function Porsche991FlatBottomImage({ alt = '', className }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    loadPreviewImage().then(image => { if (active) setSrc(image); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return src ? <img className={className} src={src} alt={alt} /> : null;
}
