import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CardWrapperProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const CardWrapper = ({
  icon,
  title,
  description,
  children,
}: CardWrapperProps) => {
  return (
    <Card className="my-3 mx-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription className="mt-0 text-xs">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-2">{children}</CardContent>
    </Card>
  );
};

export default CardWrapper;
