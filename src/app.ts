// Template HTML pour les conteneurs
const itemsContainerTemplate: string = `
  <div class="items-container">
    <div class="top-container">
      <h2>Nouvelle liste</h2>
      <button class="delete-container-btn">X</button>
    </div>
    <ul></ul>
    <button class="add-item-btn">Ajouter une tâche</button>
    <form autocomplete="off">
      <div class="top-form-container">
        <label for="item">Ajouter une nouvelle tâche</label>
        <button type="button" class="close-form-btn">X</button>
      </div>
      <input type="text" id="item" />
      <span class="validation-msg"></span>
      <button type="submit">Soumettre</button>
    </form>
  </div>
`;

// Sélection des conteneurs existants
const itemsContainer: NodeListOf<HTMLElement> = document.querySelectorAll('.items-container');
let actualContainer: HTMLElement | null = null;
let actualBtn: HTMLButtonElement | null = null;
let actualUL: HTMLUListElement | null = null;
let actualForm: HTMLFormElement | null = null;
let actualTextInput: HTMLInputElement | null = null;
let actualValidation: HTMLElement | null = null;

// Ajouter des écouteurs à un conteneur
function addContainerListeners(currentContainer: HTMLElement): void {
    const currentUL = currentContainer.querySelector('ul') as HTMLUListElement;
    const currentContainerDeletionBtn = currentContainer.querySelector('.delete-container-btn') as HTMLButtonElement;
    const currentAddItemBtn = currentContainer.querySelector('.add-item-btn') as HTMLButtonElement;
    const currentCloseFormBtn = currentContainer.querySelector('.close-form-btn') as HTMLButtonElement;
    const currentForm = currentContainer.querySelector('form') as HTMLFormElement;

    deleteBtnListeners(currentContainerDeletionBtn);
    addItemBtnListeners(currentAddItemBtn);
    closingFormBtnListeners(currentCloseFormBtn);
    addFormSubmitListeners(currentForm);
    addDeleteDelegation(currentUL);
    addContainerDDListeners(currentContainer);

    const input = currentContainer.querySelector('input') as HTMLInputElement;
    const label = currentContainer.querySelector('label[for="item"]') as HTMLLabelElement;
    const uniqueId = `item-${crypto?.randomUUID?.() ?? Date.now()}`;
    input.id = uniqueId;
    if (label) label.htmlFor = uniqueId;

    const header = currentContainer.querySelector('.top-container') as HTMLElement;
    header.setAttribute('draggable', 'true');
    header.addEventListener('dragstart', handleListDragStart);
    header.addEventListener('dragend', handleListDragEnd);
}

document.querySelectorAll('.items-container[draggable="true"]')
  .forEach(el => (el as HTMLElement).removeAttribute('draggable'));

itemsContainer.forEach((container) => {
    addContainerListeners(container);
});

// Gestion des événements
function deleteBtnListeners(btn: HTMLButtonElement): void {
    btn.addEventListener('click', handleContainerDeletion);
}

function addItemBtnListeners(btn: HTMLButtonElement): void {
    btn.addEventListener('click', handleAddItem);
}

function closingFormBtnListeners(btn: HTMLButtonElement): void {
    btn.addEventListener('click', () => {
        if (!actualBtn || !actualForm) return;
        toggleForm(actualBtn, actualForm, false);
    });
}

function addFormSubmitListeners(form: HTMLFormElement): void {
    form.addEventListener('submit', createNewItem);
}

// Suppression de conteneurs
function handleContainerDeletion(e: Event): void {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.closest('.items-container')?.remove();
}

// Ajouter une tâche
function handleAddItem(e: Event): void {
    const btn = e.target as HTMLButtonElement;
    if (actualBtn && actualForm) toggleForm(actualBtn, actualForm, false);
    setContainerItems(btn);
    if (actualBtn && actualForm) toggleForm(actualBtn, actualForm, true);
}

