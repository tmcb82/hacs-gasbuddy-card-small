# Fuel Price Card

A custom Lovelace card for Home Assistant designed to beautifully display fuel prices. It works perfectly with the `ha-gasbuddy` integration by automatically pulling the station logo and name.

## Features
* Fully UI-configurable (No YAML required).
* Automatically extracts `station_name` and `station_logo` from `ha-gasbuddy` attributes.
* Prepends a top-aligned currency symbol to valid numeric prices.

## Installation via HACS

1. Go to **HACS** > **Frontend**.
2. Click the three dots in the top right corner and select **Custom repositories**.
3. Paste the URL to this repository.
4. Select **Dashboard** as the category and click **Add**.
5. Close the prompt, and a new **Fuel Price Card** repository will appear. Click it and select **Download**.
6. When prompted, reload your browser cache.

## Usage
Go to your Home Assistant dashboard, click **Add Card**, and search for "Fuel Price Card". You can configure the entity, name, logo, and currency directly from the UI.