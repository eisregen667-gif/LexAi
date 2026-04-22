// app/(dashboard)/page.tsx
// Redireciona /dashboard → /dashboard/processos (o histórico fica lá)
import { redirect } from "next/navigation";
export default function DashboardRoot() {
  redirect("/processos");
}