// Afficher/Masquer le formulaire
function toggleForm(btn: HTMLButtonElement, form: HTMLFormElement, action: boolean): void {
    if (!action) {
        (form.querySelector('input') as HTMLInputElement).value = "";
        (form.querySelector('.validation-msg') as HTMLElement).textContent = "";
        form.style.display = "none";
        btn.style.display = "block";
    } else {
        form.style.display = "block";
        btn.style.display = "none";
    }
}

// Définir les éléments du conteneur actif
function setContainerItems(btn: HTMLButtonElement): void {
    actualBtn = btn;
    actualContainer = btn.parentElement as HTMLElement;
    actualUL = actualContainer.querySelector('ul') as HTMLUListElement;
    actualForm = actualContainer.querySelector('form') as HTMLFormElement;
    actualTextInput = actualContainer.querySelector('input') as HTMLInputElement;
    actualValidation = actualContainer.querySelector('.validation-msg') as HTMLElement;
}

// Créer une nouvelle tâche
function createNewItem(e: Event): void {
    e.preventDefault();
    if (!actualTextInput || !actualValidation || !actualUL) return;

    if (actualTextInput.value.length === 0) {
        actualValidation.textContent = "Must be at least 1 character long";
        return;
    }
    actualValidation.textContent = "";

    const itemContent = actualTextInput.value;
    const li: string = `<li class="item" draggable="true">
      <p>${itemContent}</p>
      <button type="button">X</button>
    </li>`;
    actualUL.insertAdjacentHTML('beforeend', li);
    const item = actualUL.lastElementChild as HTMLElement;

    // handleItemDeletion(liBtn);
    addItemDDListeners(item);
    actualTextInput.value = "";
}

// Suppression d'une tâche
function addDeleteDelegation(ul: HTMLUListElement): void {
    ul.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('li.item > button');
        if (!btn) return;
        const li = (btn as HTMLElement).closest('li.item') as HTMLElement | null;
        if (li) li.remove();
    });
}

// Drag And Drop
let dragSrcEl: HTMLElement | null = null;
let dragListEl: HTMLElement | null = null;

function handleListDragStart(e: DragEvent): void {
    const header = e.target as HTMLElement;
    const container = header.closest('.items-container') as HTMLElement | null;
    if (!container) return;
    dragListEl = container;
    container.classList.add('dragging-list');
    e.dataTransfer?.setData('text/plain', ''); // requis sur certains navigateurs
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
}

function handleListDragEnd(): void {
    dragListEl?.classList.remove('dragging-list');
    dragListEl = null;
}

function addItemDDListeners(item: HTMLElement): void {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
}

document.querySelectorAll('li.item').forEach((li) => {
    (li as HTMLElement).setAttribute('draggable', 'true'); // si pré-rendus
    addItemDDListeners(li as HTMLElement);
});

function handleDragStart(e: DragEvent): void {
    if (actualBtn && actualForm) toggleForm(actualBtn, actualForm, false);
    const target = (e.target as HTMLElement).closest('li.item');
    if (!target) return;
    dragSrcEl = target as HTMLElement;
    target.classList.add('dragging');
    e.dataTransfer?.setData('text/plain', '');
}

function handleDragEnd(): void {
    dragSrcEl?.classList.remove('dragging');
    dragSrcEl = null;
}

function addContainerDDListeners(container: HTMLElement): void {
    const ul = container.querySelector('ul') as HTMLUListElement;

    // 1) Autoriser le drop sur le CONTAINER
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // 2) Réordonnancement précis quand on survole le UL
    ul.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        const dragging = document.querySelector('li.item.dragging') as HTMLElement | null;
        if (!dragging) return;

        const after = getDragAfterElement(ul, e.clientY);
        if (after == null) ul.appendChild(dragging);
        else ul.insertBefore(dragging, after);
    });

    // 3) Drop final : déplace dans la bonne liste
    container.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        const dragging = document.querySelector('li.item.dragging') as HTMLElement | null;
        if (!dragging) return;

        const targetUl = (e.target as HTMLElement)
        .closest('.items-container')
        ?.querySelector('ul') as HTMLUListElement | null;
        if (!targetUl) return;

        // Si on change de liste, calcule la position, 
        // sinon ne rien faire (déjà posé par le dragover du UL)
        if (dragging.parentElement !== targetUl) {
        const after = getDragAfterElement(targetUl, e.clientY);
        if (after == null) targetUl.appendChild(dragging);
        else targetUl.insertBefore(dragging, after);
        }
    });
}

