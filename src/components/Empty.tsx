import { cn } from '@/lib/utils'

interface EmptyProps {
  emoji?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function Empty({
  emoji = '🌱',
  title = '暂无内容',
  description = '添加一些内容开始吧',
  actionLabel,
  onAction,
  className,
}: EmptyProps) {
  return (
    <div className={cn('flex h-full items-center justify-center', className)}>
      <div className="text-center py-12 px-6">
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-lg font-serif font-bold text-gray-700 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">{description}</p>
        {actionLabel && onAction && (
          <button onClick={onAction} className="btn-secondary">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
