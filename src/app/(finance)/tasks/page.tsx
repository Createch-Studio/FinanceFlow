import { createClient } from "@/lib/supabase/server"
import { TaskBoard } from "@/components/tasks/task-board"
import { AddTaskDialog } from "@/components/tasks/add-task-dialog"

export default async function TasksPage() {
  const supabase = await createClient()
  
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-muted-foreground">Kelola tugas-tugas keuangan Anda</p>
        </div>
        <AddTaskDialog />
      </div>

      <TaskBoard tasks={tasks || []} />
    </div>
  )
}
