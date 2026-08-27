import { useEffect, useId, useRef, useState } from "react";

function normalizeList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [""];
  }

  return items.map(item => (typeof item === "string" ? item : ""));
}

function mapServerErrors(error) {
  const mappedErrors = {
    title: null,
    description: null,
    ingredients: [],
    ingredientsGroup: null,
    steps: [],
    stepsGroup: null,
    general: null
  };

  if (!Array.isArray(error?.errors)) {
    mappedErrors.general = error?.message || null;
    return mappedErrors;
  }

  error.errors.forEach(serverError => {
    const message =
      typeof serverError?.msg === "string" ? serverError.msg.trim() : "";
    const path = serverError?.path || serverError?.param;

    if (!message) {
      return;
    }

    if (path === "title" || path === "description") {
      mappedErrors[path] ||= message;
      return;
    }

    const listMatch =
      typeof path === "string"
        ? path.match(/^(ingredients|steps)(?:\[(\d+)\]|\.(\d+))?$/)
        : null;

    if (!listMatch) {
      mappedErrors.general ||= message;
      return;
    }

    const listName = listMatch[1];
    const itemIndex = listMatch[2] ?? listMatch[3];

    if (itemIndex === undefined) {
      mappedErrors[`${listName}Group`] ||= message;
      return;
    }

    mappedErrors[listName][Number(itemIndex)] ||= message;
  });

  return mappedErrors;
}

function RecipeForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submissionError,
  onErrorClear,
  submitLabel,
  submittingLabel,
  showImageInput = false
}) {
  const formId = useId();
  const imageInputRef = useRef(null);
  const listInputRefs = useRef({ ingredients: [], steps: [] });
  const pendingListFocusRef = useRef(null);
  const [formData, setFormData] = useState(() => ({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    ingredients: normalizeList(initialValues?.ingredients),
    steps: normalizeList(initialValues?.steps)
  }));
  const [imageFile, setImageFile] = useState(null);
  const [clientErrors, setClientErrors] = useState({
    title: null,
    ingredients: [],
    steps: []
  });

  const serverErrors = mapServerErrors(submissionError);
  const ingredientsCount = formData.ingredients.length;
  const stepsCount = formData.steps.length;

  useEffect(() => {
    const pendingFocus = pendingListFocusRef.current;

    if (!pendingFocus) {
      return;
    }

    const input =
      listInputRefs.current[pendingFocus.listName][pendingFocus.index];

    if (input) {
      input.focus();
      pendingListFocusRef.current = null;
    }
  }, [ingredientsCount, stepsCount]);

  const clearSubmissionError = () => {
    if (submissionError) {
      onErrorClear();
    }
  };

  const handleFieldChange = event => {
    const { name, value } = event.target;

    setFormData(currentData => ({ ...currentData, [name]: value }));
    setClientErrors(currentErrors => ({
      ...currentErrors,
      [name]: null
    }));
    clearSubmissionError();
  };

  const handleListChange = (listName, index, value) => {
    setFormData(currentData => ({
      ...currentData,
      [listName]: currentData[listName].map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    }));
    setClientErrors(currentErrors => ({
      ...currentErrors,
      [listName]: currentErrors[listName].map((message, itemIndex) =>
        itemIndex === index ? null : message
      )
    }));
    clearSubmissionError();
  };

  const addListItem = listName => {
    setFormData(currentData => ({
      ...currentData,
      [listName]: [...currentData[listName], ""]
    }));
    clearSubmissionError();
  };

  const handleListKeyDown = (event, listName, index) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();

    if (!formData[listName][index].trim()) {
      return;
    }

    const nextIndex = index + 1;

    if (nextIndex < formData[listName].length) {
      listInputRefs.current[listName][nextIndex]?.focus();
      return;
    }

    pendingListFocusRef.current = { listName, index: nextIndex };
    addListItem(listName);
  };

  const removeListItem = (listName, index) => {
    setFormData(currentData => {
      if (currentData[listName].length === 1) {
        return currentData;
      }

      return {
        ...currentData,
        [listName]: currentData[listName].filter(
          (item, itemIndex) => itemIndex !== index
        )
      };
    });
    setClientErrors(currentErrors => ({
      ...currentErrors,
      [listName]: currentErrors[listName].filter(
        (message, itemIndex) => itemIndex !== index
      )
    }));
    clearSubmissionError();
  };

  const handleImageChange = event => {
    setImageFile(event.target.files[0] || null);
    clearSubmissionError();
  };

  const clearImageSelection = () => {
    setImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    clearSubmissionError();
  };

  const handleSubmit = event => {
    event.preventDefault();

    const ingredients = formData.ingredients.map(item => item.trim());
    const steps = formData.steps.map(item => item.trim());
    const nextErrors = {
      title: formData.title.trim() ? null : "Bitte gib einen Titel ein.",
      ingredients: [],
      steps: []
    };

    if (!ingredients.some(Boolean)) {
      nextErrors.ingredients[0] = "Bitte gib mindestens eine Zutat ein.";
    }

    if (!steps.some(Boolean)) {
      nextErrors.steps[0] =
        "Bitte gib mindestens einen Zubereitungsschritt ein.";
    }

    setClientErrors(nextErrors);

    if (
      nextErrors.title ||
      nextErrors.ingredients.some(Boolean) ||
      nextErrors.steps.some(Boolean)
    ) {
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      ingredients: ingredients.filter(Boolean),
      steps: steps.filter(Boolean)
    };

    if (showImageInput) {
      payload.imageFile = imageFile;
    }

    onSubmit(payload);
  };

  const renderList = (listName, legend, singularLabel, placeholder) => {
    const groupError = serverErrors[`${listName}Group`];

    return (
      <fieldset className="recipe-form__section">
        <legend>{legend}</legend>

        <div className="recipe-form__list">
          {formData[listName].map((item, index) => {
            const itemError =
              clientErrors[listName][index] || serverErrors[listName][index];
            const errorId = `${formId}-${listName}-${index}-error`;
            const groupErrorId = `${formId}-${listName}-error`;
            const describedBy = [
              itemError ? errorId : null,
              index === 0 && groupError ? groupErrorId : null
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className="recipe-form__list-item" key={index}>
                <div className="recipe-form__list-field">
                  <label htmlFor={`${formId}-${listName}-${index}`}>
                    {singularLabel} {index + 1}
                  </label>
                  <input
                    ref={element => {
                      listInputRefs.current[listName][index] = element;
                    }}
                    id={`${formId}-${listName}-${index}`}
                    type="text"
                    value={item}
                    placeholder={placeholder}
                    onChange={event =>
                      handleListChange(listName, index, event.target.value)
                    }
                    onKeyDown={event =>
                      handleListKeyDown(event, listName, index)
                    }
                    aria-invalid={Boolean(itemError || (index === 0 && groupError))}
                    aria-describedby={describedBy || undefined}
                    disabled={isSubmitting}
                  />
                  {itemError && (
                    <p
                      id={errorId}
                      className="recipe-form__field-error"
                      role="alert"
                    >
                      {itemError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="recipe-form__remove-button"
                  onClick={() => removeListItem(listName, index)}
                  disabled={formData[listName].length === 1 || isSubmitting}
                  aria-label={`${singularLabel} ${index + 1} entfernen`}
                >
                  Entfernen
                </button>
              </div>
            );
          })}
        </div>

        {groupError && (
          <p
            id={`${formId}-${listName}-error`}
            className="recipe-form__field-error"
            role="alert"
          >
            {groupError}
          </p>
        )}

        <button
          type="button"
          className="recipe-form__add-button"
          onClick={() => addListItem(listName)}
          disabled={isSubmitting}
        >
          {singularLabel} hinzufügen
        </button>
      </fieldset>
    );
  };

  const titleError = clientErrors.title || serverErrors.title;

  return (
    <form className="form recipe-form" onSubmit={handleSubmit} noValidate>
      {serverErrors.general && (
        <p className="recipe-form__submit-error" role="alert">
          {serverErrors.general}
        </p>
      )}

      <div className="recipe-form__section">
        <div className="recipe-form__field">
          <label htmlFor={`${formId}-title`}>Titel</label>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            placeholder="Titel des Rezepts"
            value={formData.title}
            onChange={handleFieldChange}
            required
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? `${formId}-title-error` : undefined}
            disabled={isSubmitting}
          />
          {titleError && (
            <p
              id={`${formId}-title-error`}
              className="recipe-form__field-error"
              role="alert"
            >
              {titleError}
            </p>
          )}
        </div>

        <div className="recipe-form__field">
          <label htmlFor={`${formId}-description`}>
            Beschreibung (optional)
          </label>
          <textarea
            id={`${formId}-description`}
            name="description"
            placeholder="Was macht dieses Rezept besonders?"
            value={formData.description}
            onChange={handleFieldChange}
            rows="4"
            aria-invalid={Boolean(serverErrors.description)}
            aria-describedby={
              serverErrors.description
                ? `${formId}-description-error`
                : undefined
            }
            disabled={isSubmitting}
          />
          {serverErrors.description && (
            <p
              id={`${formId}-description-error`}
              className="recipe-form__field-error"
              role="alert"
            >
              {serverErrors.description}
            </p>
          )}
        </div>
      </div>

      {renderList("ingredients", "Zutaten", "Zutat", "z. B. 200 g Mehl")}
      {renderList(
        "steps",
        "Zubereitungsschritte",
        "Schritt",
        "Beschreibe diesen Zubereitungsschritt"
      )}

      {showImageInput && (
        <fieldset className="recipe-form__section">
          <legend>Rezeptbild (optional)</legend>
          <input
            ref={imageInputRef}
            id={`${formId}-image`}
            className="recipe-form__file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
          <label
            className="recipe-form__file-label"
            htmlFor={`${formId}-image`}
          >
            Bild auswählen
          </label>
          {imageFile && (
            <div className="recipe-form__file-selection">
              <p className="recipe-form__selected-file">
                Gewählte Datei: <strong>{imageFile.name}</strong>
              </p>
              <button
                type="button"
                className="recipe-form__clear-file-button"
                onClick={clearImageSelection}
                disabled={isSubmitting}
              >
                Auswahl entfernen
              </button>
            </div>
          )}
        </fieldset>
      )}

      <div className="recipe-form__actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
