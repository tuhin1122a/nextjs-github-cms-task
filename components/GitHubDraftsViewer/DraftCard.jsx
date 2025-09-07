"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

export function DraftCard({ file, onView, getColor }) {
  const colorClass = getColor(); // Random subtle background + border color

  return (
    <Card
      className={`${colorClass} rounded-lg border transition-shadow hover:shadow-md cursor-pointer`}
    >
      <CardHeader className="flex justify-between items-center p-4">
        <CardTitle className="text-lg font-semibold text-slate-800">
          {file.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(file)}
          className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-slate-200 transition-colors"
        >
          <Eye className="h-4 w-4 text-slate-600" />
        </Button>
      </CardHeader>
    </Card>
  );
}
