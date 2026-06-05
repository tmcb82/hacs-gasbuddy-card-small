class FuelPriceCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    const entityPicker = this.querySelector('ha-entity-picker');
    if (entityPicker) {
      entityPicker.hass = hass;
    }
  }

  render() {
    if (!this._config || !this._hass) return;

    if (!this.innerHTML) {
      this.innerHTML = `
        <ha-entity-picker
          label="Entity (Required)"
          allow-custom-entity
          hide-clear-icon
        ></ha-entity-picker>
        <ha-textfield
          label="Name (Optional Override)"
          id="name"
        ></ha-textfield>
        <ha-textfield
          label="Logo URL (Optional Override)"
          id="logo"
        ></ha-textfield>
        <ha-textfield
          label="Currency Symbol (Optional, defaults to $)"
          id="currency"
        ></ha-textfield>
      `;

      this.style.display = 'flex';
      this.style.flexDirection = 'column';
      this.style.gap = '16px';

      const entityPicker = this.querySelector('ha-entity-picker');
      const nameField = this.querySelector('#name');
      const logoField = this.querySelector('#logo');
      const currencyField = this.querySelector('#currency');

      entityPicker.addEventListener('value-changed', (ev) => {
        this._valueChanged('entity', ev.detail.value);
      });
      nameField.addEventListener('change', (ev) => {
        this._valueChanged('name', ev.target.value);
      });
      logoField.addEventListener('change', (ev) => {
        this._valueChanged('logo', ev.target.value);
      });
      currencyField.addEventListener('change', (ev) => {
        this._valueChanged('currency', ev.target.value);
      });
    }

    this.querySelector('ha-entity-picker').value = this._config.entity || '';
    this.querySelector('#name').value = this._config.name || '';
    this.querySelector('#logo').value = this._config.logo || '';
    this.querySelector('#currency').value = this._config.currency || '';
  }

  _valueChanged(key, value) {
    if (!this._config) return;
    
    let newConfig = { ...this._config };
    
    if (value === '' && key !== 'entity') {
      delete newConfig[key];
    } else {
      newConfig[key] = value;
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('fuel-price-card-editor', FuelPriceCardEditor);

class FuelPriceCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("fuel-price-card-editor");
  }

  static getStubConfig() {
    return { entity: "", currency: "$" };
  }

  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      this.content = document.createElement('div');
      
      this.content.style.padding = '16px';
      this.content.style.display = 'flex';
      this.content.style.justifyContent = 'space-between';
      this.content.style.alignItems = 'center';
      
      this.leftContainer = document.createElement('div');
      this.leftContainer.style.display = 'flex';
      this.leftContainer.style.alignItems = 'center';
      this.leftContainer.style.gap = '16px';

      this.logoImg = document.createElement('img');
      this.logoImg.style.width = '40px';
      this.logoImg.style.height = '40px';
      this.logoImg.style.objectFit = 'contain';
      this.logoImg.style.borderRadius = '4px'; 
      
      this.nameSpan = document.createElement('div');
      this.nameSpan.style.fontSize = '16px';
      this.nameSpan.style.fontWeight = '500';
      this.nameSpan.style.color = 'var(--primary-text-color)';

      this.leftContainer.appendChild(this.logoImg);
      this.leftContainer.appendChild(this.nameSpan);

      this.priceContainer = document.createElement('div');
      this.priceContainer.style.fontSize = '28px';
      this.priceContainer.style.fontWeight = '400';
      this.priceContainer.style.color = 'var(--primary-text-color)';
      this.priceContainer.style.lineHeight = '1em';
      
      this.content.appendChild(this.leftContainer);
      this.content.appendChild(this.priceContainer);
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    
    if (!state) {
        this.nameSpan.innerText = "Entity not found";
        return;
    }

    const attrs = state.attributes || {};
    
    const name = this.config.name || attrs.station_name || attrs.friendly_name || entityId;
    const logoUrl = this.config.logo || attrs.station_logo || '';
    const price = state.state;
    const currency = this.config.currency !== undefined ? this.config.currency : '$';

    if (logoUrl) {
      this.logoImg.src = logoUrl;
      this.logoImg.style.display = 'block';
    } else {
      this.logoImg.style.display = 'none';
    }
    
    this.nameSpan.innerText = name;
    
    if (!isNaN(parseFloat(price)) && isFinite(price)) {
      this.priceContainer.innerHTML = `<span style="font-size: 0.6em; vertical-align: text-top; margin-right: 2px;">${currency}</span>${price}`;
    } else {
      this.priceContainer.innerText = price; 
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity in your configuration.');
    }
    this.config = config;
  }

  getCardSize() {
    return 1; 
  }
}

customElements.define('fuel-price-card', FuelPriceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "fuel-price-card",
  name: "Fuel Price Card",
  preview: true,
  description: "A custom sensor card tailored for fuel prices, integrating automatically with ha-gasbuddy."
});