import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });

  if (workspace) {
    redirect(`/w/${workspace.slug}`);
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24 text-center px-6">
      <p className="text-sm font-semibold text-text-primary">No workspace yet</p>
      <p className="text-sm text-text-secondary max-w-xs">
        Create your first workspace to start building diagrams.
      </p>
    </div>
  );
}
