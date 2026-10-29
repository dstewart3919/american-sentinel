let scene, camera, renderer, raycaster, mouse, controls, composer = null, bloomPass = null;
let stateMeshes = [];
let data;
let stateMeshMap = new Map();
let currentSelectedMeshes = null;
let debtBase = 0;
let debtTimestamp = 0;
const DEBT_PER_SECOND = 75000;
const PORTRAIT_FALLBACK = "images/portrait-fallback.svg";
const HAVE_IMAGE = new Set(["Donald_Trump.jpg", "adam_schiff.jpg", "alex_padilla.jpg", "american_sentinel.png", "brad_little.jpg", "brian_kemp.jpg", "brian_schatz.jpg", "catherine_cortez_masto.jpg", "chris_wright.jpg", "chuck_schumer.jpg", "cynthia_lummis.jpg", "dan_sullivan.jpg", "doug_burgum.jpg", "flag.jpg", "gavin_newsom.jpg", "greg_abbott.jpg", "greg_gianforte.jpg", "harrison_fields.jpg", "howard_lutnick.jpg", "jacky_rosen.jpg", "jared_polis.jpg", "jay_inslee.jpg", "jb_pritzker.jpg", "jd_vance.jpg", "jeff_merkley.jpg", "jim_goyer.jpg", "jim_risch.jpg", "joe_lombardo.jpg", "john_barrasso.jpg", "john_cornyn.jpg", "jon_ossoff.jpg", "jon_tester.jpg", "josh_green.jpg", "karoline_leavitt.jpg", "katie_britt.jpg", "kay_ivey.jpg", "kevin_hassett.jpg", "kristi_noem.jpg", "linda_mcmahon.jpg", "lisa_murkowski.jpg", "marco_rubio.jpg", "maria_cantwell.jpg", "mark_gordon.jpg", "matt_brasseaux.jpg", "mazie_hirono.jpg", "michael_bennet.jpg", "mike_crapo.jpg", "mike_dunleavy.jpg", "mike_waltz.jpg", "pam_bondi.jpg", "patty_murray.jpg", "pete_hegseth.jpg", "raphael_warnock.jpg", "rick_scott.jpg", "robert_f_kennedy_jr.jpg", "ron_desantis.jpg", "ron_wyden.jpg", "sarah_huckabee_sanders.jpg", "scott_bessent.jpg", "scott_turner.jpg", "sean_duffy.jpg", "stephen_miller.jpg", "steve_daines.jpg", "susie_wiles.jpg", "taylor_budowich.jpg", "ted_cruz.jpg", "tina_kotek.jpg", "tom_cotton.jpg", "tommy_tuberville.jpg", "tulsi_gabbard.jpg", "vince_haley.jpg", "william_mcginley.jpg", "william_scharf.jpg"]);

function portraitSrc(src) {
  if (!src) return PORTRAIT_FALLBACK;
  const file = String(src).split("/").pop();
  return file && HAVE_IMAGE.has(file) ? src : PORTRAIT_FALLBACK;
}

function lonLatToVector2(lon, lat, stateName) {
  let x, y;
  if (stateName === "Alaska") {
    x = (lon + 140) * 0.1 - 8;
    y = (0 - lat) * 0.2 + 12;
  } else if (stateName === "Hawaii") {
    x = (lon + 130) * 0.5 + 5;
    y = (lat - 25) * 1.2 + 8;
  } else {
    x = (lon + 97) * 0.16;
    y = (49 - lat) * 0.25;
  }
  return new THREE.Vector2(x, -y);
}

function createShapeFromCoordinates(coordinates, stateName) {
  const shape = new THREE.Shape();
  coordinates.forEach((ring, i) => {
    const path = i === 0 ? shape : new THREE.Path();
    ring.forEach((coord, j) => {
      const p = lonLatToVector2(coord[0], coord[1], stateName);
      if (j === 0) path.moveTo(p.x, p.y);
      else path.lineTo(p.x, p.y);
    });
    if (ring.length) {
      const p = lonLatToVector2(ring[0][0], ring[0][1], stateName);
      path.lineTo(p.x, p.y);
    }
    if (i > 0) shape.holes.push(path);
  });
  return shape;
}

