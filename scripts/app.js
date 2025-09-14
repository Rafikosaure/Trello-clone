"use strict";
// Template HTML pour les conteneurs
const itemsContainerTemplate = `
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
const itemsContainer = document.querySelectorAll('.items-container');
let actualContainer = null;
let actualBtn = null;
let actualUL = null;
let actualForm = null;
let actualTextInput = null;
let actualValidation = null;
// Ajouter des écouteurs à un conteneur
function addContainerListeners(currentContainer) {
    var _a, _b;
    const currentUL = currentContainer.querySelector('ul');
    const currentContainerDeletionBtn = currentContainer.querySelector('.delete-container-btn');
    const currentAddItemBtn = currentContainer.querySelector('.add-item-btn');
    const currentCloseFormBtn = currentContainer.querySelector('.close-form-btn');
    const currentForm = currentContainer.querySelector('form');
    deleteBtnListeners(currentContainerDeletionBtn);
    addItemBtnListeners(currentAddItemBtn);
    closingFormBtnListeners(currentCloseFormBtn);
    addFormSubmitListeners(currentForm);
    addDeleteDelegation(currentUL);
    addContainerDDListeners(currentContainer);
    const input = currentContainer.querySelector('input');
    const label = currentContainer.querySelector('label[for="item"]');
    const uniqueId = `item-${(_b = (_a = crypto === null || crypto === void 0 ? void 0 : crypto.randomUUID) === null || _a === void 0 ? void 0 : _a.call(crypto)) !== null && _b !== void 0 ? _b : Date.now()}`;
    input.id = uniqueId;
    if (label)
        label.htmlFor = uniqueId;
    const header = currentContainer.querySelector('.top-container');
    header.setAttribute('draggable', 'true');
    header.addEventListener('dragstart', handleListDragStart);
    header.addEventListener('dragend', handleListDragEnd);
}
document.querySelectorAll('.items-container[draggable="true"]')
    .forEach(el => el.removeAttribute('draggable'));
itemsContainer.forEach((container) => {
    addContainerListeners(container);
});
// Gestion des événements
function deleteBtnListeners(btn) {
    btn.addEventListener('click', handleContainerDeletion);
}
function addItemBtnListeners(btn) {
    btn.addEventListener('click', handleAddItem);
}
function closingFormBtnListeners(btn) {
    btn.addEventListener('click', () => {
        if (!actualBtn || !actualForm)
            return;
        toggleForm(actualBtn, actualForm, false);
    });
}
function addFormSubmitListeners(form) {
    form.addEventListener('submit', createNewItem);
}
// Suppression de conteneurs
function handleContainerDeletion(e) {
    var _a;
    const btn = e.currentTarget;
    (_a = btn.closest('.items-container')) === null || _a === void 0 ? void 0 : _a.remove();
}
// Ajouter une tâche
function handleAddItem(e) {
    const btn = e.target;
    if (actualBtn && actualForm)
        toggleForm(actualBtn, actualForm, false);
    setContainerItems(btn);
    if (actualBtn && actualForm)
        toggleForm(actualBtn, actualForm, true);
}
// Afficher/Masquer le formulaire
function toggleForm(btn, form, action) {
    if (!action) {
        form.querySelector('input').value = "";
        form.querySelector('.validation-msg').textContent = "";
        form.style.display = "none";
        btn.style.display = "block";
    }
    else {
        form.style.display = "block";
        btn.style.display = "none";
    }
}
// Définir les éléments du conteneur actif
function setContainerItems(btn) {
    actualBtn = btn;
    actualContainer = btn.parentElement;
    actualUL = actualContainer.querySelector('ul');
    actualForm = actualContainer.querySelector('form');
    actualTextInput = actualContainer.querySelector('input');
    actualValidation = actualContainer.querySelector('.validation-msg');
}
// Créer une nouvelle tâche
function createNewItem(e) {
    e.preventDefault();
    if (!actualTextInput || !actualValidation || !actualUL)
        return;
    if (actualTextInput.value.length === 0) {
        actualValidation.textContent = "Must be at least 1 character long";
        return;
    }
    actualValidation.textContent = "";
    const itemContent = actualTextInput.value;
    const li = `<li class="item" draggable="true">
      <p>${itemContent}</p>
      <button type="button">X</button>
    </li>`;
    actualUL.insertAdjacentHTML('beforeend', li);
    const item = actualUL.lastElementChild;
    // handleItemDeletion(liBtn);
    addItemDDListeners(item);
    actualTextInput.value = "";
}
// Suppression d'une tâche
function addDeleteDelegation(ul) {
    ul.addEventListener('click', (e) => {
        const btn = e.target.closest('li.item > button');
        if (!btn)
            return;
        const li = btn.closest('li.item');
        if (li)
            li.remove();
    });
}
// Drag And Drop
let dragSrcEl = null;
let dragListEl = null;
function handleListDragStart(e) {
    var _a;
    const header = e.target;
    const container = header.closest('.items-container');
    if (!container)
        return;
    dragListEl = container;
    container.classList.add('dragging-list');
    (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', ''); // requis sur certains navigateurs
    if (e.dataTransfer)
        e.dataTransfer.effectAllowed = 'move';
}
function handleListDragEnd() {
    dragListEl === null || dragListEl === void 0 ? void 0 : dragListEl.classList.remove('dragging-list');
    dragListEl = null;
}
function addItemDDListeners(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
}
document.querySelectorAll('li.item').forEach((li) => {
    li.setAttribute('draggable', 'true'); // si pré-rendus
    addItemDDListeners(li);
});
function handleDragStart(e) {
    var _a;
    if (actualBtn && actualForm)
        toggleForm(actualBtn, actualForm, false);
    const target = e.target.closest('li.item');
    if (!target)
        return;
    dragSrcEl = target;
    target.classList.add('dragging');
    (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', '');
}
function handleDragEnd() {
    dragSrcEl === null || dragSrcEl === void 0 ? void 0 : dragSrcEl.classList.remove('dragging');
    dragSrcEl = null;
}
function addContainerDDListeners(container) {
    const ul = container.querySelector('ul');
    // 1) Autoriser le drop sur le CONTAINER
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    // 2) Réordonnancement précis quand on survole le UL
    ul.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('li.item.dragging');
        if (!dragging)
            return;
        const after = getDragAfterElement(ul, e.clientY);
        if (after == null)
            ul.appendChild(dragging);
        else
            ul.insertBefore(dragging, after);
    });
    // 3) Drop final : déplace dans la bonne liste
    container.addEventListener('drop', (e) => {
        var _a;
        e.preventDefault();
        const dragging = document.querySelector('li.item.dragging');
        if (!dragging)
            return;
        const targetUl = (_a = e.target
            .closest('.items-container')) === null || _a === void 0 ? void 0 : _a.querySelector('ul');
        if (!targetUl)
            return;
        // Si on change de liste, calcule la position, 
        // sinon ne rien faire (déjà posé par le dragover du UL)
        if (dragging.parentElement !== targetUl) {
            const after = getDragAfterElement(targetUl, e.clientY);
            if (after == null)
                targetUl.appendChild(dragging);
            else
                targetUl.insertBefore(dragging, after);
        }
    });
}
function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('li.item:not(.dragging)')];
    let closest = { offset: -Infinity, el: null };
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
const addNewContainer = document.querySelector('.add-new-container');
const addContainerBtn = document.querySelector('.add-container-btn');
const addContainerForm = document.querySelector('.add-new-container form');
const addContainerFormInput = document.querySelector('.add-new-container input');
const validationNewContainer = document.querySelector('.add-new-container .validation-msg');
const addContainerCloseBtn = document.querySelector('.close-add-list');
const containersList = document.querySelector('.main-content');
addContainerBtn.addEventListener('click', () => toggleForm(addContainerBtn, addContainerForm, true));
addContainerCloseBtn.addEventListener('click', () => toggleForm(addContainerBtn, addContainerForm, false));
addContainerForm.addEventListener('submit', createNewContainer);
addBoardDDListeners(containersList);
function addBoardDDListeners(board) {
    board.addEventListener('dragover', (e) => {
        if (!dragListEl)
            return; // on n'agit que si on déplace une liste
        e.preventDefault();
        const after = getListAfterElement(board, e.clientX);
        // placer avant l'élément "after" s'il existe, 
        // sinon juste avant le bloc 'add-new-container'
        const ref = after !== null && after !== void 0 ? after : addNewContainer;
        if (ref)
            board.insertBefore(dragListEl, ref);
        else
            board.appendChild(dragListEl);
    });
    board.addEventListener('drop', (e) => {
        if (!dragListEl)
            return;
        e.preventDefault();
        // rien à faire : le placement final est déjà fait au dragover
    });
}
function getListAfterElement(board, x) {
    // toutes les listes sauf celle en cours de drag
    const lists = [...board.querySelectorAll('.items-container:not(.dragging-list)')];
    let closest = { offset: -Infinity, el: null };
    for (const el of lists) {
        const box = el.getBoundingClientRect();
        const offset = x - (box.left + box.width / 2);
        if (offset < 0 && offset > closest.offset) {
            closest = { offset, el };
        }
    }
    return closest.el;
}
function createNewContainer(e) {
    e.preventDefault();
    const name = addContainerFormInput.value.trim();
    if (name.length === 0) {
        validationNewContainer.textContent = "Must be at least 1 character long";
        return;
    }
    validationNewContainer.textContent = "";
    if (addNewContainer) {
        addNewContainer.insertAdjacentHTML('beforebegin', itemsContainerTemplate);
        const newContainer = addNewContainer.previousElementSibling;
        // Définir le titre de la nouvelle liste
        const h2 = newContainer.querySelector('h2');
        if (h2)
            h2.textContent = name;
        // Brancher les listeners
        addContainerListeners(newContainer);
    }
    else {
        containersList.insertAdjacentHTML('beforeend', itemsContainerTemplate);
        const newContainer = containersList.lastElementChild;
        // Définir le titre ici aussi
        const h2 = newContainer.querySelector('h2');
        if (h2)
            h2.textContent = name;
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
