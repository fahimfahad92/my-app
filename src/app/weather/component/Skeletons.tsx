import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl shadow-md border border-gray-200 bg-white animate-pulse">
        <CardHeader className="flex flex-col items-center text-center space-y-3">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-16 w-16 bg-gray-200 rounded-full" />
        </CardHeader>
        <CardContent className="px-6 pb-4 space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-28 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
          <div className="h-6 w-20 bg-gray-300 rounded mx-auto" />
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2">
          <div className="h-9 w-full bg-gray-200 rounded" />
          <div className="h-9 w-full bg-gray-200 rounded" />
        </CardFooter>
      </Card>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="h-4 w-64 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-20 bg-gray-100 rounded col-span-2" />
      </div>
      <div className="h-48 bg-gray-100 rounded" />
      <div className="flex justify-end">
        <div className="h-9 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
