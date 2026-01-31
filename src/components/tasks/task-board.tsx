"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Trash2, ArrowRight, Calendar } from "lucide-react"
import type { Task, TaskStatus } from "@/lib/types"

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-gray-100 border-gray-300" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-50 border-blue-300" },
  { id: "done", title: "Done", color: "bg-green-50 border-green-300" },
]

const PRIORITY_CONFIG = {
  low: { label: "Rendah", variant: "secondary" as const },
  medium: { label: "Sedang", variant: "default" as const },
  high: { label: "Tinggi", variant: "destructive" as const },
}

interface TaskBoardProps {
  tasks: Task[]
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    await supabase
      .from("tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId)
    router.refresh()
  }

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId)
    router.refresh()
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id)
        return (
          <Card key={column.id} className={cn("border-2", column.color)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{column.title}</CardTitle>
                <Badge variant="outline">{columnTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentStatus={column.id}
                  onMove={handleMoveTask}
                  onDelete={handleDeleteTask}
                />
              ))}
              {columnTasks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Tidak ada tugas
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface TaskCardProps {
  task: Task
  currentStatus: TaskStatus
  onMove: (taskId: string, newStatus: TaskStatus) => void
  onDelete: (taskId: string) => void
}

function TaskCard({ task, currentStatus, onMove, onDelete }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const nextStatus = currentStatus === "todo" ? "in_progress" : currentStatus === "in_progress" ? "done" : null

  return (
    <div className="p-3 rounded-lg border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {currentStatus !== "todo" && (
              <DropdownMenuItem onClick={() => onMove(task.id, "todo")}>
                Pindah ke To Do
              </DropdownMenuItem>
            )}
            {currentStatus !== "in_progress" && (
              <DropdownMenuItem onClick={() => onMove(task.id, "in_progress")}>
                Pindah ke In Progress
              </DropdownMenuItem>
            )}
            {currentStatus !== "done" && (
              <DropdownMenuItem onClick={() => onMove(task.id, "done")}>
                Pindah ke Done
              </DropdownMenuItem>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Tugas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(task.id)}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <Badge variant={priorityConfig.variant} className="text-xs">
            {priorityConfig.label}
          </Badge>
          {task.due_date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
        {nextStatus && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onMove(task.id, nextStatus)}
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
