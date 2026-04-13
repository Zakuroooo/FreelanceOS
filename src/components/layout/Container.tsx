'use client'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  wide?: boolean
}

export default function Container({ 
  children, 
  className = '', 
  wide = false 
}: ContainerProps) {
  return (
    <div
      className={`
        w-full mx-auto px-6 md:px-12
        ${wide ? 'max-w-[1400px]' : 'max-w-[1280px]'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
