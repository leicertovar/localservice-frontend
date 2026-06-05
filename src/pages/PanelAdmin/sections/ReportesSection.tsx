interface StatsData {
  total_usuarios: number;
  proveedores_verificados: number;
  verificaciones_pendientes: number;
  resenas_reportadas: number;
  clientes_count: number;
  proveedores_count: number;
  categorias: { categoria_servicio: string; total: number }[];
}

interface Props {
  stats: StatsData;
}

const ReportesSection = ({ stats }: Props) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Reportes y Estadísticas</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Usuarios por Rol</h3>
          <div className="space-y-4">
            {[
              { label: "Clientes", value: stats.clientes_count, total: stats.total_usuarios, color: "bg-primary" },
              { label: "Proveedores", value: stats.proveedores_count, total: stats.total_usuarios, color: "bg-amber-500" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.value} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold text-foreground mb-4">Categorías con Proveedores</h3>
          <div className="space-y-3">
            {stats.categorias.map((s, i) => (
              <div key={s.categoria_servicio} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <span className="text-sm text-foreground font-medium">{i + 1}. {s.categoria_servicio}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {s.total} proveedor{s.total !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
            {stats.categorias.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No hay proveedores registrados todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesSection;
