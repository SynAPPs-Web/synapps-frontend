import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { LayoutDashboard, Users } from "lucide-react"

export function BoardCard({ board }) {
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 truncate">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          {board.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {board.description || "Bu pano için açıklama bulunmuyor."}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Users className="mr-1 h-3 w-3" />
          {board.member_count || 1} üye
        </div>
      </CardFooter>
    </Card>
  )
}
