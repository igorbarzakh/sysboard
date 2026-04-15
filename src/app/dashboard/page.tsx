import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, prisma } from "@shared/lib";
import styles from "./page.module.scss";

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
    <div className={styles.empty}>
      <p className={styles.title}>No workspace yet</p>
      <p className={styles.subtitle}>
        Create your first workspace to start building diagrams.
      </p>
    </div>
  );
}
