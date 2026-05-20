import {
  createAdminClient,
  fetchAdminCatalog,
  getCurrentSession,
  removeProduct,
  saveProduct,
} from "../utils/admin-portal";
import { formatDateTime, formatStock, truncateText } from "../utils/formatters";
import {
  validateImageFile,
  validatePrice,
  validateProductDescription,
  validateProductName,
  validateStock,
} from "../utils/validators";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

const app = document.getElementById("admin-app");
const message = document.getElementById("admin-message");
const logoutButton = document.getElementById("logout-button");
const form = document.getElementById("product-form");
const saveButton = document.getElementById("save-product");
const resetButton = document.getElementById("reset-form");

const productId = document.getElementById("product-id");
const productImageUrl = document.getElementById("product-image-url");
const productName = document.getElementById(
  "product-name",
) as HTMLInputElement | null;
const productDescription = document.getElementById(
  "product-description",
) as HTMLTextAreaElement | null;
const productPrice = document.getElementById(
  "product-price",
) as HTMLInputElement | null;
const productStock = document.getElementById(
  "product-stock",
) as HTMLInputElement | null;
const productCategory = document.getElementById(
  "product-category",
) as HTMLSelectElement | null;
const productStatus = document.getElementById(
  "product-status",
) as HTMLSelectElement | null;
const productActive = document.getElementById(
  "product-active",
) as HTMLInputElement | null;
const productImage = document.getElementById(
  "product-image",
) as HTMLInputElement | null;
const imagePreview = document.getElementById("image-preview");
const imagePreviewImg = document.getElementById(
  "image-preview-img",
) as HTMLImageElement | null;
const formKicker = document.getElementById("form-kicker");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");
const productsList = document.getElementById("products-list");
const totalProducts = document.getElementById("total-products");
const activeProducts = document.getElementById("active-products");
const lowStockProducts = document.getElementById("low-stock-products");
const imageProducts = document.getElementById("image-products");

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

let catalog: Array<any> = [];
let categories: Array<any> = [];
let statuses: Array<any> = [];
let editingId: number | null = null;

function showMessage(text: string, variant: "error" | "success" = "error") {
  if (!message) return;

  message.textContent = text;
  message.classList.remove(
    "hidden",
    "border-red-200",
    "bg-red-50",
    "text-red-800",
    "border-green-200",
    "bg-green-50",
    "text-green-800",
  );
  message.classList.add(
    variant === "success" ? "border-green-200" : "border-red-200",
    variant === "success" ? "bg-green-50" : "bg-red-50",
    variant === "success" ? "text-green-800" : "text-red-800",
  );
}

function hideMessage() {
  if (!message) return;
  message.classList.add("hidden");
  message.textContent = "";
}

function setLoading(isLoading: boolean) {
  if (saveButton) saveButton.toggleAttribute("disabled", isLoading);
  if (resetButton) resetButton.toggleAttribute("disabled", isLoading);
  if (logoutButton) logoutButton.toggleAttribute("disabled", isLoading);
}

function resetForm() {
  editingId = null;

  if (form) form.reset();
  if (productId) productId.value = "";
  if (productImageUrl) productImageUrl.value = "";
  if (productActive) productActive.checked = true;
  if (imagePreview) imagePreview.classList.add("hidden");
  if (imagePreviewImg) imagePreviewImg.removeAttribute("src");

  if (formKicker) formKicker.textContent = "Nuevo producto";
  if (formTitle) formTitle.textContent = "Crear producto";
  if (formDescription) {
    formDescription.textContent =
      "Completa el formulario para guardar el producto en el catálogo.";
  }
  if (saveButton) saveButton.textContent = "Guardar";
}

function fillSelect(
  select: HTMLSelectElement | null,
  items: Array<{ id: string; name: string }>,
  placeholder: string,
) {
  if (!select) return;

  select.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...items.map((item) => `<option value="${item.id}">${item.name}</option>`),
  ].join("");
}

