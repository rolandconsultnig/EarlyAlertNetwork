import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  statusElement: ReactNode;
  iconClass: string;
}

export default function StatusCard({ title, value, icon, statusElement, iconClass }: StatusCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow p-4 border border-neutral-200">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold mt-1 text-neutral-900">{value}</p>
          </div>
          <div className={`p-2 rounded-full ${iconClass}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          {statusElement}
        </div>
      </CardContent>
    </Card>
  );
}