function getDragAfterElement(container: HTMLUListElement, y: number): HTMLElement | null {
    const els = [...container.querySelectorAll<HTMLElement>('li.item:not(.dragging)')];
    let closest: { offset: number; el: HTMLElement | null } = { offset: -Infinity, el: null };

    for (const el of els) {
        const box = el.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        // On veut le plus proche au-dessus du pointeur (offset < 0 mais le plus grand)
        if (offset < 0 && offset > closest.offset) {
        closest = { offset, el };
        }
    }
    return closest.el;
}

// Ajout d'un nouveau conteneur
const addNewContainer = document.querySelector('.add-new-container') as HTMLElement;
const addContainerBtn = document.querySelector('.add-container-btn') as HTMLButtonElement;
const addContainerForm = document.querySelector('.add-new-container form') as HTMLFormElement;
const addContainerFormInput = document.querySelector('.add-new-container input') as HTMLInputElement;
const validationNewContainer = document.querySelector('.add-new-container .validation-msg') as HTMLElement;
const addContainerCloseBtn = document.querySelector('.close-add-list') as HTMLButtonElement;
const containersList = document.querySelector('.main-content') as HTMLElement;

addContainerBtn.addEventListener('click', () => toggleForm(addContainerBtn, addContainerForm, true));
addContainerCloseBtn.addEventListener('click', () => toggleForm(addContainerBtn, addContainerForm, false));
addContainerForm.addEventListener('submit', createNewContainer);

addBoardDDListeners(containersList);

function addBoardDDListeners(board: HTMLElement): void {
    board.addEventListener('dragover', (e: DragEvent) => {
        if (!dragListEl) return;        // on n'agit que si on déplace une liste
        e.preventDefault();

        const after = getListAfterElement(board, e.clientX);
        // placer avant l'élément "after" s'il existe, 
        // sinon juste avant le bloc 'add-new-container'
        const ref = after ?? addNewContainer;
        if (ref) board.insertBefore(dragListEl, ref);
        else board.appendChild(dragListEl);
    });

    board.addEventListener('drop', (e: DragEvent) => {
        if (!dragListEl) return;
        e.preventDefault();
        // rien à faire : le placement final est déjà fait au dragover
    });
}

function getListAfterElement(board: HTMLElement, x: number): HTMLElement | null {
    // toutes les listes sauf celle en cours de drag
    const lists = [...board.querySelectorAll<HTMLElement>('.items-container:not(.dragging-list)')];
    let closest: { offset: number; el: HTMLElement | null } = { offset: -Infinity, el: null };

    for (const el of lists) {
        const box = el.getBoundingClientRect();
        const offset = x - (box.left + box.width / 2);
        if (offset < 0 && offset > closest.offset) {
        closest = { offset, el };
        }
    }
    return closest.el;
}

function createNewContainer(e: Event): void {
    e.preventDefault();
    const name = addContainerFormInput.value.trim();
    if (name.length === 0) {
        validationNewContainer.textContent = "Must be at least 1 character long";
        return;
    }
    validationNewContainer.textContent = "";

    if (addNewContainer) {
        addNewContainer.insertAdjacentHTML('beforebegin', itemsContainerTemplate);
        const newContainer = addNewContainer.previousElementSibling as HTMLElement;

        // Définir le titre de la nouvelle liste
        const h2 = newContainer.querySelector('h2') as HTMLHeadingElement;
        if (h2) h2.textContent = name;

        // Brancher les listeners
        addContainerListeners(newContainer);
    } else {
        containersList.insertAdjacentHTML('beforeend', itemsContainerTemplate);
        const newContainer = containersList.lastElementChild as HTMLElement;

        // Définir le titre ici aussi
        const h2 = newContainer.querySelector('h2') as HTMLHeadingElement;
        if (h2) h2.textContent = name;

        addContainerListeners(newContainer);
    }

    // Reset + fermer le form
    addContainerFormInput.value = "";
    toggleForm(addContainerBtn, addContainerForm, false);
}



