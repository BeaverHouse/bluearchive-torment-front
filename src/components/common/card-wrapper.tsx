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
    <Card className={className || "my-2 mx-0 gap-3"}>
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-3 py-1 sm:px-6">{children}</CardContent>
    </Card>
  );
};

export default CardWrapper;
