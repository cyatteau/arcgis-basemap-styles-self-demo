document.addEventListener("DOMContentLoaded", function () {
  const apiKey = //set your API key (scope to basemap styles & places service)
    "YOUR_API_KEY";
  let languageCode = "global";
  let selectedBasemap = "arcgis/community";
  let placesCode = "none";
  const baseUrl =
    "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/";

  let map = new maplibregl.Map({
    container: "map",
    style: `${baseUrl}${selectedBasemap}?token=${apiKey}`,
    zoom: 14,
    center: [23.734539, 37.97281],
  });

  fetch(`${baseUrl}self`)
    .then((response) => response.json())
    .then((data) => {
      populateBasemapStyles(data.styles);
      languagesPicker(data);
      placesPicker(data);
    });

  function populateBasemapStyles(styles) {
    let uniqueBasemapStyles = styles
      .reduce((unique, style) => {
        let baseName = style.name.replace(/\s*(Base|Labels)\s*$/, "").trim();
        if (
          !unique.some(
            (s) =>
              s.name.replace(/\s*(Base|Labels)\s*$/, "").trim() === baseName
          )
        ) {
          unique.push(style);
        }
        return unique;
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));

    const cardGroup = document.getElementById("card-container");
    cardGroup.innerHTML = uniqueBasemapStyles
      .map((style, index) => {
        let isSelected = index === 2;
        if (isSelected) selectedBasemap = style.path;
        return `<div class="custom-card${
          isSelected ? " custom-card-selected" : ""
        }" data-value="${style.path}" onclick="selectBasemap(this)">
                <img src="${style.thumbnailUrl}" alt="${
          style.name
        }" class="card-thumbnail">
                <span class="card-title">${style.name}</span>
              </div>`;
      })
      .join("");

    window.selectBasemap = function (card) {
      document
        .querySelectorAll(".custom-card")
        .forEach((c) => c.classList.remove("custom-card-selected"));
      card.classList.add("custom-card-selected");
      selectedBasemap = card.dataset.value;
      updateBasemap();
    };
  }

  function updateBasemap() {
    map.setStyle(
      `${baseUrl}${selectedBasemap}?token=${apiKey}&language=${languageCode}&places=${placesCode}`
    );
  }

  function placesPicker(data) {
    const placePicker = document.getElementById("places-picker");
    const places = data.places;
    places.sort((a, b) => b.name.localeCompare(a.name));
    places.forEach((place) => {
      const option = document.createElement("calcite-option");
      option.value = place.code;
      option.textContent = place.name;
      placePicker.appendChild(option);
    });
    placePicker.addEventListener("calciteSelectChange", updatePlaces);
  }

  function languagesPicker(data) {
    const languagePicker = document.getElementById("language-picker");
    const languages = data.languages;
    languages.forEach((language) => {
      const option = document.createElement("calcite-option");
      option.value = language.code;
      option.textContent = language.name;
      languagePicker.appendChild(option);
    });
    languagePicker.addEventListener("calciteSelectChange", updateLanguage);
  }

  function updatePlaces() {
    const placePicker = document.getElementById("places-picker");
    const placesCode = placePicker.value;
    if (placesCode === "attributed" || placesCode === "all") {
      const selectedBasemap = "arcgis/navigation";
      const initialStyle = `${baseUrl}${selectedBasemap}?token=${apiKey}&language=${languageCode}&places=${placesCode}`;
      map.setStyle(initialStyle);
      setTimeout(() => {
        map.easeTo({
          zoom: 15,
          duration: 100,
        });
      }, 10);
    }
  }

  function updateLanguage() {
    const languagePicker = document.getElementById("language-picker");
    languageCode = languagePicker.value;
    let newStyle = `${baseUrl}${selectedBasemap}?token=${apiKey}&language=${languageCode}&places=${placesCode}`;
    map.setStyle(newStyle);
  }

  map.on("mousemove", function (e) {
    const features = map.queryRenderedFeatures(e.point);
    if (features.length && features[0].properties.esri_place_id) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
  });

  map.on("mousemove", (e) => {
    map.getCanvas().style.cursor = map.queryRenderedFeatures(e.point).length
      ? "pointer"
      : "";
  });

  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point);
    if (features.length && features[0].properties.esri_place_id) {
      showPopup(features[0]);
    }
  });

  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
  }).setMaxWidth("350px");

  function showPopup(feature) {
    const placeID = feature.properties.esri_place_id;
    arcgisRest
      .getPlaceDetails({
        placeId: placeID,
        requestedFields: "all",
        authentication: arcgisRest.ApiKeyManager.fromKey(apiKey),
      })
      .then((result) => {
        const placeDetails = result.placeDetails;
        popup
          .setLngLat(feature.geometry.coordinates)
          .setHTML(
            `
          <div style='font-family: "Raleway", "Montserrat", "Avenir Next", "Helvetica Neue", sans-serif; padding: 2px;'>
            <span style="font-weight: 600; font-size: 15px;">${feature.properties._name}</span>
            <div style="margin-top: 11px;">
              <div style="margin-bottom: 5px;"><b>Address: </b> ${placeDetails?.address?.streetAddress}</div>
              <div style="margin-bottom: 5px;"><b>Phone #: </b> ${placeDetails.contactInfo?.telephone}</div>
              <div style="margin-bottom: 5px;"><b>Operating hours: </b> ${placeDetails.hours?.openingText}</div>
              <div style="margin-bottom: 2px;"><b>Rating: </b> ${placeDetails.rating?.user}</div>
            </div>
          </div>`
          )
          .addTo(map);
      });
  }
});