/* const itemsContainer = document.querySelectorAll('.items-container') as NodeListOf<HTMLDivElement>

let actualContainer: HTMLDivElement,
    actualBtn: HTMLButtonElement,
    actualUL: HTMLUListElement,
    actualForm: HTMLFormElement,
    actualTextInput: HTMLInputElement,
    actualValidation: HTMLSpanElement;

function addContainerListeners(currentContainer: HTMLDivElement) {

    const currentContainerDeletionBtn = currentContainer.querySelector('.delete-container-btn') as HTMLButtonElement;
    const currentAddItemBtn = currentContainer.querySelector('.add-item-btn') as HTMLButtonElement
    const currentCloseFormBtn = currentContainer.querySelector('.close-form-btn') as HTMLButtonElement
    const currentForm = currentContainer.querySelector('form') as HTMLFormElement

    deleteBtnListeners(currentContainerDeletionBtn)
    addItemBtnListeners(currentAddItemBtn)
    closingFormBtnListeners(currentCloseFormBtn)
    addFormSubmitListeners(currentForm)
    addDDListeners(currentContainer)
}

itemsContainer.forEach((container: HTMLDivElement) => {
    addContainerListeners(container)
})

function deleteBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', handleContainerDeletion)
}
function addItemBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', handleAddItem)
}
function closingFormBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', () => toggleForm(actualBtn, actualForm, false))
}
function addFormSubmitListeners(form: HTMLFormElement) {
    form.addEventListener('submit', createNewItem)
}
function addDDListeners(element: HTMLElement) {
    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('drop', handleDrop)
    element.addEventListener('dragend', handleDragEnd)
}

function handleContainerDeletion(e: MouseEvent) {
    const btn = e.target as HTMLButtonElement;
    const btnsArray = [...document.querySelectorAll('.delete-container-btn')] as HTMLButtonElement[];
    const containers = [...document.querySelectorAll('.items-container')] as HTMLDivElement[];
    containers[btnsArray.indexOf(btn)].remove()
}

function handleAddItem(e: MouseEvent) {
    const btn = e.target as HTMLButtonElement;
    if (actualContainer) toggleForm(actualBtn, actualForm, false);
    setContainerItems(btn);
    toggleForm(actualBtn, actualForm, true)
}

function toggleForm(btn: HTMLButtonElement, form: HTMLFormElement, action: Boolean) {
    if (!action) {
        form.style.display = "none";
        btn.style.display = "block";
    } else if (action) {
        form.style.display = "block";
        btn.style.display = "none";
    }
}

function setContainerItems(btn: HTMLButtonElement) {
    actualBtn = btn;
    actualContainer = btn.parentElement as HTMLDivElement;
    actualUL = actualContainer.querySelector('ul') as HTMLUListElement;
    actualForm = actualContainer.querySelector('form') as HTMLFormElement;
    actualTextInput = actualContainer.querySelector('input') as HTMLInputElement;
    actualValidation = actualContainer.querySelector('.validation-msg') as HTMLSpanElement;
}

function createNewItem(e: Event) {
    e.preventDefault()
    // Validation
    if (actualTextInput.value.length === 0) {
        actualValidation.textContent = "Must be at least 1 character long"
        return;
    } else {
        actualValidation.textContent = ""
    }
    // Création Item
    const itemContent = actualTextInput.value;
    const li = `<li class="item" draggable="true">
    <p>${itemContent}</p>
    <button>X</button>
    </li>`
    actualUL.insertAdjacentHTML('beforeend', li)

    const item = actualUL.lastElementChild as HTMLLIElement;
    const liBtn = item.querySelector('button') as HTMLButtonElement;
    handleItemDeletion(liBtn);
    addDDListeners(item)
    actualTextInput.value = "";
}

function handleItemDeletion(btn: HTMLButtonElement) {
    btn.addEventListener('click', () => {
        const elToRemove = btn.parentElement as HTMLLIElement;
        elToRemove.remove()
    })
}

// Drag And Drop

let dragSrcEl: HTMLElement;
function handleDragStart(this: HTMLElement, e: DragEvent) {
    e.stopPropagation()

    if (actualContainer) toggleForm(actualBtn, actualForm, false);
    dragSrcEl = this;
    e.dataTransfer?.setData('text/html', this.innerHTML)
}
function handleDragOver(e: DragEvent) {
    e.preventDefault()
}
function handleDrop(this: HTMLElement, e: DragEvent) {
    e.stopPropagation()
    const receptionEl = this;

    if (dragSrcEl.nodeName === "LI" && receptionEl.classList.contains("items-container")) {
        (receptionEl.querySelector('ul') as HTMLUListElement).appendChild(dragSrcEl);
        addDDListeners(dragSrcEl)
        handleItemDeletion(dragSrcEl.querySelector("button") as HTMLButtonElement)
    }

    if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer?.getData('text/html') as string;
        if (this.classList.contains("items-container")) {
            addContainerListeners(this as HTMLDivElement)

            this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
                handleItemDeletion(li.querySelector('button') as HTMLButtonElement)
                addDDListeners(li);
            })
        } else {
            addDDListeners(this)
            handleItemDeletion(this.querySelector("button") as HTMLButtonElement)
        }
    }

}

function handleDragEnd(this: HTMLElement, e: DragEvent) {
    e.stopPropagation()
    if (this.classList.contains('items-container')) {
        addContainerListeners(this as HTMLDivElement)
        if (this.querySelectorAll("li")) {
            this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
                handleItemDeletion(li.querySelector('button') as HTMLButtonElement)
                addDDListeners(li);
            })
        }
    } else {
        addDDListeners(this)
    }
}


// Add New Container

const addContainerBtn = document.querySelector('.add-container-btn') as HTMLButtonElement;
const addContainerForm = document.querySelector('.add-new-container form') as HTMLFormElement;
const addContainerFormInput = document.querySelector('.add-new-container input') as HTMLInputElement;
const validationNewContainer = document.querySelector('.add-new-container .validation-msg') as HTMLSpanElement;
const addContainerCloseBtn = document.querySelector('.close-add-list') as HTMLButtonElement;
const addNewContainer = document.querySelector('.add-new-container') as HTMLDivElement;
const containersList = document.querySelector('.main-content') as HTMLDivElement;

addContainerBtn.addEventListener('click', () => {
    toggleForm(addContainerBtn, addContainerForm, true);
})
addContainerCloseBtn.addEventListener('click', () => {
    toggleForm(addContainerBtn, addContainerForm, false)
})
addContainerForm.addEventListener('submit', createNewContainer);

function createNewContainer(e: Event) {
    e.preventDefault()
    if (addContainerFormInput.value.length === 0) {
        validationNewContainer.textContent = "Must be at least 1 character long"
        return;
    } else {
        validationNewContainer.textContent = ""
    }

    const itemsContainer = document.querySelector(".items-container") as HTMLDivElement;
    const newContainer = itemsContainer.cloneNode() as HTMLDivElement;

    const newContainerContent = `
    <div class="top-container">
      <h2>${addContainerFormInput.value}</h2>
      <button class="delete-container-btn">X</button>
    </div>
    <ul></ul>
    <button class="add-item-btn">Ajouter une tâche</button>
    <form autocomplete="off">
      <div class="top-form-container">
        <label for="item">Ajouter une nouvelle tâche</label>
        <button type="button" class="close-form-btn">X</button>
      </div>
      <input type="text" id="item" />
      <span class="validation-msg"></span>
      <button type="submit">Soumettre</button>
    </form>`
    newContainer.innerHTML = newContainerContent;
    containersList.insertBefore(newContainer, addNewContainer)
    addContainerFormInput.value = ""
    addContainerListeners(newContainer);
} */