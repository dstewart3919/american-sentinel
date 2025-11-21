let scene, camera, renderer, raycaster, mouse, controls;
let stateMeshes = [];
let data;

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
  const response = await fetch("data.json");
  data = await response.json();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000814);

  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  const geoResponse = await fetch(
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
  );
  const geoData = await geoResponse.json();

  raycaster = new THREE.Raycaster();
  raycaster.params.Line.threshold = 0.5; // helps with thin lines
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
      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: false,
        bevelThickness: 0.2,
        bevelSize: 0.1,
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshPhongMaterial({ color, shininess: 30 });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.stateName = stateName;
      scene.add(mesh);
      stateMeshes.push(mesh);

      // ——— BORDERS THAT DON'T BLOCK CLICKS ———
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x000000 })
      );
      line.renderOrder = 999; // draw on top
      line.material.depthTest = false; // prevent z-fighting
      line.raycast = () => {}; // ← THIS IS THE KEY: borders are invisible to raycaster
      mesh.add(line);
    });
  });

  // ——— PERFECT CLICK HANDLER ———
  window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(stateMeshes, true); // recursive = true

    if (intersects.length > 0) {
      // Find the first object that is a state mesh (skip lines)
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
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ——— INFO PANEL (unchanged) ———
function showOfficials(stateName) {
  document.getElementById("state-name").textContent = stateName;
  const list = document.getElementById("officials-list");
  list.innerHTML = "";
  data.states[stateName]?.officials?.forEach((o) => {
    const div = document.createElement("div");
    div.className = "official";
    div.innerHTML = `
      <img src="${
        o.image || "https://via.placeholder.com/60"
      }" onerror="this.src='https://via.placeholder.com/60'">
      <div>
        <strong>${o.name}</strong><br>
        <small>${o.position} • ${o.party}</small><br>
        <small>Religion: ${o.religion || "—"}</small>
      </div>
    `;
    div.style.cssText =
      "display:flex; align-items:center; gap:12px; margin:10px 0;";
    list.appendChild(div);
  });
  document.getElementById("info").style.display = "block";
}

function hideOfficials() {
  document.getElementById("info").style.display = "none";
}

// START
init();
