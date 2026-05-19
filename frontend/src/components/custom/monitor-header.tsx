const MonitorHeader = () => (
  <header className="flex flex-col gap-2">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      Monitor en tiempo real
    </p>
    <h1 className="text-2xl font-semibold text-foreground">
      Estado de contenedores Docker
    </h1>
    <p className="text-sm text-muted-foreground">
      CPU, memoria, red y disco por contenedor para identificar cuellos de botella.
    </p>
  </header>
)

export default MonitorHeader