function renderStats() {
  if (totalProducts) totalProducts.textContent = String(catalog.length);
  if (activeProducts)
    activeProducts.textContent = String(
      catalog.filter((item) => item.active).length,
    );
  if (lowStockProducts)
    lowStockProducts.textContent = String(
      catalog.filter((item) => item.stock < 5).length,
    );
  if (imageProducts)
    imageProducts.textContent = String(
      catalog.filter((item) => item.image_url).length,
    );
}

function renderProducts() {
  if (!productsList) return;

  if (catalog.length === 0) {
    productsList.innerHTML = `
      <div class="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        Aún no hay productos. Crea el primero desde el formulario.
      </div>
    `;
    return;
  }

  productsList.innerHTML = catalog
    .map((product) => {
      const categoryLabel = product.category?.name ?? "Sin categoría";
      const statusLabel = product.status?.name ?? "Sin estado";
      const productImageMarkup = product.image_url
        ? `<img src="${product.image_url}" alt="${product.name}" class="h-28 w-full object-cover" />`
        : `<div class="flex h-28 items-center justify-center bg-linear-to-br from-amber-50 via-stone-50 to-orange-50 text-sm font-semibold text-primary">Sin imagen</div>`;

      return `
        <article class="overflow-hidden rounded-3xl border border-border bg-card">
          <div class="grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
            <div class="overflow-hidden rounded-2xl border border-border bg-muted">${productImageMarkup}</div>
            <div>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">${categoryLabel}</p>
                  <h3 class="mt-1 text-lg font-semibold text-foreground">${product.name}</h3>
                </div>
                <div class="text-right">
                  <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Precio</p>
                  <p class="mt-1 text-lg font-semibold text-foreground">${currencyFormatter.format(product.price)}</p>
                </div>
              </div>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">${truncateText(product.description ?? "", 140)}</p>
              <div class="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                <span class="rounded-full border border-border bg-muted px-3 py-1 text-foreground">${statusLabel}</span>
                <span class="rounded-full border border-border bg-muted px-3 py-1 text-foreground">${formatStock(product.stock)}</span>
                <span class="rounded-full border border-border bg-muted px-3 py-1 text-foreground">${product.active ? "Activo" : "Inactivo"}</span>
                <span class="rounded-full border border-border bg-muted px-3 py-1 text-foreground">${formatDateTime(product.update_at)}</span>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-product-id="${product.id}">Editar</button>
                <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-product-id="${product.id}">Eliminar</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function populateForm(product: any) {
  editingId = product.id;

  if (productId) productId.value = String(product.id);
  if (productName) productName.value = product.name ?? "";
  if (productDescription) productDescription.value = product.description ?? "";
  if (productPrice) productPrice.value = String(product.price ?? 0);
  if (productStock) productStock.value = String(product.stock ?? 0);
  if (productCategory) productCategory.value = product.category_id ?? "";
  if (productStatus) productStatus.value = product.status_id ?? "";
  if (productActive) productActive.checked = Boolean(product.active);
  if (productImageUrl) productImageUrl.value = product.image_url ?? "";

  if (formKicker) formKicker.textContent = "Editando producto";
  if (formTitle) formTitle.textContent = product.name;
  if (formDescription) {
    formDescription.textContent =
      "Ajusta los campos y guarda para actualizar el catálogo.";
  }
  if (saveButton) saveButton.textContent = "Actualizar";

  if (imagePreview && imagePreviewImg) {
    if (product.image_url) {
      imagePreviewImg.src = product.image_url;
      imagePreview.classList.remove("hidden");
    } else {
      imagePreview.classList.add("hidden");
      imagePreviewImg.removeAttribute("src");
    }
  }
}

async function loadCatalog() {
  const state = await fetchAdminCatalog(client);
  catalog = state.products;
  categories = state.categories;
  statuses = state.statuses;

  fillSelect(productCategory, categories, "Selecciona una categoría");
  fillSelect(productStatus, statuses, "Selecciona un estado");
  renderStats();
  renderProducts();
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase public environment variables");
}

const client = createAdminClient(supabaseUrl, supabaseKey);

const session = await getCurrentSession(client);

if (!session) {
  window.location.replace("/admin/login");
} else {
  if (app) app.classList.remove("hidden");
  const adminEmail = document.createElement("p");
  adminEmail.className = "mt-1 text-sm text-muted-foreground";
  adminEmail.textContent = session.user?.email ?? "Sesión activa";
  document.querySelector(".admin-header > div")?.appendChild(adminEmail);

  try {
    await loadCatalog();
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : "No se pudo cargar el catálogo",
    );
  }
}

logoutButton?.addEventListener("click", async () => {
  setLoading(true);
  await client.auth.signOut();
  window.location.replace("/admin/login");
});

resetButton?.addEventListener("click", () => {
  resetForm();
  hideMessage();
});

productImage?.addEventListener("change", () => {
  const file = productImage?.files?.[0] ?? null;

  if (!file) {
    if (imagePreview) imagePreview.classList.add("hidden");
    if (imagePreviewImg) imagePreviewImg.removeAttribute("src");
    return;
  }

  const validation = validateImageFile(file);
  if (validation) {
    showMessage(validation.message);
    if (productImage) productImage.value = "";
    if (imagePreview) imagePreview.classList.add("hidden");
    if (imagePreviewImg) imagePreviewImg.removeAttribute("src");
    return;
  }

  if (imagePreview && imagePreviewImg) {
    imagePreviewImg.src = URL.createObjectURL(file);
    imagePreview.classList.remove("hidden");
  }
  hideMessage();
});

productsList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest("button[data-action]");
  if (!(button instanceof HTMLButtonElement)) return;

  const productIdValue = Number(button.dataset.productId);
  const selectedProduct = catalog.find((item) => item.id === productIdValue);
  if (!selectedProduct) return;

  if (button.dataset.action === "edit") {
    populateForm(selectedProduct);
    hideMessage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`Eliminar ${selectedProduct.name}?`);
    if (!confirmed) return;

    setLoading(true);

    try {
      await removeProduct(client, selectedProduct);
      showMessage("Producto eliminado correctamente", "success");
      await loadCatalog();
      resetForm();
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el producto",
      );
    } finally {
      setLoading(false);
    }
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = String(productName?.value ?? "").trim();
  const description = String(productDescription?.value ?? "").trim();
  const price = Number(productPrice?.value ?? 0);
  const stock = Number(productStock?.value ?? 0);
  const categoryId = String(productCategory?.value ?? "");
  const statusId = String(productStatus?.value ?? "");
  const active = Boolean(productActive?.checked);
  const imageFile = productImage?.files?.[0] ?? null;

  const validationErrors = [
    validateProductName(name),
    validateProductDescription(description),
    validatePrice(price),
    validateStock(stock),
    categoryId ? null : { message: "Selecciona una categoría" },
    statusId ? null : { message: "Selecciona un estado" },
    imageFile ? validateImageFile(imageFile) : null,
  ].filter(Boolean) as Array<{ message: string }>;

  if (validationErrors.length > 0) {
    showMessage(validationErrors[0].message);
    return;
  }

  setLoading(true);

  try {
    await saveProduct(client, {
      active,
      categoryId,
      description,
      existingImageUrl: String(productImageUrl?.value ?? "") || null,
      id: editingId,
      imageFile,
      name,
      price,
      statusId,
      stock,
    });

    showMessage(
      editingId
        ? "Producto actualizado correctamente"
        : "Producto creado correctamente",
      "success",
    );
    await loadCatalog();
    resetForm();
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : "No se pudo guardar el producto",
    );
  } finally {
    setLoading(false);
  }
});
