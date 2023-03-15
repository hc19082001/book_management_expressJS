import numberToVND from "../utils/convertMoney.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const HOST = "http://localhost:3000";

//^ Modal
const modal = $(".modal");
const form = $(".form");

//^ Button
const close_btn = $(".close-btn");
const add_book = $(".add-book");
const submit = $(".form .submit");
let updates;
let deletes;
const submit_update = $(".form .update");
const submit_delete = $(".form .delete");

//^ Items
const show_items = $(".show-items");
const loading = $(".loading");

//^ Inputs
const ipname = $("input[name='name']");
const ipprice = $("input[name='price']");
const ipdiscount = $("input[name='discount']");
const ipimage = $("input[name='image']");

let id = null;

//! Handle GET all DATA API
const getBooks = async (callback) => {
    const response = await fetch(HOST);
    const data = await response.json();
    callback(data);
};
//! Handle GET DATA by ID API
const getBookById = async (id) => {
    const data = await fetch(`${HOST}/${id}`);
    const book = await data.json();
    return book;
};
//! Handle POST DATA API
const postBook = async (book) => {
    try {
        await fetch(`${HOST}/post/`, {
            method: "POST",
            body: book,
        });
    } catch (error) {
        console.log(error);
    }
};
//! Handle PUT DATA API
const editBook = async (id, book) => {
    try {
        await fetch(`${HOST}/update/${id}`, {
            method: "PUT",
            body: book,
        });
    } catch (error) {
        console.log(error);
    }
};
//! Handle DELETE DATA API
const deleteBook = async (id) => {
    try {
        await fetch(`${HOST}/delete/${id}`, {
            method: "DELETE",
        });
    } catch (error) {
        console.log(error);
    }
};

// Set UpdateBtn Eventlistener function
const updateClick = (updateBtn) => {
    updateBtn.addEventListener("click", async (e) => {
        id = e.target.dataset.id;
        // Set data to edit form
        const book = await getBookById(id);
        ipname.value = book.name;
        ipprice.value = book.price;
        ipdiscount.value = book.discount;
        ipimage.value = null;
        // Open edit form
        modal.classList.add("show");
        submit_update.classList.add("show");
        submit.classList.add("hide");
    });
};
// Set UpdateBtn Eventlistener function
const deleteClick = (deleteBtn) => {
    deleteBtn.addEventListener("click", async (e) => {
        id = e.target.dataset.id;
        loading.classList.add("show");
        await deleteBook(id);
        await renderGetBooks();
        loading.classList.remove("show");
    });
};

//! Render UI
const renderGetBooks = async () => {
    let HTMLs = "";
    await getBooks((data) => {
        HTMLs = data.map((book) => {
            const priceWithDiscount = `<div class="item-price">
                    <span class="price-with-discount">${numberToVND(book.price)}</span>
                    <span class="discount-price">${numberToVND(book.price * (1 - book.discount / 100))}</span>
                    </div>
                </div>
                <div class="discount-label">
                    <span>Giảm ${book.discount} %</span>
                </div>`;
            const priceWithoutDiscount = `<div class="item-price">
                    <span class="price">${numberToVND(book.price)}</span>
                    </div>
                </div>`;
            let baseItem = `<div class="item">
                <div class="item-image">
                    <img src="${book.image}" alt="" />
                </div>
                <div class="item-des">
                    <p class="item-name">
                        ${book.name}
                    </p>
                    ${book.discount > 0 ? priceWithDiscount : priceWithoutDiscount}
                <div class="options">
                    <span class="update" data-id="${book._id}">Update</span>
                    <span class="delete" data-id="${book._id}">Delete</span>
                </div>
            </div>`;

            return baseItem;
        });
    });
    show_items.innerHTML = HTMLs.join("");
    updates = $$(".item .update");
    // Update book click
    updates.forEach((update) => {
        updateClick(update);
    });
    deletes = $$(".item .delete");
    // Delete book click
    deletes.forEach((deleteBtn) => {
        deleteClick(deleteBtn);
    });
};

await renderGetBooks();

//! Hanlde click
// Add book Click
add_book.addEventListener("click", () => {
    ipname.value = null;
    ipprice.value = null;
    ipdiscount.value = null;
    ipimage.value = null;
    modal.classList.add("show");
});
// Close button click
close_btn.addEventListener("click", () => {
    form.classList.add("slideOutEffect");
    setTimeout(() => {
        modal.classList.remove("show");
        form.classList.remove("slideOutEffect");
        submit_update.classList.remove("show");
        submit.classList.remove("hide");
    }, 250);
});
// Click outside form
modal.addEventListener("mousedown", (e) => {
    const clickedElement = e.target;
    const isThatElementInsideForm = form.contains(clickedElement);
    if (!isThatElementInsideForm) {
        form.classList.add("slideOutEffect");
        setTimeout(() => {
            modal.classList.remove("show");
            form.classList.remove("slideOutEffect");
            submit_update.classList.remove("show");
            submit.classList.remove("hide");
        }, 250);
    }
});
// Submit form
submit.addEventListener("click", async (e) => {
    const formData = new FormData();
    formData.append("name", ipname.value);
    formData.append("price", ipprice.value);
    formData.append("discount", ipdiscount.value > 0 ? ipdiscount.value : 0);
    formData.append("image", ipimage.files[0]);
    try {
        loading.classList.add("show");
        await postBook(formData);
        await renderGetBooks();
        loading.classList.remove("show");
        form.classList.add("slideOutEffect");
        setTimeout(() => {
            modal.classList.remove("show");
            form.classList.remove("slideOutEffect");
            submit_update.classList.remove("show");
            submit.classList.remove("hide");
        }, 250);
    } catch (error) {
        console.log(error);
    }
});
// Update form
submit_update.addEventListener("click", async () => {
    const formData = new FormData();
    formData.append("name", ipname.value);
    formData.append("price", ipprice.value);
    formData.append("discount", ipdiscount.value > 0 ? ipdiscount.value : 0);
    formData.append("image", ipimage.files[0]);
    try {
        loading.classList.add("show");
        await editBook(id, formData);
        await renderGetBooks();
        loading.classList.remove("show");
        form.classList.add("slideOutEffect");
        setTimeout(() => {
            modal.classList.remove("show");
            form.classList.remove("slideOutEffect");
            submit_update.classList.remove("show");
            submit.classList.remove("hide");
        }, 250);
    } catch (error) {
        console.log(error);
    }
});
