import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from './utils';

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn('space-y-4 text-sm text-muted-foreground', className)}>
        <p className="max-w-xl leading-6">{body}</p>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
