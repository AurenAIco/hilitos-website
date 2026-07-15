// ROUTE SKELETON — collection — replace in Verde catalog mission (owner: Verde).
// Type-checks the params shape but performs NO lookup (mission pack §7.4).
export default async function ColeccionSkeletonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main>
      <p>⟨ROUTE SKELETON — /colecciones/{slug} — se implementa en la misión Verde⟩</p>
    </main>
  );
}
