let scene, camera, renderer, raycaster, mouse, controls;
let stateMeshes = [];
let data;
let stateMeshMap = new Map();
let currentSelectedMeshes = null;

// ——— Projection (unchanged – already perfect) ———
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

// ——— INIT ———
async function init() {
  const response = await fetch("gov_sen_data.json");
  data = await response.json();

  scene = new THREE.Scene();
  // Load flag.jpg as background texture
  const loader = new THREE.TextureLoader();
  loader.load("images/flag.jpg", function (texture) {
    scene.background = texture;
  });

  const container = document.getElementById("map");

  camera = new THREE.PerspectiveCamera(
    35,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // OrbitControls – iOS friendly settings
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.rotateSpeed = 0.7;
  controls.screenSpacePanning = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  const geoResponse = await fetch(
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
  );
  const geoData = await geoResponse.json();

  raycaster = new THREE.Raycaster();
  raycaster.params.Line.threshold = 0.5;
  mouse = new THREE.Vector2();
  // ——— CREATE STATES ———
  geoData.features.forEach((feature) => {
    const stateName = feature.properties.name;
    if (!data.states[stateName]) return;

    const party = data.states[stateName].party || "Unknown";
    const color =
      party === "Republican"
        ? 0xff2222
        : party === "Democrat"
        ? 0x2244ff
        : 0x888888;

    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    polygons.forEach((polygon) => {
      const shape = createShapeFromCoordinates(polygon, stateName);
      const extrudeSettings = { depth: 0.2, bevelEnabled: false };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshPhongMaterial({ color, shininess: 30 });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.stateName = stateName;
      scene.add(mesh);
      stateMeshes.push(mesh);

      // Add to mesh map for glow effect
      if (!stateMeshMap.has(stateName)) stateMeshMap.set(stateName, []);
      stateMeshMap.get(stateName).push(mesh);

      // Invisible-to-raycast borders
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x000000 })
      );
      line.renderOrder = 999;
      line.material.depthTest = false;
      line.raycast = () => {}; // ← blocks raycast
      mesh.add(line);
    });
  });

  const houseResponse = await fetch("house_data.json");
  const houseData = await houseResponse.json();
  for (let state in houseData.states) {
    if (data.states[state]) {
      data.states[state].officials.push(...houseData.states[state].officials);
    }
  }

  // —-- iOS + Desktop TAP DETECTION (THIS IS THE FIX) ——
  let pointerDownInfo = null;

  const onPointerDown = (event) => {
    // Ignore non-primary pointers (e.g. second finger during pinch)
    if (event.isPrimary === false) return;

    pointerDownInfo = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
      pointerId: event.pointerId,
    };
  };

  const onPointerUp = (event) => {
    if (!pointerDownInfo || event.isPrimary === false) return;

    const dx = event.clientX - pointerDownInfo.x;
    const dy = event.clientY - pointerDownInfo.y;
    const distance = Math.hypot(dx, dy);
    const time = Date.now() - pointerDownInfo.time;

    // Consider it a tap if moved < 12px and released within 400ms
    if (distance < 12 && time < 400) {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(stateMeshes, true);

      if (intersects.length > 0) {
        const hit =
          intersects.find((i) => i.object.userData.stateName) ||
          intersects.find((i) => i.object.parent?.userData.stateName);

        if (hit) {
          const stateMesh = hit.object.userData.stateName
            ? hit.object
            : hit.object.parent;
          showOfficials(stateMesh.userData.stateName);
          pointerDownInfo = null;
          return;
        }
      }
      hideOfficials();
    }

    pointerDownInfo = null;
  };

  // —-- EVENT LISTENERS ——
  const canvas = renderer.domElement;

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", () => {
    pointerDownInfo = null;
  });

  // Keep mouse click for desktop (optional but nice)
  canvas.addEventListener("click", (e) => {
    // Re-use same logic
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(stateMeshes, true);

    if (intersects.length > 0) {
      const hit =
        intersects.find((i) => i.object.userData.stateName) ||
        intersects.find((i) => i.object.parent?.userData.stateName);
      if (hit) {
        const stateMesh = hit.object.userData.stateName
          ? hit.object
          : hit.object.parent;
        showOfficials(stateMesh.userData.stateName);
        return;
      }
    }
    hideOfficials();
  });

  window.addEventListener("resize", onWindowResize);
  await loadPresidentTeam();
  animate();
}

