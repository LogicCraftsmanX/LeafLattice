// -----------------------------
// CONFIG
// -----------------------------
const API_BASE = 'https://your-api.example.com'; // <-- replace with your API
const GEOJSON_PATH = 'data/countries.json';
const DEFAULT_MODE = 'MOCK'; // set to 'API' or 'MOCK' initially

// -----------------------------
// STATE
// -----------------------------
let map, geojsonLayer;
let currentMode = DEFAULT_MODE; // 'API' or 'MOCK'
const mockCountryData = {
  "US": { forest_area: "310M ha", co2_absorption: "430 Mt/year", species: ["oak","pine"] },
  "BR": { forest_area: "497M ha", co2_absorption: "1200 Mt/year", species: ["rubber tree","mahogany"] },
  "IN": { forest_area: "71M ha", co2_absorption: "90 Mt/year", species: ["banyan","teak"] },
};

// -----------------------------
// UTILS
// -----------------------------
function getColor(pct){
  // pct in 0..100
  if (pct == null) return '#cccccc';
  return pct > 50 ? '#00441b' :
         pct > 20 ? '#2e8b57' :
                    '#98fb98';
}

function safeNum(v){ return (v===null||v===undefined)?null: (typeof v === 'string' ? parseFloat(v.replace(/[^0-9.]/g,'')) : v) }

// -----------------------------
// MAP INIT
// -----------------------------
function initMap(){
  map = L.map('map', { zoomControl: true }).setView([20,0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  loadGeoJSON();
}

// -----------------------------
// GEOJSON + INTERACTIONS
// -----------------------------
function styleFeature(feature){
  // expects a feature.properties.forest_pct (0-100) or use random fallback
  const pct = feature.properties && feature.properties.forest_pct;
  return {
    fillColor: getColor(pct),
    weight: 1,
    opacity: 1,
    color: '#2c6e49',
    fillOpacity: 0.6
  };
}

function highlightFeature(e){
  const layer = e.target;
  layer.setStyle({ weight:2, fillOpacity:0.9 });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge){
    layer.bringToFront();
  }
  showSummary(layer.feature);
}

function resetHighlight(e){
  geojsonLayer.resetStyle(e.target);
  hideSummaryIfNotClicked();
}

function onFeatureClick(e){
  const props = e.target.feature.properties;
  const iso = props.iso_a2 || props.ISO_A2 || props.iso || props.ADM0_A3;
  fetchCountryDetails(iso, props);
}

function onEachFeature(feature, layer){
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onFeatureClick
  });
  layer.bindTooltip(feature.properties.name || feature.properties.ADMIN || "Country", {sticky:true});
}

function loadGeoJSON(){
  fetch(GEOJSON_PATH)
    .then(r => {
      if (!r.ok) throw new Error('GeoJSON not found. Put a countries.geojson at ' + GEOJSON_PATH);
      return r.json();
    })
    .then(geojson => {
      // optional: inject a sample forest_pct if not present to demonstrate coloring
      geojson.features.forEach(f => {
        if (f.properties && f.properties.forest_pct == null){
          // create demo forest_pct by hashing country name (stable)
          const name = (f.properties.name || f.properties.ADMIN || '').toLowerCase();
          let h = 0;
          for (let i=0;i<name.length;i++) h = (h<<5)-h + name.charCodeAt(i);
          const pct = 10 + Math.abs(h % 80); // 10..89
          f.properties.forest_pct = pct;
        }
      });

      geojsonLayer = L.geoJSON(geojson, {
        style: styleFeature,
        onEachFeature: onEachFeature
      }).addTo(map);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('summary').textContent = 'Error loading map data: ' + err.message;
    });
}

// -----------------------------
// UI: summary / details
// -----------------------------
let lastClickedIso = null;

function showSummary(feature){
  const p = feature.properties || {};
  const name = p.name || p.ADMIN || 'Unknown';
  const pct = p.forest_pct;
  const txt = `${name}\nEstimated forest cover: ${pct!=null?pct + '%' : 'N/A'}\nClick for details.`;
  document.getElementById('summary').textContent = txt;
}

function hideSummaryIfNotClicked(){
  if (lastClickedIso == null) {
    document.getElementById('summary').textContent = 'Hover to see quick stats. Click for more details.';
    document.getElementById('details').hidden = true;
  }
}

