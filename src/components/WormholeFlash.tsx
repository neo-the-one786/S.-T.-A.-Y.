import { useState } from 'react';

interface WormholeFlashProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function WormholeFlash({ trigger, onComplete }: WormholeFlashProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Trigger the flash
  if (trigger && !visible && !animating) {
    setVisible(true);
    setAnimating(true);
    setTimeout(() => {
      setVisible(false);
      setAnimating(false);
      onComplete?.();
    }, 1200);
  }

  if (!visible) return null;

  return (
    <div className="wormhole-flash">
      <div className="wormhole-flash-inner" />
    </div>
  );
}
