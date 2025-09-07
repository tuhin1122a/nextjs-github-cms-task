// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { RefreshCw } from "lucide-react";
// import { marked } from "marked";

// export function GitHubDraftsViewer({ files, loading, onRefresh }) {
//   // Soft color palette for cards
//   const colors = [
//     "bg-blue-50 dark:bg-blue-900/40",
//     "bg-green-50 dark:bg-green-900/40",
//     "bg-purple-50 dark:bg-purple-900/40",
//     "bg-pink-50 dark:bg-pink-900/40",
//     "bg-yellow-50 dark:bg-yellow-900/40",
//     "bg-indigo-50 dark:bg-indigo-900/40",
//     "bg-teal-50 dark:bg-teal-900/40",
//   ];

//   const getRandomColor = () =>
//     colors[Math.floor(Math.random() * colors.length)];

//   return (
//     <Card className="bg-blue-50 dark:bg-gray-900/40 shadow-md border border-blue-100 dark:border-gray-700 h-screen flex flex-col">
//       {/* Header */}
//       <CardHeader className="flex flex-row justify-between items-center pb-4">
//         <CardTitle className="text-xl font-semibold">
//           GitHub Drafts (Read-Only - {files.length})
//         </CardTitle>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={onRefresh}
//           disabled={loading}
//         >
//           <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//           <span className="ml-2">Refresh</span>
//         </Button>
//       </CardHeader>

//       {/* Scrollable Card Content */}
//       <CardContent className="space-y-4 overflow-auto flex-1">
//         {loading ? (
//           <p>Loading files...</p>
//         ) : files.length === 0 ? (
//           <p>No markdown files found in the GitHub repository.</p>
//         ) : (
//           files.map((file) => (
//             <Card
//               key={file.name}
//               className={`${getRandomColor()} border border-gray-200 dark:border-gray-700 rounded-lg shadow-md`}
//             >
//               <CardHeader>
//                 <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
//                   {file.name}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div
//                   className="prose max-w-none dark:prose-invert"
//                   dangerouslySetInnerHTML={{
//                     __html: file.content
//                       ? marked(file.content)
//                       : "<em>No content available</em>",
//                   }}
//                 />
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, RefreshCw } from "lucide-react";
import { marked } from "marked";
import { useState } from "react";

export function GitHubDraftsViewer({ files, loading, onRefresh }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colors = [
    "bg-slate-50 border-slate-200",
    "bg-emerald-50 border-emerald-200",
    "bg-blue-50 border-blue-200",
    "bg-amber-50 border-amber-200",
    "bg-violet-50 border-violet-200",
  ];

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const latestFiles = Array.isArray(files) ? files.slice(0, 5) : [];

  return (
    <Card className="bg-white shadow-sm border border-slate-200 h-screen flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-row justify-between items-center pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800">
          GitHub Drafts - Latest 5 ({Array.isArray(files) ? files.length : 0}{" "}
          total)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="border-slate-300 hover:bg-slate-50 bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>

      {/* Scrollable Card Content */}
      <CardContent className="space-y-4 overflow-auto flex-1">
        {loading ? (
          <p className="text-slate-600">Loading files...</p>
        ) : !Array.isArray(files) || files.length === 0 ? (
          <p className="text-slate-600">
            No markdown files found in the GitHub repository.
          </p>
        ) : (
          latestFiles.map((file) => (
            <Card
              key={file.name}
              className={`${getRandomColor()} rounded-lg shadow-sm`}
            >
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  {file.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewFile(file)}
                  className="h-8 w-8 p-0 hover:bg-slate-200"
                >
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>
              </CardHeader>
            </Card>
          ))
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto bg-slate-50 border-slate-200">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {selectedFile?.name || "File Content"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
            <div
              className="prose max-w-none prose-slate 
                         prose-headings:text-slate-900 
                         prose-p:text-slate-700 
                         prose-strong:text-slate-900 
                         prose-code:text-emerald-700 
                         prose-code:bg-emerald-50 
                         prose-pre:bg-slate-900 
                         prose-pre:text-slate-100"
              dangerouslySetInnerHTML={{
                __html: selectedFile?.content
                  ? marked(selectedFile.content)
                  : "<em class='text-slate-500'>No content available</em>",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