function showDetails(name, data){
  lastClickedIso = name;
  document.getElementById('details').hidden = false;
  document.getElementById('details-name').textContent = name;
  document.getElementById('details-content').textContent = JSON.stringify(data, null, 2);
}

// -----------------------------
// DATA FETCH (API or MOCK)
// -----------------------------
async function fetchCountryDetails(iso, propertiesFallback){
  if (!iso){
    console.warn('No ISO code for country; using fallback properties');
    showDetails(propertiesFallback.name || 'Country', propertiesFallback);
    return;
  }

  if (currentMode === 'MOCK'){
    const sample = mockCountryData[iso] || { forest_area: (propertiesFallback.forest_pct||'N/A') + '%', note: 'Mock data' };
    showDetails(iso, sample);
    return;
  }

  // API mode
  try{
    const res = await fetch(`${API_BASE}/country/${encodeURIComponent(iso)}`);
    if (!res.ok) throw new Error('Failed to fetch from API: ' + res.status);
    const json = await res.json();
    showDetails(propertiesFallback.name || iso, json);
  } catch(err){
    console.error(err);
    showDetails(iso, { error: err.message });
  }
}

// -----------------------------
// SEARCH (country by name OR species)
// -----------------------------
async function runSearch(query){
  if (!query) return;
  document.getElementById('search-results').hidden = false;
  const list = document.getElementById('results-list');
  list.innerHTML = '<li>Searching…</li>';

  if (currentMode === 'MOCK'){
    // Search names inside the geojson layer (client-side)
    const matches = [];
    geojsonLayer.eachLayer(layer=>{
      const props = layer.feature.properties;
      if (!props) return;
      const name = (props.name || props.ADMIN || '').toLowerCase();
      if (name.includes(query.toLowerCase())) matches.push({ name: props.name, iso: props.iso_a2 || props.ISO_A2 || props.iso || '' });
    });
    list.innerHTML = matches.length ? matches.map(m=>`<li data-iso="${m.iso}">${m.name} (${m.iso})</li>`).join('') : '<li>No results</li>';
    list.querySelectorAll('li[data-iso]').forEach(li => li.addEventListener('click', ()=> {
      const iso = li.getAttribute('data-iso');
      // zoom to country if found
      geojsonLayer.eachLayer(layer => {
        const p = layer.feature.properties;
        const layerIso = p.iso_a2 || p.ISO_A2 || p.iso;
        if (layerIso === iso) {
          map.fitBounds(layer.getBounds(), { maxZoom: 6 });
          fetchCountryDetails(iso, p);
        }
      });
    }));
    return;
  }

  // API-mode search: try species and country endpoints
  try{
    const r = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    const j = await r.json();
    if (!j || j.length === 0) list.innerHTML = '<li>No results</li>';
    else list.innerHTML = j.map(item => `<li data-iso="${item.iso}">${item.name} — ${item.snippet || ''}</li>`).join('');
    list.querySelectorAll('li[data-iso]').forEach(li => li.addEventListener('click', ()=> {
      const iso = li.getAttribute('data-iso');
      // zoom/center if the country exists in geojson
      geojsonLayer.eachLayer(layer => {
        const p = layer.feature.properties;
        const layerIso = p.iso_a2 || p.ISO_A2 || p.iso;
        if (layerIso === iso) {
          map.fitBounds(layer.getBounds(), { maxZoom: 6 });
          fetchCountryDetails(iso, p);
        }
      });
    }));
  } catch(err){
    console.error(err);
    list.innerHTML = '<li>Error searching</li>';
  }
}

// -----------------------------
// HOOKS
// -----------------------------
document.getElementById('searchBtn').addEventListener('click', ()=> {
  const q = document.getElementById('searchInput').value.trim();
  runSearch(q);
});

document.getElementById('modeSelect').addEventListener('change', (e) => {
  currentMode = e.target.value;
  // UI hint
  if (currentMode === 'MOCK') {
    document.getElementById('summary').textContent = 'Running in MOCK mode (demo data).';
  } else {
    document.getElementById('summary').textContent = 'Running in API mode. Click country to fetch details from API.';
  }
});

// init
window.addEventListener('load', () => {
  // set mode ui
  document.getElementById('modeSelect').value = currentMode;
  initMap();
});
