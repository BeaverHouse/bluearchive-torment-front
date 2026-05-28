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
      <CardHeader>
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
      <CardContent className="px-2 py-1">{children}</CardContent>
    </Card>
  );
};

export default CardWrapper;
