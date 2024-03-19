# ArcGIS Basemap Styles Self Demo

This repository contains the source code for the ArcGIS Basemap Styles self demo presented at the Esri Developer Summit 2024. The demo highlights how to utilize the self describing endpoint of the ArcGIS Basemap Styles service, allowing developers to dynamically access and implement the latest basemap styles and features.

## Demo Overview

During the Day 1 plenary session's Open Development segment, the demo showcased how to interact with the self describing endpoint of the basemap styles service. This endpoint provides comprehensive, machine-readable details about the service, facilitating innovative and efficient application development.

## Features

- **Self Describing Endpoint**: Utilizes the new self describing endpoint for the basemap styles service.
- **Dynamic Basemap Styles**: Dynamically generates basemap style options based on the service's output.
- **Language and Place Customization**: Offers options to change basemap language and place settings, reflecting real-time service updates.
- **Interactive Map**: Features an interactive map centered on Athens, Greece, built with Calcite components and MapLibre GL JS.

## Using the Demo

To run this demo, you need to:

1. Clone the repository to your local machine.
2. Set your API key in the JavaScript file. Ensure your API key is scoped to the basemap styles and the places services.
   ```javascript
   const apiKey = "YOUR_API_KEY";  // Replace YOUR_API_KEY with your actual ArcGIS API key.
3. Open the HTML file in a web browser to see the demo in action.

