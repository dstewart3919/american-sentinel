let scene, camera, renderer, raycaster, mouse, controls, composer = null, bloomPass = null;
let stateMeshes = [];
let data;
let stateMeshMap = new Map();
let currentSelectedMeshes = null;
let debtBase = 0;
let debtTimestamp = 0;
const DEBT_PER_SECOND = 75000;
const PORTRAIT_FALLBACK = "images/portrait-fallback.svg";
const HAVE_IMAGE = new Set(["Donald_Trump.jpg", "aaron_bean.jpg", "abigail_spanberger.jpg", "abraham_hamadeh.jpg", "adam_gray.jpg", "adam_schiff.jpg", "adam_smith.jpg", "adelita_grijalva.jpg", "adrian_smith.jpg", "adriano_espaillat.jpg", "alex_mooney.jpg", "alex_padilla.jpg", "alexandria_ocasio_cortez.jpg", "alicia_blake.jpg", "american_sentinel.png", "ami_bera.jpg", "amy_klobuchar.jpg", "andre_carson.jpg", "andrew_clyde.jpg", "andrew_garbarino.jpg", "andy_barr.jpg", "andy_beshear.jpg", "andy_biggs.jpg", "andy_harris.jpg", "andy_kim.jpg", "andy_ogles.jpg", "angela_alsobrooks.jpg", "angie_craig.jpg", "angus_king.jpg", "ann_wagner.jpg", "anna_paulina_luna.jpg", "anthony_desposito.jpg", "april_mcclain_delaney.jpg", "ashley_hinson.jpg", "ashley_moody.jpg", "august_pfluger.jpg", "austin_scott.jpg", "ayanna_pressley.jpg", "barry_loudermilk.jpg", "barry_moore.jpg", "becca_balint.jpg", "ben_cline.jpg", "ben_ray_lujã¡n.jpg", "bennie_thompson.jpg", "bernie_moreno.jpg", "bernie_sanders.jpg", "beth_van_duyne.jpg", "betty_mccollum.jpg", "bill_cassidy.jpg", "bill_foster.jpg", "bill_hagerty.jpg", "bill_huizenga.jpg", "bill_johnson_oh.jpg", "bill_keating.jpg", "bill_lee.jpg", "blake_moore.jpg", "bob_casey.jpg", "bob_ferguson.jpg", "bob_gibbs.jpg", "bob_good.jpg", "bob_latta.jpg", "bob_onder.jpg", "bonnie_watson_coleman.jpg", "brad_finstad.jpg", "brad_little.jpg", "brad_schneider.jpg", "brad_sherman.jpg", "brandon_williams.jpg", "brett_guthrie.jpg", "brian_higgins.jpg", "brian_higgins_ny.jpg", "brian_jack.jpg", "brian_kemp.jpg", "brian_mast.jpg", "brian_schatz.jpg", "brittany_pettersen.jpg", "bruce_westerman.jpg", "bryan_steil.jpg", "buddy_carter.jpg", "burgess_owens.jpg", "byron_donalds.jpg", "carlos_gimenez.jpg", "carol_miller.jpg", "catherine_cortez_masto.jpg", "cathy_mcmorris_rodgers.jpg", "chad_chronister.jpg", "chellie_pingree.jpg", "chip_roy.jpg", "chris_coons.jpg", "chris_murphy.jpg", "chris_pappas.jpg", "chris_smith.jpg", "chris_stewart.jpg", "chris_van_hollen.jpg", "chris_wright.jpg", "chrissy_houlahan.jpg", "chuck_fleischmann.jpg", "chuck_grassley.jpg", "chuck_schumer.jpg", "chuy_garcia.jpg", "cindy_hyde-smith.jpg", "cj_henry.jpg", "claudia_tenney.jpg", "clay_higgins.jpg", "cleo_fields.jpg", "cliff_bentz.jpg", "colin_allred.jpg", "cory_booker.jpg", "cory_mills.jpg", "craig_goldman.jpg", "cynthia_lummis.jpg", "dale_strong.jpg", "dan_bishop.jpg", "dan_crenshaw.jpg", "dan_crenshaw_tx38.jpg", "dan_goldman.jpg", "dan_mckee.jpg", "dan_meuser.jpg", "dan_newhouse.jpg", "dan_sullivan.jpg", "daniel_webster.jpg", "danny_davis.jpg", "darin_lahood.jpg", "darrell_issa.jpg", "darren_soto.jpg", "darrin_camilleri.jpg", "dave_joyce.jpg", "david_kustoff.jpg", "david_schweikert.jpg", "david_scott.jpg", "david_valadao.jpg", "deb_fischer.jpg", "debbie_dingell.jpg", "debbie_wasserman_schultz.jpg", "deborah_ross.jpg", "delia_ramirez.jpg", "derek_kilmer.jpg", "derek_schmidt.jpg", "derek_tran.jpg", "derrick_van_orden.jpg", "diana_degette.jpg", "diana_harshbarger.jpg", "dick_durbin.jpg", "dina_titus.jpg", "don_bacon.jpg", "don_davis.jpg", "donald_norcross.jpg", "doris_matsui.jpg", "doug_burgum.jpg", "doug_lamalfa.jpg", "dusty_johnson.jpg", "earl_blumenauer.jpg", "ed_case.jpg", "ed_markey.jpg", "eli_crane.jpg", "elise_stefanik.jpg", "elissa_slotkin.jpg", "elizabeth_warren.jpg", "emanuel_cleaver.jpg", "emilia_sykes.jpg", "eric_burlison.jpg", "eric_holcomb.jpg", "eric_schmitt.jpg", "eric_sorensen.jpg", "eric_swalwell.jpg", "erin_houchin.jpg", "flag.jpg", "frank_lucas.jpg", "frank_pallone.jpg", "frederica_wilson.jpg", "french_hill.jpg", "gabe_amo.jpg", "gabe_evans.jpg", "gabe_vasquez.jpg", "gary_palmer.jpg", "gary_peters.jpg", "gavin_newsom.jpg", "george_whitesides.jpg", "gil_cisneros.jpg", "glenn_grothman.jpg", "glenn_ivey.jpg", "glenn_thompson.jpg", "grace_meng.jpg", "greg_abbott.jpg", "greg_gianforte.jpg", "greg_landsman.jpg", "greg_murphy.jpg", "greg_stanton.jpg", "greg_steube.jpg", "gregory_meeks.jpg", "gretchen_whitmer.jpg", "gus_bilirakis.jpg", "guy_reschenthaler.jpg", "guy_reschenthaler_pa13.jpg", "hakeem_jeffries.jpg", "hal_rogers.jpg", "haley_stevens.jpg", "hank_johnson.jpg", "harriet_hageman.jpg", "harrison_fields.jpg", "henry_cuellar.jpg", "henry_mcmaster.jpg", "herb_conaway.jpg", "hillary_scholten.jpg", "howard_lutnick.jpg", "ilhan_omar.jpg", "jack_bergman.jpg", "jack_reed.jpg", "jacky_rosen.jpg", "jahana_hayes.jpg", "jake_auchincloss.jpg", "jake_ellzey.jpg", "james_clyburn.jpg", "james_comer.jpg", "james_lankford.jpg", "jamie_raskin.jpg", "jamieson_greer.jpg", "jan_schakowsky.jpg", "jane_mitakides.jpg", "janet_mills.jpg", "jared_golden.jpg", "jared_huffman.jpg", "jared_moskowitz.jpg", "jared_polis.jpg", "jasmin_crockett.jpg", "jason_crow.jpg", "jason_smith.jpg", "jay_inslee.jpg", "jay_obernolte.jpg", "jb_pritzker.jpg", "jd_vance.jpg", "jeanne_shaheen.jpg", "jeff_crank.jpg", "jeff_hurd.jpg", "jeff_jackson.jpg", "jeff_landry.jpg", "jeff_merkley.jpg", "jeff_van_drew.jpg", "jefferson_shreve.jpg", "jennifer_mcclellan.jpg", "jerry_moran.jpg", "jill_tokuda.jpg", "jim_baird.jpg", "jim_banks.jpg", "jim_clyburn.jpg", "jim_costa.jpg", "jim_goyer.jpg", "jim_himes.jpg", "jim_justice.jpg", "jim_mcgovern.jpg", "jim_pillen.jpg", "jim_risch.jpg", "jimmy_gomez.jpg", "jimmy_panetta.jpg", "jimmy_patronis.jpg", "joaquin_castro.jpg", "jodey_arrington.jpg", "joe_courtney.jpg", "joe_lombardo.jpg", "joe_neguse.jpg", "joe_wilson.jpg", "john_barrasso.jpg", "john_boozman.jpg", "john_carter.jpg", "john_cornyn.jpg", "john_curtis.jpg", "john_fetterman.jpg", "john_garamendi.jpg", "john_hickenlooper.jpg", "john_hoeven.jpg", "john_james.jpg", "john_joyce.jpg", "john_kennedy.jpg", "john_larson.jpg", "john_mannion.jpg", "john_moolenaar.jpg", "john_ratcliffe.jpg", "john_rose.jpg", "john_rutherford.jpg", "john_thune.jpg", "johnny_olszewski.jpg", "jon_husted.jpg", "jon_ossoff.jpg", "jon_tester.jpg", "jonathan_jackson.jpg", "joni_ernst.jpg", "josh_brecheen.jpg", "josh_gottheimer.jpg", "josh_green.jpg", "josh_harder.jpg", "josh_hawley.jpg", "josh_riley.jpg", "josh_shapiro.jpg", "josh_stein.jpg", "juan_ciscomani.jpg", "juan_vargas.jpg", "judy_chu.jpg", "julia_brownley.jpg", "julia_letlow.jpg", "karoline_leavitt.jpg", "kash_patel.jpg", "kat_cammack.jpg", "katherine_clark.jpg", "kathy_castor.jpg", "kathy_hochul.jpg", "kathy_manning.jpg", "katie_britt.jpg", "katie_hobbs.jpg", "kay_granger.jpg", "kay_ivey.jpg", "keith_kellogg.jpg", "keith_self.jpg", "kelly_armstrong.jpg", "kelly_ayotte.jpg", "kelly_loeffler.jpg", "kelly_morrison.jpg", "ken_calvert.jpg", "kevin_cramer.jpg", "kevin_hassett.jpg", "kevin_hern.jpg", "kevin_kiley.jpg", "kevin_mullin.jpg", "kevin_stitt.jpg", "kim_reynolds.jpg", "kim_schrier.jpg", "kirsten_gillibrand.jpg", "kristen_mcdonald_rivet.jpg", "kristi_noem.jpg", "kweisi_mfume.jpg", "lamonica_mciver.jpg", "lance_gooden.jpg", "lance_gooden_tx25.jpg", "larry_bucshon.jpg", "larry_rhoden.jpg", "lateefah_simon.jpg", "laura_friedman.jpg", "laura_gillen.jpg", "laura_kelly.jpg", "laurel_lee.jpg", "lauren_boebert.jpg", "lauren_underwood.jpg", "lee_zeldin.jpg", "linda_mcmahon.jpg", "linda_sanchez.jpg", "lindsey_graham.jpg", "lisa_blunt_rochester.jpg", "lisa_mcclain.jpg", "lisa_murkowski.jpg", "lloyd_smucker.jpg", "lois_frankel.jpg", "lori_chavez_deremer.jpg", "lori_trahan.jpg", "lou_correa.jpg", "lucy_mcbath.jpg", "luz_rivas.jpg", "madeleine_dean.jpg", "maggie_goodlander.jpg", "maggie_hassan.jpg", "marc_veasey.jpg", "marc_veasey_tx28.jpg", "marc_veasey_tx33.jpg", "marcia_fudge.jpg", "marco_rubio.jpg", "marcy_kaptur.jpg", "maria_cantwell.jpg", "maria_elvira_salazar.jpg", "mariannette_miller_meeks.jpg", "marie_gluesenkamp_perez.jpg", "marilyn_strickland.jpg", "marilyn_strickland_wa10.jpg", "mario_diaz_balart.jpg", "marjorie_taylor_greene.jpg", "mark_alford.jpg", "mark_amodei.jpg", "mark_desaulnier.jpg", "mark_gordon.jpg", "mark_green.jpg", "mark_kelly.jpg", "mark_messmer.jpg", "mark_takano.jpg", "mark_warner.jpg", "mark_warner_va10.jpg", "markwayne_mullin.jpg", "marlin_stutzman.jpg", "marsha_blackburn.jpg", "martin_heinrich.jpg", "mary_gay_scanlon.jpg", "mary_miller.jpg", "matt_brasseaux.jpg", "matt_cartwright.jpg", "matt_meyer.jpg", "maura_healey.jpg", "max_miller.jpg", "maxine_waters.jpg", "maxwell_frost.jpg", "mayra_flores.jpg", "mazie_hirono.jpg", "melanie_stansbury.jpg", "michael_bennet.jpg", "michael_burgess.jpg", "michael_burgess_tx26.jpg", "michael_cloud.jpg", "michael_guest.jpg", "michael_mccaul.jpg", "michael_rulli.jpg", "michelle_fischbach.jpg", "michelle_lujan_grisham.jpg", "mike_bost.jpg", "mike_braun.jpg", "mike_collins.jpg", "mike_crapo.jpg", "mike_dewine.jpg", "mike_dunleavy.jpg", "mike_ezell.jpg", "mike_flood.jpg", "mike_gallagher.jpg", "mike_haridopolos.jpg", "mike_johnson.jpg", "mike_kehoe.jpg", "mike_kelly.jpg", "mike_lawler.jpg", "mike_lee.jpg", "mike_levin.jpg", "mike_quigley.jpg", "mike_rogers_al.jpg", "mike_rounds.jpg", "mike_simpson.jpg", "mike_thompson.jpg", "mike_waltz.jpg", "mikie_sherrill.jpg", "mitch_mcconnell.jpg", "monica_de_la_cruz.jpg", "morgan_griffith.jpg", "morgan_luttrell.jpg", "morgan_mcgarvey.jpg", "nancy_mace.jpg", "nancy_pelosi.jpg", "nanette_barragan.jpg", "neal_dunn.jpg", "ned_lamont.jpg", "nellie_pou.jpg", "nick_begich.jpg", "nick_lalota.jpg", "nick_langworthy.jpg", "nicole_malliotakis.jpg", "nikema_williams.jpg", "nikki_budzinski.jpg", "norma_torres.jpg", "nydia_velazquez.jpg", "pam_bondi.jpg", "pat_ryan.jpg", "patrick_fallon.jpg", "patrick_mchenry.jpg", "patrick_morrisey.jpg", "patty_murray.jpg", "paul_gosar.jpg", "paul_tonko.jpg", "paulina_miller.jpg", "pete_aguilar.jpg", "pete_hegseth.jpg", "pete_ricketts.jpg", "pete_sessions.jpg", "pete_stauber.jpg", "peter_welch.jpg", "phil_scott.jpg", "pramila_jayapal.jpg", "raja_krishnamoorthi.jpg", "ralph_norman.jpg", "rand_paul.jpg", "randy_feenstra.jpg", "randy_fine.jpg", "randy_weber.jpg", "raphael_warnock.jpg", "rashida_tlaib.jpg", "raul_ruiz.jpg", "rebecca_kleefisch.jpg", "rich_mccormick.jpg", "richard_blumenthal.jpg", "richard_hudson.jpg", "richard_neal.jpg", "rick_allen.jpg", "rick_becker.jpg", "rick_crawford.jpg", "rick_larsen.jpg", "rick_scott.jpg", "ro_khanna.jpg", "rob_menendez.jpg", "rob_wittman.jpg", "rob_wittman_va8.jpg", "robert_aderholt.jpg", "robert_f_kennedy_jr.jpg", "robert_garcia.jpg", "robert_lighthizer.jpg", "robert_wittman_va3.jpg", "robin_kelly.jpg", "roger_marshall.jpg", "roger_wicker.jpg", "ron_desantis.jpg", "ron_estes.jpg", "ron_johnson.jpg", "ron_wyden.jpg", "ronny_jackson.jpg", "rosa_delauro.jpg", "ruben_gallego.jpg", "rudy_salas.jpg", "rudy_yakym.jpg", "russ_fulcher.jpg", "russell_vought.jpg", "ryan_mackenzie.jpg", "ryan_zinke.jpg", "salud_carbajal.jpg", "sam_graves.jpg", "sam_liccardo.jpg", "sanford_bishop.jpg", "sara_jacobs.jpg", "sarah_elfreth.jpg", "sarah_huckabee_sanders.jpg", "sarah_mcbride.jpg", "scott_bessent.jpg", "scott_desjarlais.jpg", "scott_franklin.jpg", "scott_perry.jpg", "scott_perry_pa10.jpg", "scott_perry_pa14.jpg", "scott_peters.jpg", "scott_turner.jpg", "sean_casten.jpg", "sean_duffy.jpg", "seth_magaziner.jpg", "seth_moulton.jpg", "sharice_davids.jpg", "sheila_cherfilus_mccormick.jpg", "sheldon_whitehouse.jpg", "shelley_moore_capito.jpg", "shomari_figures.jpg", "shontel_brown.jpg", "shri_thanedar.jpg", "spencer_cox.jpg", "steny_hoyer.jpg", "stephanie_bice.jpg", "stephen_lynch.jpg", "stephen_miller.jpg", "stephen_witkoff.jpg", "steve_daines.jpg", "steve_scalise.jpg", "steve_womack.jpg", "steven_horsford.jpg", "suhas_subramanyam.jpg", "susan_collins.jpg", "susan_wild.jpg", "susie_lee.jpg", "susie_wiles.jpg", "suzanne_bonamici.jpg", "sydney_kamlager_dove.jpg", "sylvester_turner.jpg", "tammy_baldwin.jpg", "tammy_duckworth.jpg", "tate_reeves.jpg", "taylor_budowich.jpg", "ted_budd.jpg", "ted_cruz.jpg", "ted_lieu.jpg", "teresa_leger_fernandez.jpg", "terri_sewell.jpg", "thom_tillis.jpg", "thomas_kean.jpg", "thomas_massie.jpg", "tim_burchett.jpg", "tim_burchett_tn9.jpg", "tim_kaine.jpg", "tim_kaine_va11.jpg", "tim_scott.jpg", "tim_sheehy.jpg", "tim_walberg.jpg", "tim_walz.jpg", "tina_kotek.jpg", "tina_smith.jpg", "todd_young.jpg", "tom_barrett.jpg", "tom_cole.jpg", "tom_cotton.jpg", "tom_emmer.jpg", "tom_homan.jpg", "tom_mcclintock.jpg", "tom_rice.jpg", "tom_suozzi.jpg", "tom_tiffany.jpg", "tommy_tuberville.jpg", "tony_evers.jpg", "tony_gonzales.jpg", "tracey_mann.jpg", "trent_kelly.jpg", "troy_balderson.jpg", "troy_carter.jpg", "troy_downing.jpg", "troy_nehls.jpg", "tulsi_gabbard.jpg", "vacant.jpg", "val_hoyle.jpg", "valerie_foushee.jpg", "van_taylor.jpg", "vern_buchanan.jpg", "vicente_gonzalez.jpg", "victoria_spartz.jpg", "vince_fong.jpg", "vince_haley.jpg", "virginia_foxx.jpg", "virginia_foxx_nc5.jpg", "warren_davidson.jpg", "warren_davidson_oh8.jpg", "wes_moore.jpg", "wesley_bell.jpg", "wiley_nickel.jpg", "william_mcginley.jpg", "william_scharf.jpg", "william_timmons.jpg", "yassamin_ansari.jpg", "young_kim.jpg", "zach_nunn.jpg", "zoe_lofgren.jpg"]);

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