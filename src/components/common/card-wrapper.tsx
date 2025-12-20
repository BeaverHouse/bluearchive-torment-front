import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CardWrapperProps {
  className?: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const CardWrapper = ({
  className,
  icon,
  title,
  description,
  children,
}: CardWrapperProps) => {
  return (
    <Card className={className || "my-3 mx-0"}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-0 text-xs text-left sm:text-right">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2">{children}</CardContent>
    </Card>
  );
};

export default CardWrapper;