async function init() {
  try {
    const response = await fetch("data/gov_sen_data.json");
    data = await response.json();
  } catch (e) {
    console.error("Failed to load state data", e);
    return;
  }

  scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();
  loader.load("images/flag.jpg", function (texture) {
    scene.background = texture;
  });

  const container = document.getElementById("map");
  if (!container) return;

  camera = new THREE.PerspectiveCamera(35, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Optional bloom — only if the postprocessing scripts loaded
  try {
    if (typeof THREE.EffectComposer !== "undefined" && typeof THREE.UnrealBloomPass !== "undefined") {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(container.offsetWidth, container.offsetHeight), 0.3, 0.4, 0.85);
      composer.addPass(bloomPass);
    }
  } catch (e) {
    console.warn("Bloom disabled", e);
    composer = null;
  }

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.rotateSpeed = 0.7;
  controls.screenSpacePanning = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  let geoData;
  try {
    const geoResponse = await fetch("data/geojson_temp.json");
    geoData = await geoResponse.json();
  } catch (e) {
    console.error("Failed to load map geometry", e);
    return;
  }

  raycaster = new THREE.Raycaster();
  raycaster.params.Line.threshold = 0.5;
  mouse = new THREE.Vector2();

  geoData.features.forEach((feature) => {
    const stateName = feature.properties.name;
    if (!data.states[stateName]) return;

    const party = data.states[stateName].party || "Unknown";
    const color = party === "Republican" ? 0xff2222 : party === "Democrat" ? 0x2244ff : 0x888888;

    const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;

    polygons.forEach((polygon) => {
      const shape = createShapeFromCoordinates(polygon, stateName);
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
      const material = new THREE.MeshPhongMaterial({ color, shininess: 40, emissive: 0x000000, emissiveIntensity: 0 });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.stateName = stateName;
      scene.add(mesh);
      stateMeshes.push(mesh);

      if (!stateMeshMap.has(stateName)) stateMeshMap.set(stateName, []);
      stateMeshMap.get(stateName).push(mesh);

      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
      line.renderOrder = 999;
      line.material.depthTest = false;
      line.raycast = () => {};
      mesh.add(line);
      mesh.userData.edgeLine = line;
    });
  });

  try {
    const houseResponse = await fetch("data/house_data.json");
    const houseData = await houseResponse.json();
    for (let state in houseData.states) {
      if (data.states[state]) {
        data.states[state].officials.push(...houseData.states[state].officials);
      }
    }
  } catch (e) {
    console.warn("House data failed", e);
  }

  let pointerDownInfo = null;
  const onPointerDown = (event) => {
    if (event.isPrimary === false) return;
    pointerDownInfo = { x: event.clientX, y: event.clientY, time: Date.now() };
  };
  const onPointerUp = (event) => {
    if (!pointerDownInfo || event.isPrimary === false) return;
    const dx = event.clientX - pointerDownInfo.x;
    const dy = event.clientY - pointerDownInfo.y;
    if (Math.hypot(dx, dy) < 12 && Date.now() - pointerDownInfo.time < 400) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(stateMeshes, true);
      if (intersects.length > 0) {
        const hit = intersects.find(i => i.object.userData.stateName) || intersects.find(i => i.object.parent?.userData.stateName);
        if (hit) {
          const stateMesh = hit.object.userData.stateName ? hit.object : hit.object.parent;
          showOfficials(stateMesh.userData.stateName);
          pointerDownInfo = null;
          return;
        }
      }
      hideOfficials();
    }
    pointerDownInfo = null;
  };

  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", () => { pointerDownInfo = null; });
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(stateMeshes, true);
    if (intersects.length > 0) {
      const hit = intersects.find(i => i.object.userData.stateName) || intersects.find(i => i.object.parent?.userData.stateName);
      if (hit) {
        const stateMesh = hit.object.userData.stateName ? hit.object : hit.object.parent;
        showOfficials(stateMesh.userData.stateName);
        return;
      }
    }
    hideOfficials();
  });

  window.addEventListener("resize", onWindowResize);
  loadPresidentTeam();
  loadMetrics();
  setInterval(loadMetrics, 30000);
  setInterval(updateDebtClock, 1000);
  animate();
}

function updateDebtClock() {
  if (debtBase > 0 && debtTimestamp > 0) {
    const elapsed = (Date.now() - debtTimestamp) / 1000;
    const current = debtBase + (elapsed * DEBT_PER_SECOND);
    const formatted = (current / 1e12).toFixed(3);
    const el = document.getElementById("debt");
    if (el) el.innerText = `National Debt: $${formatted} trillion`;
  }
}

