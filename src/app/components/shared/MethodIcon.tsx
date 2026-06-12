import { PAYMENT_ICONS } from '../../data/paymentIcons'

export function MethodIcon({
  id,
  icon,
  size = 18,
  style,
}: {
  id: string
  icon: string
  size?: number
  style?: React.CSSProperties
}) {
  const src = PAYMENT_ICONS[id]
  if (src) {
    return (
      <img
        src={src}
        alt={id}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: 4,
          flexShrink: 0,
          ...style,
        }}
      />
    )
  }
  return <span style={{ fontSize: size, ...style }}>{icon}</span>
}
