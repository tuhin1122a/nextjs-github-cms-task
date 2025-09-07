"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

export function DraftCard({ file, onView, getColor }) {
  return (
    <Card
      className={`${getColor()} rounded-lg shadow-sm border-gray-200 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-slate-800">
          {file.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(file)}
          className="h-8 w-8 p-0 hover:bg-slate-200"
        >
          <Eye className="h-4 w-4 text-slate-600" />
        </Button>
      </CardHeader>
    </Card>
  );
}
