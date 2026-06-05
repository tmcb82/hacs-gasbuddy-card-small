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
      
      this.content.style.display = 'grid';
      this.content.style.gridTemplateColumns = '1fr auto';
      this.content.style.gridTemplateRows = '1fr 1fr';
      this.content.style.padding = '16px';
      this.content.style.boxSizing = 'border-box';
      this.content.style.aspectRatio = '1 / 1';
      this.content.style.height = '100%';
      this.content.style.width = '100%';

      this.logoImg = document.createElement('img');
      this.logoImg.style.gridColumn = '1 / 3';
      this.logoImg.style.gridRow = '1 / 2';
      this.logoImg.style.width = '48px';
      this.logoImg.style.height = '48px';
      this.logoImg.style.objectFit = 'contain';
      this.logoImg.style.alignSelf = 'start';
      
      this.nameSpan = document.createElement('div');
      this.nameSpan.style.gridColumn = '1 / 2';
      this.nameSpan.style.gridRow = '2 / 3';
      this.nameSpan.style.fontSize = '16px';
      this.nameSpan.style.fontWeight = '500';
      this.nameSpan.style.color = 'var(--secondary-text-color)';
      this.nameSpan.style.alignSelf = 'end';
      this.nameSpan.style.whiteSpace = 'nowrap';
      this.nameSpan.style.overflow = 'hidden';
      this.nameSpan.style.textOverflow = 'ellipsis';
      this.nameSpan.style.paddingRight = '8px';

      this.priceContainer = document.createElement('div');
      this.priceContainer.style.gridColumn = '2 / 3';
      this.priceContainer.style.gridRow = '2 / 3';
      this.priceContainer.style.fontSize = '28px';
      this.priceContainer.style.fontWeight = '400';
      this.priceContainer.style.color = 'var(--primary-text-color)';
      this.priceContainer.style.alignSelf = 'end';
      this.priceContainer.style.justifySelf = 'end';
      this.priceContainer.style.lineHeight = '1em';
      
      this.content.appendChild(this.logoImg);
      this.content.appendChild(this.nameSpan);
      this.content.appendChild(this.priceContainer);
      card.appendChild(this.content);
      this.appendChild(card);

      this.logoImg.onerror = () => {
        this.logoImg.style.display = 'none';
      };
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    
    if (!state) {
        this.nameSpan.innerText = "Entity not found";
        return;
    }

    const attrs = state.attributes || {};
    
    const name = this.config.name || attrs.station_name || attrs.friendly_name || entityId;
    const logoUrl = this.config.logo || attrs.entity_picture || attrs.station_logo || '';
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
  description: "A custom 2x2 tile card tailored for fuel prices."
});