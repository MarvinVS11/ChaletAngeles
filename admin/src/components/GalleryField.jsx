import { fileToDataUrl } from '../utils/fileToDataUrl';

function GalleryField({ label, items, onChange }) {
  function updateItem(index, patch) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { image: '', caption: '' }]);
  }

  async function handleImage(index, file) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      updateItem(index, { image: dataUrl });
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <fieldset className="card-list-field">
      <legend>{label}</legend>

      {items.map((item, index) => (
        <div className="card-list-item" key={index}>
          <div className="card-list-item-fields">
            <label>
              Foto
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(index, e.target.files[0])}
              />
            </label>

            {item.image && <img className="card-list-preview" src={item.image} alt="" />}

            <label>
              Leyenda (opcional)
              <input
                type="text"
                value={item.caption}
                onChange={(e) => updateItem(index, { caption: e.target.value })}
                placeholder="Ej: Sala, Terraza, Habitación principal..."
              />
            </label>
          </div>

          <button type="button" className="btn-remove" onClick={() => removeItem(index)}>
            Eliminar
          </button>
        </div>
      ))}

      <button type="button" className="btn-secondary" onClick={addItem}>
        + Agregar foto
      </button>
    </fieldset>
  );
}

export default GalleryField;