async function loadPresidentTeam() {
  try {
    const response = await fetch("president_team_data.json");
    const teamData = await response.json();
    const teamContainer = document.querySelector(".team");
    teamContainer.innerHTML = ""; // Clear existing hardcoded content

    teamData.officials.forEach((official) => {
      const memberDiv = document.createElement("div");
      memberDiv.className = "team-member";

      const img = document.createElement("img");
      img.src = official.image;
      img.alt = official.name;
      img.onerror = function () {
        this.src = "https://via.placeholder.com/80";
      };

      const span = document.createElement("div");
      span.className = "team-member-info";
      span.innerHTML = `
        <strong>${official.name}</strong><br>
        <small>${official.position} • ${official.party}</small><br>
        <small>Religion: ${official.religion || "—"}</small><br>
        <small>AIPAC: ${official.aipac || "—"}</small>
      `;

      memberDiv.appendChild(img);
      memberDiv.appendChild(span);
      teamContainer.appendChild(memberDiv);
    });
  } catch (error) {
    console.error("Failed to load president team data:", error);
  }
}

function onWindowResize() {
  const container = document.getElementById("map");
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// —-- INFO PANEL ——
function createOfficialDiv(o) {
  const div = document.createElement("div");
  div.className = "official";
  div.innerHTML = `
    <img src="${
      o.image || "https://via.placeholder.com/60"
    }" onerror="this.src='https://via.placeholder.com/60'">
    <div>
      <strong>${o.name}</strong><br>
      <small>${o.position} • ${o.party}</small><br>
      <small>Religion: ${o.religion || "—"}</small><br>
      <small>AIPAC: ${o.aipac || "—"}</small>
    </div>
  `;
  div.style.cssText =
    "display:flex; align-items:center; gap:12px; margin:10px 0;";
  return div;
}

function showOfficials(stateName) {
  // Reset previous glow
  if (currentSelectedMeshes) {
    currentSelectedMeshes.forEach((mesh) => {
      mesh.material.emissive.setHex(0);
      mesh.material.emissiveIntensity = 0;
    });
  }

  // Set glow on selected state
  currentSelectedMeshes = stateMeshMap.get(stateName) || [];
  currentSelectedMeshes.forEach((mesh) => {
    mesh.material.emissive.setHex(0xffffff);
    mesh.material.emissiveIntensity = 0.3;
  });

  document.getElementById("state-name").textContent = stateName;
  const list = document.getElementById("officials-list");
  list.innerHTML = "";
  const officials = data.states[stateName]?.officials || [];
  const govSen = [];
  const house = [];
  officials.forEach((o) => {
    if (o.position === "Governor" || o.position === "Senator") {
      govSen.push(o);
    } else {
      house.push(o);
    }
  });
  // Append Gov and Senators
  govSen.forEach((o) => list.appendChild(createOfficialDiv(o)));
  // Append House if any
  if (house.length > 0) {
    const houseHeader = document.createElement("div");
    houseHeader.textContent = `House Representatives (${house.length})`;
    houseHeader.style.cssText =
      "cursor: pointer; font-weight: bold; margin-bottom: 5px;";
    houseHeader.addEventListener("click", () => {
      if (houseDiv.style.display === "none" || houseDiv.style.display === "") {
        houseDiv.style.display = "block";
      } else {
        houseDiv.style.display = "none";
      }
    });
    const houseDiv = document.createElement("div");
    houseDiv.style.cssText = "margin-left: 20px; display: none;";
    house.forEach((o) => houseDiv.appendChild(createOfficialDiv(o)));
    list.appendChild(houseHeader);
    list.appendChild(houseDiv);
  }
  document.getElementById("info").style.display = "block";
}

function hideOfficials() {
  // Reset glow
  if (currentSelectedMeshes) {
    currentSelectedMeshes.forEach((mesh) => {
      mesh.material.emissive.setHex(0);
      mesh.material.emissiveIntensity = 0;
    });
    currentSelectedMeshes = null;
  }

  document.getElementById("info").style.display = "none";
}

// START
init();
