import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '../../utils/format'

interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  const prevRef = useRef(value)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (prevRef.current !== value && value > 0) {
      setFlash(value > prevRef.current ? 'up' : 'down')
      prevRef.current = value
      const timer = setTimeout(() => setFlash(null), 600)
      return () => clearTimeout(timer)
    }
    prevRef.current = value
  }, [value])

  const flashClass =
    flash === 'up' ? 'animate-flash-up' : flash === 'down' ? 'animate-flash-down' : ''

  return (
    <span className={`inline-block rounded px-1 font-mono transition-colors ${flashClass} ${className}`}>
      {value > 0 ? formatPrice(value) : '—'}
    </span>
  )
}
