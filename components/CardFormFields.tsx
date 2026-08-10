import type { UseCardFormReturn } from '@/lib/useCardForm'

export function CardFormFields({
  form,
  showSortOrder,
  nounLabel,
  onSubmit,
}: {
  form: UseCardFormReturn
  showSortOrder: boolean
  /** "tarjeta" o "card": el nombre que usa cada pantalla para el mismo objeto. */
  nounLabel: string
  onSubmit: (activateNow: boolean) => void
}) {
  const { fields } = form
  const busy = form.loading || form.uploadingImage
  const busyLabel = form.uploadingImage
    ? 'Subiendo imagen...'
    : form.loading
      ? 'Creando...'
      : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={fields.title}
          onChange={(e) => form.setTitle(e.target.value)}
          placeholder="Ej. Bienvenida al congreso"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resumen
        </label>
        <textarea
          value={fields.summary}
          onChange={(e) => form.setSummary(e.target.value)}
          placeholder="Descripción breve del contenido..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de destino
        </label>
        <input
          type="url"
          value={fields.url}
          onChange={(e) => form.setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen
        </label>
        <div className="flex flex-col gap-3">
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                form.handleImageFileSelected(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP · Máximo 2 MB</p>
          </div>
          {fields.imagePreview && (
            <div className="relative">
              <img
                src={fields.imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={form.clearImageFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">o usa una URL</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <input
            type="url"
            value={fields.imageUrl}
            onChange={(e) => form.handleImageUrlChanged(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {showSortOrder && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orden
          </label>
          <input
            type="number"
            value={fields.sortOrder}
            onChange={(e) => form.setSortOrder(e.target.value)}
            min="0"
            className="w-32 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Define el orden en que aparece la card en el evento</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vigente desde
          </label>
          <input
            type="datetime-local"
            value={fields.activeFrom}
            onChange={(e) => form.setActiveFrom(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Opcional</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vigente hasta
          </label>
          <input
            type="datetime-local"
            value={fields.activeUntil}
            onChange={(e) => form.setActiveUntil(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Opcional</p>
        </div>
      </div>

      {form.error && <p className="text-red-500 text-sm">{form.error}</p>}

      <div className="flex flex-col gap-2 pt-1">
        <p className="text-xs text-gray-500">
          Solo las {nounLabel}s activas aparecen al escanear el QR. Elige si esta se
          publica de inmediato o la dejas lista para dispararla durante el evento.
        </p>
        <button
          onClick={() => onSubmit(true)}
          disabled={busy}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {busyLabel ?? `Crear ${nounLabel} y activarla ahora`}
        </button>
        <button
          onClick={() => onSubmit(false)}
          disabled={busy}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          {busyLabel ?? `Crear ${nounLabel} y activarla manualmente después`}
        </button>
      </div>
    </div>
  )
}
