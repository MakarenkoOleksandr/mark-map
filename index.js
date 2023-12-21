document.addEventListener("DOMContentLoaded", async function () {
  let shops = [];
  const categories = document.querySelectorAll(".category__title");

  // Render Part
  await renderPage();

  // Values
  const categoriesItem = document.querySelectorAll(".category__item-name");
  const floorBtns = document.querySelectorAll(".btn__floor");
  const floorElement = document.querySelectorAll(".floor");
  const floorBtnsData = Array.from(floorBtns);
  const floorElementData = Array.from(floorElement);
  const mapElement = document.querySelectorAll(".shop-element");
  const mapElementData = Array.from(mapElement);
  const serviceElement = document.querySelectorAll(".service");
  const serviceElementData = Array.from(serviceElement);
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("path");
  const shopName = urlParams.get("activeElement");
  const openMenu = document.querySelector(".hamburger");
  const hoverContainer = document.querySelector(".hover-container");
  const hoverContainerImg = document.querySelector(".hover-container__img");
  const hoverContainerContact = document.querySelector(
    ".hover-container__contact"
  );

  // Render
  async function renderPage() {
    const promises = Array.from(categories).map(async (el) => {
      const path = el.getAttribute("data");
      await loadPageData(path);
      await renderCategories(el);
    });

    await Promise.all(promises);
    await renderMapData();
  }

  async function loadPageData(path) {
    const apiUrl = `https://test.mark-lviv.com.ua/uk/${encodeURIComponent(
      path
    )}/`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.text();
      await renderShopsElements(data, path);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function renderShopsElements(data, path) {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = data;
    const elements = tempElement.querySelectorAll(".entry");
    elements.forEach((e) => {
      // Get shops data
      const elImg = e.querySelector("img");
      const elLink = e.querySelector("a");
      const elSpanNumber = e.querySelector("span");
      const getImg = elImg.getAttribute("src").split("/");
      const elSpanFloor = e.querySelector(".get-floor");
      const elContact = e.querySelector(".get-contact");
      let floor = elSpanFloor.textContent;
      if (
        elSpanFloor.textContent === "-1" ||
        elSpanFloor.textContent === "- 1"
      ) {
        floor = "3";
      } else if (elSpanFloor.textContent === "Вулиця") {
        floor = "1";
      }

      const name = elImg.getAttribute("title");
      const link = elLink.getAttribute("href");
      let shopNumber = elSpanNumber.textContent.split(",");
      const img = getImg[5];
      const category = path;
      const contact = elContact.textContent;

      const existingShop = shops.find((shop) => shop.name === name);
      if (existingShop) {
        existingShop.category.push(category);
      } else {
        const shop = {
          name,
          link,
          shopNumber,
          img,
          floor,
          category: [category],
          contact,
        };
        shops.push(shop);
      }
    });
  }

  async function renderCategories(el) {
    // Category__item
    const categoryItem = document.createElement("div");
    categoryItem.classList.add("category__item");
    const elData = el.getAttribute("data");
    categoryItem.setAttribute("data", elData);
    el.appendChild(categoryItem);

    // Category__item-name
    shops.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (/^[a-z]/.test(nameA) && !/^[a-z]/.test(nameB)) {
        return -1;
      } else if (!/^[a-z]/.test(nameA) && /^[a-z]/.test(nameB)) {
        return 1;
      } else {
        return nameA.localeCompare(nameB);
      }
    });

    shops.forEach((shop) => {
      if (shop.category.includes(elData)) {
        const categoryItemName = document.createElement("div");
        categoryItemName.classList.add("category__item-name");
        categoryItemName.innerHTML = shop.name;
        categoryItem.appendChild(categoryItemName);
      }
    });
  }

  async function renderMapData() {
    try {
      const mapElData = Array.from(document.querySelectorAll("text"));
      shops.forEach((shop) => {
        if (shop.shopNumber.length >= 2) {
          shop.shopNumber.map((el) => {
            const element = el.trim();
            mapElData.forEach((el) => {
              if (element === el.innerHTML) {
                renderShops(el, shop);
              }
            });
          });
        } else {
          const element = shop.shopNumber;
          mapElData.forEach((el) => {
            if (element.includes(el.innerHTML)) {
              renderShops(el, shop);
            }
          });
        }
      });
    } catch (error) {
      console.error("Error setting map data:", error);
    }
  }

  function renderShops(el, shop) {
    const prevEl = el.previousElementSibling;
    const existingCategory = prevEl.getAttribute("data-category");
    const existingName = prevEl.getAttribute("data-name");

    const newCategory = shop.category.join(",");
    const newName = shop.name;

    const category = existingCategory
      ? `${existingCategory},${newCategory}`
      : newCategory;
    const name = existingName ? `${existingName},${newName}` : newName;

    prevEl.setAttribute("data-category", category);
    prevEl.setAttribute("data-name", name);
    prevEl.setAttribute("data-floor", shop.floor);
    prevEl.classList.add("shop-element");
  }

  // Events functions
  function setCategoryBtnActive(button) {
    const isActive = button.classList.contains("active");
    const activeButton = document.querySelector(".category__title.active");

    if (activeButton && activeButton !== button) {
      activeButton.classList.remove("active");
      activeButton.firstElementChild.classList.remove("active");
    }

    if (!isActive) {
      button.classList.add("active");
      button.firstElementChild.classList.add("active");
    } else {
      button.classList.remove("active");
      button.firstElementChild.classList.remove("active");
      categoriesItem.forEach((el) => el.classList.remove("active"));
    }

    categories.forEach((el) => {
      if (!isActive && el !== button) {
        el.style.display = "none";
      } else {
        el.style.display = "block";
      }
    });
  }

  function setFloorActive(button, floor) {
    resetStyles();
    floorBtnsData.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle("active", isActive);
    });
    const btnData = button.getAttribute("data");

    floor.forEach((el) => {
      const floorData = el.getAttribute("data-floor");
      el.classList.toggle("active", floorData === btnData);
    });

    categories.forEach((el) => {
      el.setAttribute("style", "");
      el.classList.remove("active");
      el.firstElementChild.classList.remove("active");
    });
    const categotyItem = document.querySelectorAll(".category__item");
    categotyItem.forEach((el) => {
      el.setAttribute("style", "");
    });
  }

  function categoryActiveShops(category) {
    const categoryElementData = category.getAttribute("data");
    const categoryElementFloorData = category
      .getAttribute("data-floor")
      .split(",");

    setCategoryActiveShops(
      category,
      mapElementData,
      floorBtnsData,
      floorElementData,
      categoryElementData,
      categoryElementFloorData
    );
  }

  function setCategoryActiveShops(
    category,
    mapEl,
    floorBtnEl,
    floorEl,
    categoryElementData,
    categoryElementFloorData
  ) {
    let activeFloorCount = 0;
    mapEl.forEach((el) => {
      const elData = el.getAttribute("data-category");
      if (elData && elData.includes(categoryElementData)) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    floorEl.forEach((el) => {
      floorBtnEl.forEach((el) => {
        const elData = el.getAttribute("data");
        if (
          elData &&
          categoryElementFloorData.includes(elData) &&
          category.classList.contains("active")
        ) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
      const elData = el.getAttribute("data-floor");
      if (
        elData &&
        categoryElementFloorData.includes(elData) &&
        category.classList.contains("active")
      ) {
        el.classList.remove("active");
        activeFloorCount++;
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
    activeElements(floorBtnEl, activeFloorCount);
  }

  function itemsActiveShops(element) {
    resetStyles();
    const isActive = element.classList.contains("active");
    const activeButton = document.querySelector(".category__item-name.active");

    if (!isActive) {
      element.classList.add("active");
      const categoryItemData = element.textContent;
      setActiveElements(categoryItemData);
    } else {
      element.classList.remove("active");
      mapElementData.forEach((el) => el.classList.remove("active"));
    }

    if (activeButton && activeButton !== element) {
      activeButton.classList.remove("active");
    }
  }

  function setActiveFloorBtnShop(element) {
    let activeFloorElCount = 0;
    const elFloorData = element.getAttribute("data-floor").split("/");
    floorBtns.forEach((btnEl) => {
      const floorData = btnEl.getAttribute("data");
      if (elFloorData.includes(floorData)) {
        btnEl.classList.add("active");
      } else btnEl.classList.remove("active");
    });

    floorElement.forEach((floorEl) => {
      const categoryTitle = document.querySelectorAll(
        ".category__title.active"
      );
      const categotyItem = document.querySelectorAll(".category__item");
      categoryTitle.forEach((element) => {
        categotyItem.forEach((el) => {
          el.style.top = `${element.clientHeight}px`;
          el.style.right = "0";
          el.style.maxHeight = `${element.clientHeight * 9}px`;
        });
      });
      const getFloor = floorEl.getAttribute("data-floor");
      if (elFloorData.includes(getFloor)) {
        floorEl.classList.add("active");
        activeFloorElCount++;
        if (activeFloorElCount === 1) {
          floorEl.setAttribute("style", "");
        } else {
          floorElementData.forEach((el) => {
            const elData = el.getAttribute("data-floor");
            if (el.classList.contains("active") && elData === "1") {
              el.classList.add("floor--1");
            }
            if (el.classList.contains("active") && elData === "2") {
              el.classList.add("floor--2-2");
              el.setAttribute("viewBox", "190 -50 1200 800");
            }
            if (el.classList.contains("active") && elData === "3") {
              el.classList.add("floor--3-2");
            }
          });
        }
      } else floorEl.classList.remove("active");
    });
  }

  function setActiveElements(element) {
    const activeMapElement = mapElementData.filter((el) => {
      const mapElData = el.getAttribute("data-name").split(",");
      return mapElData.includes(element);
    });

    activeMapElement.forEach((el) => {
      const activeMapElData = el.getAttribute("data-floor").split("/");
      const setFloorActive = floorElementData.filter((el) => {
        const floorData = el.getAttribute("data-floor");
        return activeMapElData.includes(floorData);
      });
      el.classList.add("active");
      floorElementData.forEach((el) => el.classList.remove("active"));
      setFloorActive.forEach((el) => {
        el.classList.add("active");
      });
      setActiveFloorBtnShop(el);
    });
  }

  function shopsHover(
    element,
    hoverContainer,
    hoverContainerContact,
    hoverContainerImg
  ) {
    hoverContainer.classList.remove("redirect-service");
    const getElementData = element.getAttribute("data-name");
    const filterShop = shops.filter((shop) => {
      const filterName = shop.name.split(",");
      return filterName.includes(getElementData);
    });

    if (filterShop) {
      const [{ img: elementImg, contact: elementContact, link: elementLink }] =
        filterShop;
      const contactList = elementContact.split(",");
      hoverContainerImg.setAttribute(
        "src",
        `/admin/files/test.mark-lviv.com.ua/catalog/${elementImg}`
      );

      contactList.forEach((el) => {
        const contactItem = document.createElement("div");
        contactItem.textContent = el;
        hoverContainerContact.appendChild(contactItem);
      });
      element.classList.add("hovered");

      const rect = element.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2 + hoverContainer.clientWidth / 2;
      const y = (rect.top + rect.bottom) / 2 - hoverContainer.clientHeight / 4;
      hoverContainer.setAttribute(
        "style",
        `top: ${y}px; left: ${x}px; visibility: visible`
      );

      element.addEventListener("click", () => {
        window.location.href = elementLink;
      });

      element.addEventListener("mouseleave", () => {
        element.classList.remove("hovered");
        element.setAttribute("style", "");
        hoverContainer.style.visibility = "hidden";
        hoverContainerContact.innerHTML = "";
      });
    }
  }

  function serviceHover(element, hoverContainer, hoverContainerImg) {
    hoverContainer.classList.remove("redirect-service");
    const elementData = element.getAttribute("data-service");
    hoverContainerImg.setAttribute(
      "src",
      `/admin/files/test.mark-lviv.com.ua/catalog/${elementData}-small.jpg`
    );

    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 + hoverContainer.clientWidth / 2;
    const y = (rect.top + rect.bottom) / 2 - hoverContainer.clientHeight / 4;
    hoverContainer.setAttribute(
      "style",
      `top: ${y}px; left: ${x}px; visibility: visible`
    );

    element.addEventListener("mouseleave", () => {
      element.classList.remove("hovered");
      element.setAttribute("style", "");
      hoverContainer.style.visibility = "hidden";
    });
  }

  function getRect(rect, hoverContainer) {
    const xl = window.matchMedia("(min-width: 1026px)");
    const lg = window.matchMedia("(max-width: 1025px)");
    const md = window.matchMedia("(max-width: 768px)");
    const sm = window.matchMedia("(max-width: 576px)");

    if (xl.matches) {
      const x = (rect.left + rect.right) / 2 + hoverContainer.clientWidth / 2;
      const y = (rect.top + rect.bottom) / 2 - hoverContainer.clientHeight / 2;
      hoverContainer.setAttribute(
        "style",
        `top: ${y}px; left: ${x}px; visibility: visible`
      );
    }
    if (lg.matches) {
      const x = (rect.left + rect.right) / 2;
      const y =
        (rect.top + rect.bottom) / 2 - hoverContainer.clientHeight * 1.5;
      hoverContainer.setAttribute(
        "style",
        `top: ${y}px; left: ${x}px; visibility: visible`
      );
    }
    if (md.matches) {
      const x = rect.left + rect.right - hoverContainer.clientWidth * 1.5;
      const y = (rect.top + rect.bottom) / 4 - hoverContainer.clientHeight / 2;
      hoverContainer.setAttribute(
        "style",
        `top: ${y}px; left: ${x}px; visibility: visible`
      );
    }
    if (sm.matches) {
      const x = rect.left + rect.right - hoverContainer.clientWidth * 0.5;
      const y =
        (rect.top + rect.bottom) / 4 - hoverContainer.clientHeight * 0.5;
      hoverContainer.setAttribute(
        "style",
        `top: ${y}px; left: ${x}px; visibility: visible`
      );
    }
  }

  function setActiveServices(service, hoverContainer, hoverContainerImg) {
    const matchServiceEl = serviceElementData.find((el) => {
      const getElData = el.getAttribute("data-service");
      return getElData === service;
    });
    setTimeout(() => {
      const rect = matchServiceEl.getBoundingClientRect();
      getRect(rect, hoverContainer);
      matchServiceEl.classList.add("active");
      hoverContainer.classList.add("redirect-service");
    }, 700);

    hoverContainerImg.setAttribute(
      "src",
      `/admin/files/test.mark-lviv.com.ua/catalog/${service}-small.jpg`
    );
  }
  // General functions
  function getUniqueFloors(arr) {
    const uniqueFloors = new Set();
    arr.forEach((floor) => {
      const floorParts = floor.split("/");
      uniqueFloors.add(...floorParts);
    });
    return [...uniqueFloors];
  }

  function activeElements(floorBtnEl, activeFloorCount) {
    const categoryTitle = document.querySelectorAll(".category__title.active");
    const categotyItem = document.querySelectorAll(".category__item");

    categoryTitle.forEach((element) => {
      categotyItem.forEach((el) => {
        el.style.top = `${element.clientHeight}px`;
        el.style.left = "0";
        el.style.minWidth = `${element.clientWidth}px`;
      });
    });

    if (activeFloorCount === 1) {
      floorBtnEl.forEach((el) => {
        const isActive = el.classList.contains("active");
        const activeBtn = el.getAttribute("data");
        floorElementData.forEach((element) => {
          const activeMap = element.getAttribute("data-floor");
          if (activeBtn === activeMap && !isActive) {
            element.classList.remove("active");
          }
        });
      });
      floorElementData.forEach((el) => {
        el.style.scale = "1";
        el.setAttribute("style", "");
      });
    } else if (activeFloorCount === 2) {
      floorElementData.forEach((el) => {
        const elData = el.getAttribute("data-floor");
        if (el.classList.contains("active") && elData === "1") {
          el.classList.add("floor--1");
        }
        if (el.classList.contains("active") && elData === "2") {
          el.classList.add("floor--2-2");
          el.setAttribute("viewBox", "190 -50 1200 800");
        }
        if (el.classList.contains("active") && elData === "3") {
          el.classList.add("floor--3-2");
          el.setAttribute("viewBox", "190 0 1200 800");
        }
      });
    } else if (activeFloorCount === 3) {
      const setHeight = document.querySelector(".map");
      setHeight.classList.add("height");
      floorElementData.forEach((el) => {
        const elData = el.getAttribute("data-floor");
        if (el.classList.contains("active") && elData === "1") {
          el.classList.add("floor--1");
        }
        if (el.classList.contains("active") && elData === "2") {
          el.classList.add("floor--2");
          el.setAttribute("viewBox", "190 0 1200 600");
        }
        if (el.classList.contains("active") && elData === "3") {
          el.classList.add("floor--3");
        }
      });
    } else {
      resetStyles();
    }
  }

  function resetStyles() {
    hoverContainer.classList.remove("redirect-service");
    hoverContainer.style.visibility = "hidden";
    const setMap = document.querySelector(".map");
    const setBtns = document.querySelector(".bts");
    const setHeight = document.querySelector(".map");

    setHeight.setAttribute("style", "");
    setMap.classList.remove("padding-el");
    setBtns.classList.remove("top-el");

    serviceElementData.forEach((el) => el.classList.remove("active"));
    mapElementData.forEach((el) => el.classList.remove("active"));
    floorElementData.forEach((el) => {
      el.setAttribute("style", "");
      el.classList.remove("active");
      const elData = el.getAttribute("data-floor");
      if (elData.includes("1")) {
        el.classList.remove("floor--1");
        el.setAttribute("viewBox", "170 0 1200 800");
        el.classList.add("active");
      } else if (elData.includes("2")) {
        el.classList.remove("floor--2");
        el.classList.remove("floor--2-2");
        el.setAttribute("viewBox", "100 -50 1200 800");
      } else if (elData.includes("3")) {
        el.classList.remove("floor--3");
        el.classList.remove("floor--3-2");
        el.setAttribute("viewBox", "170 0 1200 800");
      }
    });
    floorBtnsData.forEach((el) => {
      el.classList.remove("active");
      const elData = el.getAttribute("data");
      if (elData.includes("1")) {
        el.classList.add("active");
      }
    });
  }

  // Events
  categories.forEach((el) => {
    const elData = el.getAttribute("data");
    const matchingShops = shops.filter((s) => s.category.includes(elData));
    const floors = getUniqueFloors(
      matchingShops.map((shop) => shop.floor).filter(Boolean)
    );

    el.setAttribute("data-floor", floors.join(","));

    el.addEventListener("click", function () {
      setCategoryBtnActive(el);
      categoryActiveShops(el);
    });
  });

  categoriesItem.forEach((el) => {
    el.addEventListener("click", function (event) {
      event.stopPropagation();
      itemsActiveShops(el);
    });
  });

  floorBtnsData.forEach((btn) => {
    btn.addEventListener("click", function () {
      setFloorActive(btn, floorElementData);
    });
  });

  mapElementData.forEach((el) => {
    el.addEventListener("mouseenter", function () {
      shopsHover(el, hoverContainer, hoverContainerContact, hoverContainerImg);
    });
  });

  openMenu.addEventListener("click", () => {
    const setActiveMEnu = document.querySelector(".categories");
    openMenu.classList.toggle("active");
    if (openMenu.classList.contains("active")) {
      setActiveMEnu.style.display = "block";
      setActiveMEnu.firstElementChild.display = "block";
      setActiveMEnu.classList.add("menu-mobile");
    } else {
      setActiveMEnu.style.display = "none";
    }
  });

  serviceElement.forEach((el) => {
    el.addEventListener("mouseenter", function (event) {
      serviceHover(el, hoverContainer, hoverContainerImg, event);
    });
  });
  // Redirect to map
  if (path) {
    setActiveServices(shopName, hoverContainer, hoverContainerImg);
  } else {
    setActiveElements(shopName, hoverContainer, hoverContainerImg);
  }
});
