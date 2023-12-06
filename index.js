document.addEventListener("DOMContentLoaded", async function () {
  let shops = [];
  const categories = document.querySelectorAll(".category__title");

  // Render Part
  await renderPage();

  function renderPage() {
    return Promise.all(
      Array.from(categories).map(async (el) => {
        const path = el.getAttribute("data");
        await loadPageData(path);
        renderCategories(el);
        renderMapData();
      })
    );
  }

  async function loadPageData(path) {
    const apiUrl = `https://test.mark-lviv.com.ua/uk/${encodeURIComponent(
      path
    )}/`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.text();
      renderShopsElements(data, path);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function renderShopsElements(data, path) {
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
      const shopNumber = elSpanNumber.textContent;

      const img = getImg[5];
      const category = path;

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
        };
        shops.push(shop);
      }
    });
  }
  function renderCategories(el) {
    // Category__item
    const categoryItem = document.createElement("div");
    categoryItem.classList.add("category__item");
    const elData = el.getAttribute("data");
    categoryItem.setAttribute("data", elData);
    el.appendChild(categoryItem);

    const categoryItemSetHeight =
      document.querySelector(".categories").clientHeight * 0.7;
    categoryItem.style.maxHeight = categoryItemSetHeight + "px";

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

  function renderMapData() {
    try {
      const mapElData = document.querySelectorAll("text");
      mapElData.forEach((el) => {
        const elContent = el.innerHTML;
        const prevEl = el.previousElementSibling;
        const shop = shops.find((s) => s.shopNumber === elContent);
        if (prevEl && shop) {
          prevEl.setAttribute("data-category", shop.category.join(","));
          prevEl.setAttribute("data-name", shop.name);
          prevEl.setAttribute("data-floor", shop.floor);
          prevEl.classList.add("shop-element");
        }
      });
    } catch (error) {
      console.error("Error setting map data:", error);
    }

    function getUniqueFloors(arr) {
      const uniqueFloors = new Set();
      arr.forEach((floor) => {
        const floorParts = floor.split("/");
        uniqueFloors.add(...floorParts);
      });
      return [...uniqueFloors];
    }

    categories.forEach((el) => {
      const elData = el.getAttribute("data");
      const matchingShops = shops.filter((s) => s.category.includes(elData));
      const floors = getUniqueFloors(
        matchingShops.map((shop) => shop.floor).filter(Boolean)
      );
      el.setAttribute("data-floor", floors.join(","));
    });
  }

  // Values
  const categoriesItem = document.querySelectorAll(".category__item-name");
  const floorBtns = document.querySelectorAll(".btn__floor");
  const floorElement = document.querySelectorAll(".floor");

  const floorBtnsData = Array.from(floorBtns);
  const floorElementData = Array.from(floorElement);

  // Events functions
  function setCategoryActive(button) {
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
    }
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
  }

  function setMapElementActive(category) {
    const categoryElementData = category.getAttribute("data");
    const categoryElementFloorData = category
      .getAttribute("data-floor")
      .split(",");

    setActiveElements(
      category,
      mapElementData,
      floorBtnsData,
      floorElementData,
      categoryElementData,
      categoryElementFloorData
    );
  }

  function setActiveElements(
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
      if (
        elData &&
        elData.includes(categoryElementData) &&
        category.classList.contains("active")
      ) {
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

  function activeElements(floorBtnEl, activeFloorCount) {
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
          el.style.scale = "0.85";
          el.setAttribute(
            "style",
            "transform: translate(-7%, -10%); scale: 0.85"
          );
        }
        if (el.classList.contains("active") && elData === "2") {
          el.setAttribute(
            "style",
            "transform: translate(38%, 44%); scale: 0.7"
          );
        }
        if (el.classList.contains("active") && elData === "3") {
          el.setAttribute(
            "style",
            "transform: translate(33%, 32%); scale: 0.7"
          );
        }
      });
    } else if (activeFloorCount === 3) {
      floorElementData.forEach((el) => {
        const elData = el.getAttribute("data-floor");
        if (el.classList.contains("active") && elData === "1") {
          el.style.scale = "0.85";
          el.setAttribute(
            "style",
            "transform: translate(-4%, -13%); scale: 0.8"
          );
        }
        if (el.classList.contains("active") && elData === "2") {
          el.setAttribute(
            "style",
            "transform: translate(-39%, 58%); scale: 0.7"
          );
        }
        if (el.classList.contains("active") && elData === "3") {
          el.setAttribute(
            "style",
            "transform: translate(33%, 32%); scale: 0.7"
          );
        }
      });
    } else {
      resetStyles();
    }
  }

  const mapElement = document.querySelectorAll(".shop-element");
  const mapElementData = Array.from(mapElement);

  function setShopsActive(element) {
    resetStyles();
    const isActive = element.classList.contains("active");
    const activeButton = document.querySelector(".category__item-name.active");

    if (activeButton && activeButton !== element) {
      activeButton.classList.remove("active");
      resetStyles();
    }

    if (!isActive) {
      element.classList.add("active");

      const getMapElementData = mapElementData.filter((el) => {
        const elDataName = el.getAttribute("data-name");
        return element.textContent === elDataName;
      });

      getMapElementData.forEach((el) => {
        const elDataFloor = el.getAttribute("data-floor").split("/");
        el.classList.add("active");

        const getFloors = document.querySelectorAll(".floor[data-floor]");
        getFloors.forEach((el) => {
          const elFloor = el.getAttribute("data-floor");
          if (elDataFloor.includes(elFloor)) {
            el.classList.add("active");
          }
        });
      });
    } else {
      element.classList.remove("active");
      resetStyles();
    }
  }

  // Events
  categoriesItem.forEach((el) => {
    el.addEventListener("click", function (event) {
      event.stopPropagation();
      setShopsActive(el);
    });
  });

  categories.forEach((el) => {
    el.addEventListener("click", function () {
      setCategoryActive(el);
      setMapElementActive(el);
    });
  });

  floorBtnsData.forEach((btn) => {
    btn.addEventListener("click", function () {
      setFloorActive(btn, floorElementData);
    });
  });

  function resetStyles() {
    mapElementData.forEach((el) => el.classList.remove("active"));
    floorElementData.forEach((el) => {
      el.setAttribute("style", "");
      el.classList.remove("active");
      const elData = el.getAttribute("data-floor");
      if (elData.includes("1")) {
        el.classList.add("active");
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
});
