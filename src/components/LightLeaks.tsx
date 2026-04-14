export default function LightLeaks() {
  const leaks = [
    {
      width: 400,
      height: 400,
      top: '-10%',
      left: '-5%',
      background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
      duration: 8,
      delay: 0,
    },
    {
      width: 350,
      height: 350,
      bottom: '-8%',
      right: '-3%',
      background: 'radial-gradient(circle, rgba(212,133,74,0.08) 0%, transparent 70%)',
      duration: 10,
      delay: 3,
    },
    {
      width: 300,
      height: 300,
      top: '40%',
      right: '-10%',
      background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
      duration: 12,
      delay: 5,
    },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}
      aria-hidden="true"
    >
      {leaks.map((leak, i) => (
        <div
          key={i}
          className="light-leak"
          style={{
            width: leak.width,
            height: leak.height,
            top: leak.top,
            left: leak.left,
            bottom: (leak as Record<string, unknown>).bottom as string | undefined,
            right: (leak as Record<string, unknown>).right as string | undefined,
            background: leak.background,
            ['--leak-duration' as string]: `${leak.duration}s`,
            ['--leak-delay' as string]: `${leak.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
