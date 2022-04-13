const PRODUCTS = { p: [] };
const pagination = {
    end: 0,
    maxItems: 3
};

(function getProducts() {
    fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(json => {
            PRODUCTS.p = json;
            renderProductsMustache();
        });
})();            

function renderProductsMustache(isNext = false) {
    render("root", "product-tmpl",
        {
            ...PRODUCTS,
            p: getNextItems()
        });
    const btn = document.getElementById("next");
    //if (pagination.start + pagination.maxItems < PRODUCTS.p.length) {
        btn.onclick = showNext;
    //} 
}

function getNextItems() {
    pagination.end = pagination.end + pagination.maxItems
    return PRODUCTS.p.slice(0, pagination.end);
}

function showNext() {
    renderProductsMustache(true);
}




function render(trgt, tmpl, data) {
    document.getElementById(trgt).innerHTML =
        Mustache.render(document.getElementById(tmpl).innerHTML, data);
}