async function loadMetrics() {
  // Always set fallbacks first so something shows immediately
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
  set("debt", "National Debt: $40.4 trillion");
  set("oil", "WTI Oil: ~$103/bbl");
  set("unemployment", "Unemployment Rate: 4.2% (Sep 2026)");
  set("foreign-aid", "Foreign Aid (FY2025): ~$47.3 billion");

  // GitHub Pages is static: skip the app server so a missing /api/debt does not 404.
  const onGithubPages = /(^|\.)github\.io$/i.test(location.hostname);
  if (!onGithubPages) {
    try {
      const debtResponse = await fetch(new URL("../api/debt", location.href));
      if (debtResponse.ok) {
        const debtData = await debtResponse.json();
        if (typeof debtData.amount === "number" && debtData.amount > 0) {
          debtBase = debtData.amount;
          debtTimestamp = Date.now();
          set("debt", `National Debt: $${(debtBase / 1e12).toFixed(2)} trillion`);
        }
      }
    } catch (e) {
      console.warn("Debt API failed, using fallback", e);
    }
  }
}

async function loadPresidentTeam() {
  try {
    const response = await fetch("data/president_team_data.json");
    const teamData = await response.json();
    const teamContainer = document.querySelector(".team");
    if (!teamContainer) return;
    teamContainer.innerHTML = "";
    teamData.officials.forEach((official) => {
      const memberDiv = document.createElement("div");
      memberDiv.className = "team-member";
      const img = document.createElement("img");
      img.src = portraitSrc(official.image);
      img.alt = official.name;
      img.onerror = function () { this.src = "images/portrait-fallback.svg"; };
      const span = document.createElement("div");
      span.innerHTML = `<strong>${official.name}</strong><br><small>${official.position} • ${official.party}</small><br><small>Religion: ${official.religion || "—"}</small><br><small>AIPAC: ${official.aipac || "—"}</small>`;
      memberDiv.appendChild(img);
      memberDiv.appendChild(span);
      teamContainer.appendChild(memberDiv);
    });
  } catch (error) {
    console.error("Failed to load president team", error);
  }
}

function onWindowResize() {
  const container = document.getElementById("map");
  if (!container || !camera || !renderer) return;
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  if (composer) composer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (composer) composer.render();
  else if (renderer && scene && camera) renderer.render(scene, camera);
}

function createOfficialDiv(o) {
  const div = document.createElement("div");
  div.className = "official";
  div.innerHTML = `<img src="${portraitSrc(o.image)}" alt=""><div><strong>${o.name}</strong><br><small>${o.position} • ${o.party}</small><br><small>Religion: ${o.religion || "—"}</small><br><small>AIPAC: ${o.aipac || "—"}</small></div>`;
  div.style.cssText = "display:flex; align-items:center; gap:12px; margin:10px 0;";
  return div;
}

function showOfficials(stateName) {
  if (currentSelectedMeshes) {
    currentSelectedMeshes.forEach((mesh) => {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
      if (mesh.userData.edgeLine) {
        mesh.userData.edgeLine.material.color.setHex(0xffffff);
        mesh.userData.edgeLine.material.opacity = 0.35;
      }
    });
  }
  currentSelectedMeshes = stateMeshMap.get(stateName) || [];
  currentSelectedMeshes.forEach((mesh) => {
    mesh.material.emissive.setHex(0xffffff);
    mesh.material.emissiveIntensity = 0.5;
    if (mesh.userData.edgeLine) {
      mesh.userData.edgeLine.material.color.setHex(0xffd700);
      mesh.userData.edgeLine.material.opacity = 0.95;
    }
  });
  document.getElementById("state-name").textContent = stateName;
  const list = document.getElementById("officials-list");
  list.innerHTML = "";
  const officials = data.states[stateName]?.officials || [];
  const govSen = [];
  const house = [];
  officials.forEach((o) => {
    if (o.position === "Governor" || o.position === "Senator") govSen.push(o);
    else house.push(o);
  });
  govSen.forEach((o) => list.appendChild(createOfficialDiv(o)));
  if (house.length > 0) {
    const houseHeader = document.createElement("div");
    houseHeader.textContent = `House Representatives (${house.length})`;
    houseHeader.style.cssText = "cursor: pointer; font-weight: bold; margin-bottom: 5px;";
    const houseDiv = document.createElement("div");
    houseDiv.style.cssText = "margin-left: 20px; display: none;";
    houseHeader.addEventListener("click", () => {
      houseDiv.style.display = houseDiv.style.display === "none" ? "block" : "none";
    });
    house.forEach((o) => houseDiv.appendChild(createOfficialDiv(o)));
    list.appendChild(houseHeader);
    list.appendChild(houseDiv);
  }
  document.getElementById("info").style.display = "block";
}

function hideOfficials() {
  if (currentSelectedMeshes) {
    currentSelectedMeshes.forEach((mesh) => {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
      if (mesh.userData.edgeLine) {
        mesh.userData.edgeLine.material.color.setHex(0xffffff);
        mesh.userData.edgeLine.material.opacity = 0.35;
      }
    });
    currentSelectedMeshes = null;
  }
  document.getElementById("info").style.display = "none";
}

init();