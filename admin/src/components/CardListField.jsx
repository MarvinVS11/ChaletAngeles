import { fileToDataUrl } from '../utils/fileToDataUrl';

function CardListField({ label, items, onChange }) {
  function updateItem(index, patch) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { title: '', text: '', image: '' }]);
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
              Título
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                required
              />
            </label>

            <label>
              Texto
              <textarea
                rows="2"
                value={item.text}
                onChange={(e) => updateItem(index, { text: e.target.value })}
                required
              />
            </label>

            <label>
              Imagen
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(index, e.target.files[0])}
              />
            </label>

            {item.image && <img className="card-list-preview" src={item.image} alt="" />}
          </div>

          <button type="button" className="btn-remove" onClick={() => removeItem(index)}>
            Eliminar
          </button>
        </div>
      ))}

      <button type="button" className="btn-secondary" onClick={addItem}>
        + Agregar
      </button>
    </fieldset>
  );
}

export default CardListField;
