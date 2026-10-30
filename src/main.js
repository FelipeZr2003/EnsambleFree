// Aquí vive la parte interactiva: el modelo, los controles y los botones.
// Las funciones están juntas para que sea fácil seguir el recorrido completo
// cuando alguien nuevo revise o quiera ampliar el configurador.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

    const defaults = { preset: 'Mid-Tower', height: 450, width: 220, depth: 480, doubleChamber: false, material: 'Metal perforado', paintColor: '#49627f', paintFinish: 'satin', frontTexture: 'none', frontTextureName: '', glassStyle: 'clear', mbFormat: 'ATX', mbOffsetY: 0, radiatorEnabled: true, radiatorSize: '240 mm', radiatorLocation: 'Superior', radiatorInverted: false, radiatorOffsetX: 0, radiatorOffsetY: 0, radiatorOffsetZ: 0, fanGroups: { Frontal: { enabled: true, size: '120 mm', count: 2, invert: false, offsetX: 0, offsetY: 0, offsetZ: 0 }, Trasero: { enabled: false, size: '120 mm', count: 1, invert: false, offsetX: 0, offsetY: 0, offsetZ: 0 }, Superior: { enabled: false, size: '120 mm', count: 2, invert: false, offsetX: 0, offsetY: 0, offsetZ: 0 }, Inferior: { enabled: false, size: '120 mm', count: 2, invert: false, offsetX: 0, offsetY: 0, offsetZ: 0 }, Lateral: { enabled: false, size: '120 mm', count: 1, invert: false, offsetX: 0, offsetY: 0, offsetZ: 0 } }, fanEnabled: true, fanSize: '120 mm', fanLocation: 'Frontal', fanCount: 2, fanOffsetY: 0, fanOffsetZ: 0 };
    const state = { ...defaults, renderMode: false };
    const psuSpecs = {
      'ATX': { width:150, height:86, depth:140, label:'ATX · 150 × 86 × 140 mm' },
      'SFX': { width:125, height:63.5, depth:100, label:'SFX · 125 × 63.5 × 100 mm' },
      'SFX-L': { width:125, height:63.5, depth:130, label:'SFX-L · 125 × 63.5 × 130 mm' },
      'TFX': { width:85, height:65, depth:175, label:'TFX · 85 × 65 × 175 mm' },
      'Flex ATX': { width:81.5, height:40.5, depth:150, label:'Flex ATX · 81.5 × 40.5 × 150 mm' }
    };
    state.psuType = state.psuType || 'ATX';
    const DOUBLE_CHAMBER_EXTRA_MM = 90;
    function psuSpec() { return psuSpecs[state.psuType] || psuSpecs.ATX; }
    function storageSeparatorYScene() { return psuSpec().height*.82 + 20; }
    function doubleChamberExtraMm() { return Math.max(DOUBLE_CHAMBER_EXTRA_MM, psuSpec().width + 24); }
    function effectiveChassisWidthMm() { return state.width + (state.doubleChamber ? doubleChamberExtraMm() : 0); }
    function effectiveChassisWidthScene() { return effectiveChassisWidthMm() * .82; }
    function chamberDividerX(totalWidthScene) { return state.doubleChamber ? totalWidthScene/2 - doubleChamberExtraMm()*.82 : totalWidthScene*.14; }
    // En cámara única se deja un canal posterior para cableado entre la
    // placa base y la tapa lateral derecha. La tapa existente en +X sigue
    // siendo la lámina exterior del chasis; este desplazamiento evita que la
    // placa quede pegada o sobresalga de ella.
    function motherboardTrayX(totalWidthScene) {
      return state.doubleChamber ? chamberDividerX(totalWidthScene) - 4 : totalWidthScene/2 - 24;
    }
    const controlsEl = document.getElementById('controls');
    const viewport = document.getElementById('viewport');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 3000);
    camera.position.set(620, 520, 720);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.appendChild(renderer.domElement);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true; orbit.target.set(0, 220, 0); orbit.minDistance = 380; orbit.maxDistance = 1600;
    scene.add(new THREE.HemisphereLight(0xb9d8ff, 0x0b1220, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.5); key.position.set(500, 900, 650); key.castShadow = true; scene.add(key);
    const rim = new THREE.PointLight(0x32d5ff, 80, 1000); rim.position.set(-450, 420, -300); scene.add(rim);
    const grid = new THREE.GridHelper(1800, 36, 0x28415b, 0x18293c); grid.position.y = -2; scene.add(grid);
    const model = new THREE.Group();
    // Elevación global: las patas apoyan sobre la cuadrícula sin alterar las
    // coordenadas relativas del chasis ni de sus componentes.
    model.position.y = 14;
    scene.add(model);

    const mat = { metal: new THREE.MeshStandardMaterial({ color: 0x49627f, metalness: .82, roughness: .28, transparent: true, opacity: .88 }), edge: new THREE.MeshStandardMaterial({ color: 0x32d5ff, metalness: .65, roughness: .22, emissive: 0x073c4b, emissiveIntensity: .6 }), inside: new THREE.MeshStandardMaterial({ color: 0x253b57, metalness: .35, roughness: .5, transparent: true, opacity: .52 }), glass: new THREE.MeshPhysicalMaterial({ color: 0x70bfff, metalness: .05, roughness: .08, transmission: .35, transparent: true, opacity: .4, side: THREE.DoubleSide }), front: new THREE.MeshStandardMaterial({ color: 0x49627f, metalness: .82, roughness: .28, transparent: true, opacity: .88, side: THREE.DoubleSide }), wood: new THREE.MeshStandardMaterial({ color: 0x8b542f, roughness: .65 }), board: new THREE.MeshStandardMaterial({ color: 0x1f8b78, metalness: .35, roughness: .55, emissive: 0x063a36, emissiveIntensity: .5 }), copper: new THREE.MeshStandardMaterial({ color: 0xf3bb4a, metalness: .75, roughness: .3 }), cutout: new THREE.MeshBasicMaterial({ color: 0x050a12, transparent: true, opacity: .9 }), radiator: new THREE.MeshStandardMaterial({ color: 0x303d52, metalness: .72, roughness: .38 }), fan: new THREE.MeshStandardMaterial({ color: 0x8c7cff, metalness: .55, roughness: .3, emissive: 0x241b61, emissiveIntensity: .5, side: THREE.DoubleSide }), fanHole: new THREE.MeshBasicMaterial({ color: 0x050a12, transparent: true, opacity: .8 }) };
    const frontTextureCache = new Map();
    let customFrontTexturePair = null;
    const renderMaterialDefaults = new WeakMap();
    const paintFinishes = { matte: { roughness: .82, metalness: .35 }, satin: { roughness: .42, metalness: .72 }, gloss: { roughness: .16, metalness: .88 } };
    function textureCanvas(draw, size=256) {
      const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d'); draw(ctx, size); return canvas;
    }
    function makeTexturePair(name) {
      if (frontTextureCache.has(name)) return frontTextureCache.get(name);
      const canvas = textureCanvas((ctx,s) => {
        // Base neutra: el color elegido del chasis debe teñir también las
        // texturas del frontal y no quedar dominado por un azul fijo.
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,s,s);
        if (name === 'brushed') { for(let y=0;y<s;y+=3){ctx.strokeStyle=`rgba(220,235,245,${.08+Math.random()*.14})`;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(s,y+Math.random()*2);ctx.stroke();} }
        if (name === 'mesh') { ctx.strokeStyle='rgba(15,25,38,.7)';ctx.lineWidth=2; for(let i=-s;i<s*2;i+=12){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+s,s);ctx.stroke();ctx.beginPath();ctx.moveTo(i,s);ctx.lineTo(i+s,0);ctx.stroke();} }
        if (name === 'carbon') { for(let y=-s;y<s*2;y+=22){for(let x=-s;x<s*2;x+=22){ctx.fillStyle=((x/22+y/22)%2===0)?'#1b2735':'#334558';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+11,y-11);ctx.lineTo(x+22,y);ctx.lineTo(x+11,y+11);ctx.closePath();ctx.fill();}} }
        if (name === 'wood') { ctx.fillStyle='#7a4b2e';ctx.fillRect(0,0,s,s); for(let i=0;i<30;i++){ctx.strokeStyle=`rgba(220,155,91,${.18+Math.random()*.25})`;ctx.lineWidth=1+Math.random()*3;ctx.beginPath();ctx.moveTo(0,i*10+Math.random()*8);ctx.bezierCurveTo(s*.3,i*10-12,s*.7,i*10+16,s,i*10+Math.random()*8);ctx.stroke();} }
        if (name === 'geometric') { ctx.strokeStyle='rgba(93,221,244,.35)';ctx.lineWidth=2; for(let x=0;x<s;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,s);ctx.stroke();} for(let y=0;y<s;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(s,y);ctx.stroke();} }
      });
      const map = new THREE.CanvasTexture(canvas); map.wrapS=map.wrapT=THREE.RepeatWrapping; map.repeat.set(2,3); map.colorSpace=THREE.SRGBColorSpace;
      const roughCanvas = textureCanvas((ctx,s)=>{ctx.fillStyle=name==='mesh'?'#777':'#b0b0b0';ctx.fillRect(0,0,s,s);},256);
      const roughnessMap = new THREE.CanvasTexture(roughCanvas); roughnessMap.wrapS=roughnessMap.wrapT=THREE.RepeatWrapping; roughnessMap.repeat.copy(map.repeat);
      const pair={map,roughnessMap}; frontTextureCache.set(name,pair); return pair;
    }
    function setFrontTexture(name, image=null) {
      if (image) { const map=new THREE.Texture(image); map.colorSpace=THREE.SRGBColorSpace; map.wrapS=map.wrapT=THREE.RepeatWrapping; map.repeat.set(2,3); const roughCanvas=textureCanvas((ctx,s)=>{ctx.fillStyle='#999';ctx.fillRect(0,0,s,s);}); const roughnessMap=new THREE.CanvasTexture(roughCanvas); roughnessMap.wrapS=roughnessMap.wrapT=THREE.RepeatWrapping; roughnessMap.repeat.set(2,3); customFrontTexturePair={map,roughnessMap}; }
      const pair = name === 'custom' ? (customFrontTexturePair || {map:null,roughnessMap:null}) : name === 'none' ? {map:null,roughnessMap:null} : makeTexturePair(name);
      if (pair.map) { pair.map.colorSpace=THREE.SRGBColorSpace; pair.map.wrapS=pair.map.wrapT=THREE.RepeatWrapping; if(!image) pair.map.repeat.set(2,3); pair.map.needsUpdate=true; }
      mat.front.map=pair.map; mat.front.roughnessMap=pair.roughnessMap; mat.front.needsUpdate=true;
    }
    function applyChassisAppearance() {
      const finish=paintFinishes[state.paintFinish] || paintFinishes.satin;
      mat.metal.color.set(state.paintColor); mat.metal.roughness=finish.roughness; mat.metal.metalness=finish.metalness;
      mat.edge.color.set(state.paintColor); mat.edge.roughness=finish.roughness; mat.edge.metalness=finish.metalness; mat.edge.emissive.set(state.paintColor); mat.edge.emissiveIntensity=.12;
      mat.inside.color.set(state.paintColor); mat.inside.roughness=finish.roughness; mat.inside.metalness=finish.metalness;
      mat.front.color.set(state.paintColor); mat.front.roughness=finish.roughness; mat.front.metalness=finish.metalness;
      [mat.metal, mat.inside, mat.front].forEach(material => { material.transparent=false; material.opacity=1; material.depthWrite=true; material.needsUpdate=true; });
      setFrontTexture(state.frontTexture);
      if (state.renderMode) { mat.front.map=null; mat.front.roughnessMap=null; mat.front.needsUpdate=true; }
      const dark=state.glassStyle==='dark';
      mat.glass.color.set(dark ? '#24364d' : (state.renderMode ? '#a9c7d8' : '#70bfff'));
      mat.glass.opacity=dark ? (state.renderMode ? .62 : .56) : (state.renderMode ? .46 : .4);
      mat.glass.transmission=dark ? (state.renderMode ? .12 : .16) : (state.renderMode ? .5 : .35);
      mat.glass.roughness=dark ? .14 : (state.renderMode ? .06 : .08);
      mat.glass.needsUpdate=true;
    }
    function applyRenderMode() {
      model.traverse(object => {
        if (!object.isMesh || !object.material) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          const isGlass = material === mat.glass || material.type === 'MeshPhysicalMaterial';
          if (!renderMaterialDefaults.has(material)) renderMaterialDefaults.set(material, { transparent: material.transparent, opacity: material.opacity, depthWrite: material.depthWrite, depthTest: material.depthTest });
          if (isGlass) {
            material.transparent = true;
            material.side = THREE.DoubleSide;
            return;
          }
          if (state.renderMode) {
            material.transparent = false;
            material.opacity = 1;
            material.depthWrite = true;
          } else {
            const original = renderMaterialDefaults.get(material);
            material.transparent = original.transparent;
            material.opacity = original.opacity;
            material.depthWrite = original.depthWrite;
            material.depthTest = original.depthTest;
          }
          material.needsUpdate = true;
        });
      });
    }
    function box(w, h, d, material, x=0, y=0, z=0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; model.add(m); return m; }
    function perforatedPanel(w, thickness, d, material, x=0, y=0, z=0, holes=[]) {
      const shape = new THREE.Shape();
      shape.moveTo(-w/2, -d/2); shape.lineTo(w/2, -d/2); shape.lineTo(w/2, d/2); shape.lineTo(-w/2, d/2); shape.closePath();
      holes.forEach(hole => {
        const path = new THREE.Path();
        path.absellipse(hole.x, hole.z, hole.r, hole.r, 0, Math.PI*2, false, 0);
        shape.holes.push(path);
      });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 10, steps: 1 });
      // ExtrudeGeometry nace en XY; al girarlo, el espesor pasa al eje Y.
      geometry.rotateX(Math.PI/2);
      geometry.computeVertexNormals();
      const visibleMaterial = material.clone ? material.clone() : material;
      visibleMaterial.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(geometry, visibleMaterial);
      mesh.position.set(x, y + thickness/2, z);
      mesh.castShadow = true; mesh.receiveShadow = true;
      model.add(mesh);
      return mesh;
    }
    function perforatedVerticalPanel(w, h, thickness, material, x=0, y=0, z=0, holes=[]) {
      const shape = new THREE.Shape();
      shape.moveTo(-w/2, -h/2); shape.lineTo(w/2, -h/2); shape.lineTo(w/2, h/2); shape.lineTo(-w/2, h/2); shape.closePath();
      holes.forEach(hole => {
        const path = new THREE.Path();
        path.absellipse(hole.x, hole.y, hole.r, hole.r, 0, Math.PI*2, false, 0);
        shape.holes.push(path);
      });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 10, steps: 1 });
      geometry.computeVertexNormals();
      const visibleMaterial = material.clone ? material.clone() : material;
      visibleMaterial.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(geometry, visibleMaterial);
      mesh.position.set(x, y, z-thickness/2);
      mesh.castShadow = true; mesh.receiveShadow = true;
      model.add(mesh);
      return mesh;
    }
    function panelWithOpenings(w, h, thickness, material, x=0, y=0, z=0, rectangles=[], circles=[]) {
      const shape = new THREE.Shape();
      shape.moveTo(-w/2, -h/2); shape.lineTo(w/2, -h/2); shape.lineTo(w/2, h/2); shape.lineTo(-w/2, h/2); shape.closePath();
      rectangles.forEach(opening => {
        const path = new THREE.Path();
        path.moveTo(opening.x-opening.w/2, opening.y-opening.h/2);
        path.lineTo(opening.x+opening.w/2, opening.y-opening.h/2);
        path.lineTo(opening.x+opening.w/2, opening.y+opening.h/2);
        path.lineTo(opening.x-opening.w/2, opening.y+opening.h/2);
        path.closePath();
        shape.holes.push(path);
      });
      circles.forEach(hole => {
        const path = new THREE.Path();
        path.absellipse(hole.x, hole.y, hole.r, hole.r, 0, Math.PI*2, false, 0);
        shape.holes.push(path);
      });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 10, steps: 1 });
      geometry.computeVertexNormals();
      const visibleMaterial = material.clone ? material.clone() : material;
      visibleMaterial.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(geometry, visibleMaterial);
      mesh.position.set(x, y, z-thickness/2);
      mesh.castShadow = true; mesh.receiveShadow = true;
      model.add(mesh);
      return mesh;
    }
    function cylinder(radius, height, material, x=0, y=0, z=0, rotateX=0, rotateZ=0) { const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 16), material); m.position.set(x,y,z); m.rotation.x = rotateX; m.rotation.z = rotateZ; m.castShadow = true; model.add(m); return m; }
    const motherboardSpecs = { 'Mini-ITX': { w: 170, h: 170, holes: [[-62,-62],[62,-62],[-62,62],[62,62]] }, 'mATX': { w: 244, h: 244, holes: [[-90,-90],[90,-90],[-90,90],[90,90],[-90,0],[90,0]] }, 'ATX': { w: 305, h: 244, holes: [[-112,-90],[112,-90],[-112,90],[112,90],[-112,0],[112,0],[0,90]] }, 'E-ATX': { w: 330, h: 305, holes: [[-125,-115],[125,-115],[-125,115],[125,115],[-125,0],[125,0],[0,115]] } };
    function addMotherboard(h, w, d) {
      const spec = motherboardSpecs[state.mbFormat];
      const scale = .82, boardH = spec.w * scale, boardD = spec.h * scale;
      // La placa está montada verticalmente en el plano YZ.
      // X es el espesor/anclaje contra la pared; Y es altura; Z es profundidad.
      const dividerX = chamberDividerX(w);
      const trayX = motherboardTrayX(w);
      const boardX = trayX - 7;
      const boardY = h * .66 + state.mbOffsetY * scale;
      // Z no es una coordenada absoluta: fija la holgura de montaje a 4 mm
      // desde la cara interior del panel trasero hacia el interior del gabinete.
      // Desplaza la placa 6 mm hacia el interior para que ningun borde
      // pueda salir por el panel trasero al cambiar su altura.
      const rearMountClearance = 10;
      const boardZ = -d/2 + rearMountClearance + boardD/2;
      // Bandeja vertical real detrás de la placa, pegada a la pared interna.
      // La bandeja queda contenida dentro del panel trasero: no debe
      // sobresalir por fuera ni moverse como un bloque oscuro al ajustar Y.
      box(4, boardH + 18, boardD + 8, mat.metal, trayX, boardY, boardZ);
      // La dimensión fina está en X: la cara visible queda paralela al plano YZ.
      box(6, boardH, boardD, mat.board, boardX + 7, boardY, boardZ);
      box(8, boardH * .22, boardD * .18, mat.copper, boardX + 14, boardY + boardH*.18, boardZ + boardD*.18);
      box(8, boardH * .55, boardD * .12, mat.inside, boardX + 14, boardY - boardH*.04, boardZ - boardD*.25);
      // Los separadores apuntan en X desde la bandeja hacia la placa.
      spec.holes.forEach(([hz, hy]) => cylinder(5, 12, mat.copper, trayX + 9, boardY + hy*scale, boardZ + hz*scale, 0));
      // Recorte de I/O en el panel trasero, alineado con el borde posterior de la placa.
      // Medida fija tomada del cuadro de referencia mATX para todas las placas.
      const rearCutW = 45 * scale;
      const rearCutH = motherboardSpecs.mATX.w * scale * .5;
      // Recorte I/O en plano XY, pegado al panel trasero y alineado con X.
      // Su centro queda siempre junto al borde superior de la placa.
      const cutoutX = boardX - 18;
      const cutoutTopY = boardY + boardH/2 - rearCutH/2 - 6;
    }
    function addFeet(w, d) {
      // Cuatro patas idénticas, bajas y centradas para mantener el mismo
      // lenguaje visual en todos los tamaños de chasis.
      const x = Math.max(20, w/2 - 24), z = Math.max(20, d/2 - 24);
      [[-x,-z],[x,-z],[-x,z],[x,z]].forEach(([px,pz])=>{
        cylinder(14, 12, mat.cutout, px, -10, pz);
        cylinder(9, 2, mat.edge, px, -3.2, pz);
      });
    }
    function addStorageVolumes(w, h, d) {
      // Volúmenes de referencia para fabricación: fuente, bahías de 3.5 y 2.5.
      // En cámara única se alojan en la zona inferior; en doble cámara pasan
      // detrás de la bandeja y quedan separados por el divisor estructural.
      const rear = state.doubleChamber, spec = psuSpec(), scale = .82;
      const psuW = Math.min(spec.width*scale, w-24), psuH = Math.min(spec.height*scale, h*.28), psuD = Math.min(spec.depth*scale, d-24);
      const storageX = rear ? w/2 - doubleChamberExtraMm()*.82/2 : w/2 - psuW/2 - 8;
      // La fuente se monta contra el panel posterior Z negativo, con 8 mm
      // de holgura para cableado y vibración.
      const storageZ = -d/2 + psuD/2 + 8;
      const storageY = rear ? h*.20 : psuH/2 + 10;
      // PSU visible como volumen técnico, sin usar el bloque negro de depuración.
      box(psuW, psuH, psuD, mat.radiator, storageX, storageY, storageZ);
      const driveW = Math.min(w*.17, 82), driveH = Math.min(h*.055, 34), driveD = Math.min(d*.30, 150);
      const driveX = rear ? w/2 - doubleChamberExtraMm()*.82/2 : storageX;
      const driveY = storageY;
      // Las bahías 3.5/2.5 también se reservan en la lógica, sin mallas negras
      // que distraigan de la estructura principal del gabinete.
      if(!rear) {
        const separatorY = storageSeparatorYScene();
        // Lámina perforada real: los huecos atraviesan todo el espesor y son
        // visibles desde sus dos caras al orbitar la cámara.
        const holeRadius = 3.6, holeStep = 12;
        const panelW = w-16, panelD = d-20;
        const xMin = -panelW/2 + 18, xMax = panelW/2 - 18;
        const zMin = -panelD/2 + 18, zMax = panelD/2 - 18;
        const holes = [];
        let row = 0;
        for(let z=zMin; z<=zMax; z+=holeStep, row++) {
          const stagger = row % 2 ? holeStep/2 : 0;
          for(let x=xMin+stagger; x<=xMax; x+=holeStep) {
            holes.push({x, z, r:holeRadius});
          }
        }
        perforatedPanel(panelW, 4, panelD, mat.edge, 0, separatorY, 0, holes);
      }
      // Hueco trasero de conexión y fijación de la fuente, alineado con su
      // volumen real y separado del recorte I/O de la placa.
    }
    const radiatorLengths = { '120 mm': 120, '240 mm': 240, '280 mm': 280, '360 mm': 360, '420 mm': 420 };
    function motherboardFits(format) {
      const spec=motherboardSpecs[format];
      return state.height >= spec.w + 30 && state.depth >= spec.h + 30 && effectiveChassisWidthMm() >= 180;
    }
    function radiatorProfileMax() {
      if (state.preset === 'Mini-ITX') return 240;
      if (state.preset === 'Micro-ATX') return 360;
      if (state.preset === 'Mid-Tower') return 360;
      if (state.preset === 'Full-Tower') return 420;
      return state.depth < 390 ? 120 : state.depth < 450 ? 240 : state.depth < 560 ? 360 : 420;
    }
    function radiatorFits(size, location) {
      const length=radiatorLengths[size], fanWidth=(size==='280 mm'||size==='420 mm'?140:120), margin=12;
      const verticalSpace=state.height-(!state.doubleChamber?storageSeparatorYScene()/.82:0)-margin;
      if (length > radiatorProfileMax()) return false;
      if (location==='Frontal') return length <= verticalSpace && fanWidth <= state.width-margin;
      if (location==='Lateral') {
        const spec=motherboardSpecs[state.mbFormat], lateralDepth=state.depth/2 - (-state.depth/2 + 4 + spec.h) - margin;
        return length <= verticalSpace && fanWidth <= lateralDepth;
      }
      return length <= state.depth-margin && fanWidth <= state.width-margin;
    }
    function fanFits(size, location, count=1) {
      const unit=Number(size.replace(' mm','')), gap=8, total=count*unit+(count-1)*gap, margin=12;
      const verticalSpace=state.height-(!state.doubleChamber?storageSeparatorYScene()/.82:0)-margin;
      if (location==='Frontal') return unit <= state.width-margin && total <= verticalSpace;
      if (location==='Superior'||location==='Inferior') return unit <= state.width-margin && total <= state.depth-margin;
      if (location==='Lateral') {
        const spec=motherboardSpecs[state.mbFormat], lateralDepth=state.depth/2 - (-state.depth/2 + 4 + spec.h) - margin;
        return total <= verticalSpace && unit <= lateralDepth;
      }
      return count===1 && unit <= state.width-margin && unit <= state.height-margin;
    }
    function maxFanCount(size, location) { let max=0, start=location==='Inferior'?2:1; for(let n=start;n<=6;n++) if(fanFits(size,location,n)) max=n; return max; }
    function rangeDisabled(min,max) { return Math.abs(max-min) < 0.5 ? 'disabled' : ''; }
    function coolingLimits(type, customSize=null, location=null, count=1) {
  const scale=.82, h=state.height*scale, w=effectiveChassisWidthScene(), d=state.depth*scale;
  // El radiador incluye el marco y los ventiladores asociados; deja una
  // holgura mayor para que ningún extremo pueda tocar o atravesar el panel.
  const margin=type==='radiator'?12:8;
      location=location || (type==='radiator'?state.radiatorLocation:null);
      const selectedSize=customSize || (type==='radiator'?state.radiatorSize:'120 mm');
      const unit=Number(selectedSize.replace(' mm',''))*scale;
      const radiatorFanWidth=(selectedSize==='280 mm'||selectedSize==='420 mm'?140:120)*scale;
  const fanTotal=unit*count+Math.max(0,count-1)*8;
  // Los ventiladores se apilan en el eje que corresponde a cada cara:
  // lateral: uno debajo de otro en Y, manteniendo una sola anchura en Z.
  // frontal: apilados en Y, con un espesor pequeño en Z.
  // superior/inferior: alineados en Z, con un espesor pequeño en Y.
  const xSize=type==='radiator'
    ? radiatorFanWidth
    : location==='Lateral' ? 12 : unit;
  const ySize=type==='radiator'
    ? radiatorLengths[selectedSize]*scale
    : (location==='Frontal'||location==='Lateral' ? fanTotal : 12);
  const zSize=type==='radiator'
    ? (location==='Lateral' ? radiatorFanWidth : radiatorLengths[selectedSize]*scale)
    : (location==='Superior'||location==='Inferior' ? fanTotal : location==='Lateral' ? unit : 12);
      const baseY=(location==='Frontal'||location==='Lateral')?h*.55:0;
      // Y empieza en la base del chasis (0), mientras X/Z están centrados.
      const limit={xMin:-w/2+xSize/2+margin,xMax:w/2-xSize/2-margin,yMin:margin+ySize/2-baseY,yMax:h-margin-ySize/2-baseY,zMin:-d/2+zSize/2+margin,zMax:d/2-zSize/2-margin};
      if(location==='Lateral') {
        const spec=motherboardSpecs[state.mbFormat], boardFrontZ=-d/2+4+spec.h*scale;
        limit.zMin=Math.max(limit.zMin,boardFrontZ+zSize/2+12);
        limit.zMax=Math.min(limit.zMax,d/2-zSize/2-margin);
      }
      // Reserva inferior para PSU y unidades cuando la cámara es única.
      // En doble cámara, la división X=.14w separa la zona trasera.
      if(!state.doubleChamber && (location==='Frontal'||location==='Lateral')) {
        const storageTop=storageSeparatorYScene();
        limit.yMin=Math.max(limit.yMin,storageTop+ySize/2+margin-baseY);
      }
      if(state.doubleChamber && (location==='Frontal'||location==='Superior'||location==='Inferior')) {
        const dividerX=chamberDividerX(w);
        // La cámara de PSU/discos está en X negativo; la refrigeración queda
        // confinada al lado principal, junto a la bandeja de la placa.
        limit.xMax=Math.min(limit.xMax,dividerX-xSize/2-margin);
      }
      if(location==='Inferior') {
        const psuD=Math.min(psuSpec().depth*scale,d-24);
        const sourceFront=-d/2+psuD+8;
        limit.zMin=Math.max(limit.zMin,sourceFront+zSize/2+margin);
      }
      ['x','y','z'].forEach(axis=>{const min=`${axis}Min`,max=`${axis}Max`;if(limit[min]>limit[max])limit[min]=limit[max]=(limit[min]+limit[max])/2;});
      return limit;
    }
    function normalizeCoolingSelections() {
      if (!motherboardFits(state.mbFormat)) { const valid=Object.keys(motherboardSpecs).find(motherboardFits); if(valid) state.mbFormat=valid; }
      if (state.radiatorEnabled && !radiatorFits(state.radiatorSize,state.radiatorLocation)) {
        const sameSizeLocation=['Superior','Frontal','Lateral'].find(pos=>!state.fanGroups[pos]?.enabled&&radiatorFits(state.radiatorSize,pos));
        if(sameSizeLocation) state.radiatorLocation=sameSizeLocation;
        else {
          const valid=Object.keys(radiatorLengths).reverse().find(size=>radiatorFits(size,state.radiatorLocation));
          if(valid) state.radiatorSize=valid;
          else { const fallback=Object.keys(radiatorLengths).reverse().find(size=>['Superior','Frontal','Lateral'].some(pos=>!state.fanGroups[pos]?.enabled&&radiatorFits(size,pos))); if(fallback){state.radiatorSize=fallback;state.radiatorLocation=['Superior','Frontal','Lateral'].find(pos=>!state.fanGroups[pos]?.enabled&&radiatorFits(fallback,pos));}else state.radiatorEnabled=false; }
        }
      }
      Object.entries(state.fanGroups||{}).forEach(([location,g])=>{const minCount=location==='Inferior'?2:1,max=maxFanCount(g.size,location);if(max<minCount)g.enabled=false;else g.count=Math.max(minCount,Math.min(g.count,max));});
    }
    function clampCoolingOffsets() {
      const rl=coolingLimits('radiator',state.radiatorSize,state.radiatorLocation); state.radiatorOffsetX=Math.max(rl.xMin,Math.min(rl.xMax,state.radiatorOffsetX||0)); state.radiatorOffsetY=Math.max(rl.yMin,Math.min(rl.yMax,state.radiatorOffsetY||0)); state.radiatorOffsetZ=Math.max(rl.zMin,Math.min(rl.zMax,state.radiatorOffsetZ||0));
      Object.entries(state.fanGroups||{}).forEach(([location,group])=>{const l=coolingLimits('fan',group.size,location,group.count);group.offsetX=Math.max(l.xMin,Math.min(l.xMax,group.offsetX||0));group.offsetY=Math.max(l.yMin,Math.min(l.yMax,group.offsetY||0));group.offsetZ=Math.max(l.zMin,Math.min(l.zMax,group.offsetZ||0));});
    }
    function addFanVisual(size, orientation, x, y, z, flowSign=1, preserveVisibleSide=false) {
      // Ventilador modular: marco, fondo negro, cinco aspas y flecha de flujo.
      // Se construye en XY y luego se orienta según la cara del gabinete.
      const s = Number(size.replace(' mm','')) * .82, depth = 12, frame = 7;
      const g = new THREE.Group();
      g.position.set(x, y, z);
      // Al invertir el flujo se cambia la cara del ventilador. La flecha usa
      // la misma rotación, por lo que conserva la dirección correcta.
      if (orientation === 'top') g.rotation.x = flowSign > 0 ? -Math.PI/2 : Math.PI/2;
      if (orientation === 'lateral') g.rotation.y = flowSign > 0 ? Math.PI/2 : -Math.PI/2;
      if (orientation === 'front' && flowSign < 0) g.rotation.y = Math.PI;
      model.add(g);

      const dark = new THREE.MeshStandardMaterial({color:0x080d17, metalness:.25, roughness:.5});
      const arrow = new THREE.MeshBasicMaterial({color:0x39d9ff});
      if (preserveVisibleSide) {
        dark.transparent=false; dark.opacity=1;
        mat.fan.transparent=false; mat.fan.opacity=1;
        arrow.transparent=false; arrow.opacity=1;
      }
      const add = (geometry, material, px=0, py=0, pz=0) => { const m=new THREE.Mesh(geometry,material); m.position.set(px,py,pz); m.castShadow=true; m.receiveShadow=true; m.renderOrder=4; m.depthTest=false; g.add(m); return m; };

      add(new THREE.BoxGeometry(s, frame, depth), dark, 0, -s/2+frame/2, 0);
      add(new THREE.BoxGeometry(s, frame, depth), dark, 0, s/2-frame/2, 0);
      add(new THREE.BoxGeometry(frame, s-2*frame, depth), dark, -s/2+frame/2, 0, 0);
      add(new THREE.BoxGeometry(frame, s-2*frame, depth), dark, s/2-frame/2, 0, 0);

      // Soportes radiales del motor: mantienen la estructura del ventilador
      // sin cerrar el área abierta por donde deben verse las aspas.
      for (let i=0; i<4; i++) {
        const support=add(new THREE.BoxGeometry(s-2*frame+2, 3, 2), dark, 0, 0, depth/2-1);
        support.rotation.z=i*Math.PI/2;
      }

      const hubRadius=s*.14, bladeRadius=s*.39;
      for (let i=0; i<5; i++) {
        const shape=new THREE.Shape();
        shape.moveTo(hubRadius*.55, -hubRadius*.18);
        shape.quadraticCurveTo(bladeRadius*.62, -bladeRadius*.34, bladeRadius, -bladeRadius*.08);
        shape.quadraticCurveTo(bladeRadius*.78, bladeRadius*.16, hubRadius*.7, hubRadius*.35);
        shape.lineTo(hubRadius*.55, -hubRadius*.18);
        const blade=new THREE.Mesh(new THREE.ShapeGeometry(shape), mat.fan);
        blade.rotation.z=i*Math.PI*2/5;
        blade.position.z=depth/2+1.5;
        blade.castShadow=true; blade.renderOrder=4; blade.depthTest=false; g.add(blade);
      }
      const hub=add(new THREE.CylinderGeometry(hubRadius, hubRadius*1.08, 5, 24), mat.fan, 0, 0, depth/2+3);
      hub.rotation.x=Math.PI/2;

      // Indicador 3D de dirección: la flecha sale por el eje normal del
      // ventilador (Z local), que luego se convierte en Z, Y o X según la cara.
      // Las flechas se colocan en la cara opuesta del ventilador; su sentido
      // sigue dependiendo de la rotación del conjunto.
      const arrowY = -s*.28, arrowZ = -depth/2-6;
      const shaft=add(new THREE.CylinderGeometry(1.5,1.5,s*.32,10), arrow, 0, arrowY, arrowZ);
      shaft.rotation.x=-Math.PI/2;
      const tip=add(new THREE.ConeGeometry(5,12,12), arrow, 0, arrowY, arrowZ-s*.17);
      tip.rotation.x=-Math.PI/2;
      return g;
    }
    function addFanAssembly(size, location, count, group={}) {
      const scale = .82, fan = Number(size.replace(' mm','')) * scale, gap = 8;
      const total = count * fan + (count-1) * gap;
      // Cara interior del panel frontal: el espesor del ventilador queda
      // completamente dentro, sin dejar una separación visual en Z.
      const anchorZ = location === 'Frontal' ? state.depth*scale/2 - 4 - 12/2 : location === 'Trasero' ? -state.depth*scale/2 + 28 : 0;
      const anchorX = location === 'Lateral' ? state.width*scale/2 - 28 : 0;
      const baseFlow = {Frontal:-1, Trasero:1, Superior:1, Inferior:1, Lateral:-1}[location] || 1;
      const flowSign = group.invert ? -baseFlow : baseFlow;
      for (let i=0; i<count; i++) {
        if (location === 'Superior' || location === 'Inferior') {
          const thickness = 12;
          const y = location === 'Superior'
            ? state.height*scale - 4 - thickness/2
            : (state.doubleChamber ? 4 + thickness/2 : storageSeparatorYScene() + thickness/2 + 3);
          const z = i * (fan + gap) - total/2 + fan/2 + (group.offsetZ || 0);
          const psuW=Math.min(psuSpec().width*scale,effectiveChassisWidthScene()-24);
          const mainRightX=state.doubleChamber ? chamberDividerX(effectiveChassisWidthScene()) : effectiveChassisWidthScene()/2;
          const inferiorX=mainRightX-fan/2-8;
      // En inferior el valor 0 conserva el anclaje seguro hacia X positivo;
      // al mover el control se permite desplazar el conjunto dentro del chasis.
      const fanX=location==='Inferior'
        ? (group.offsetX === 0 ? inferiorX : group.offsetX)
        : group.offsetX || 0;
          addFanVisual(size, 'top', fanX, y, z, flowSign);
        } else if (location === 'Trasero') {
          // Trasero: un solo ventilador junto al recorte I/O de la placa.
          const board = motherboardSpecs[state.mbFormat], boardH = board.w*scale, boardY = state.height*scale*.66 + state.mbOffsetY*scale;
          const trayX = motherboardTrayX(effectiveChassisWidthScene());
          const boardX = trayX - 7, cutoutX = boardX - 18, cutoutW = 45*scale;
          const cutoutH = motherboardSpecs.mATX.w*scale*.5, cutoutY = Math.min(state.height*scale - cutoutH/2 - 10, boardY + boardH/2 - cutoutH/2);
          const rearX = cutoutX - cutoutW/2 - fan/2 - 8, rearY = cutoutY, rearZ = -state.depth*scale/2 + 10;
          addFanVisual(size, 'front', rearX, rearY, rearZ, flowSign, true);
        } else if (location === 'Lateral') {
          const y = state.height*scale*.55 + (group.offsetY || 0) + i * (fan + gap) - total/2 + fan/2;
          const lateralLimits = coolingLimits('fan', size, 'Lateral', count);
          const z = Math.max(lateralLimits.zMin, Math.min(lateralLimits.zMax, group.offsetZ || 0));
          const lateralX = state.doubleChamber
            ? chamberDividerX(effectiveChassisWidthScene()) - 12/2 - 5
            : state.width*scale/2 - 12/2 - 5;
          addFanVisual(size, 'lateral', lateralX, y, z, flowSign);
        } else {
          // Frontal/trasero: X=ancho, Y=apilamiento vertical, Z=grosor.
          const y = state.height*scale*.55 + i * (fan + gap) - total/2 + fan/2 + (group.offsetY || 0);
          addFanVisual(size, 'front', group.offsetX || anchorX, y, anchorZ, flowSign);
        }
      }
    }
    function addRadiator(size, location) {
      const scale = .82, lengthZ = radiatorLengths[size] * scale, thicknessY = 18, fanGap = 0;
      // El radiador puede ser de 280/420 mm, pero sus ventiladores siguen
      // siendo unidades estándar de 120 o 140 mm, como los individuales.
      const fanOption = (size === '280 mm' || size === '420 mm') ? '140 mm' : '120 mm';
      // 420 mm usa 3 ventiladores de 140 mm; 280 mm usa 2 de 140 mm.
      // El conteo se deriva del ancho real para evitar que el conjunto
      // sobresalga del radiador y del chasis.
      const fanUnit = Number(fanOption.replace(' mm',''));
      const fans = Math.max(1, Math.round(radiatorLengths[size] / fanUnit));
      const fanSize = Number(fanOption.replace(' mm','')) * scale;
      const radiatorWidthX = fanSize;
      const baseFlow = location === 'Frontal' || location === 'Lateral' ? -1 : 1;
      const flowSign = state.radiatorInverted ? -baseFlow : baseFlow;
      const psuW=Math.min(psuSpec().width*scale,effectiveChassisWidthScene()-24);
      const mainRightX=state.doubleChamber ? chamberDividerX(effectiveChassisWidthScene()) : effectiveChassisWidthScene()/2;
      const inferiorX=mainRightX-radiatorWidthX/2-8;
      const x = location === 'Lateral' ? effectiveChassisWidthScene()/2-34 : location === 'Inferior' ? inferiorX : state.radiatorOffsetX || 0;
      // La cara interior de las láminas superior e inferior está a 4 mm del
      // centro del chasis. El centro del radiador se calcula usando su propio
      // grosor para que quede pegado sin invadir la lámina.
      const y = location === 'Superior'
        ? state.height*scale - 4 - thicknessY/2
        : location === 'Inferior'
          ? (state.doubleChamber ? 4 + thicknessY/2 : storageSeparatorYScene() + thicknessY/2 + 3)
          : state.height*scale*.55 + (state.radiatorOffsetY || 0);
      const frontThicknessZ = 18;
      const z = location === 'Frontal' ? state.depth*scale/2 - 4 - frontThicknessZ/2 : (state.radiatorOffsetZ || 0);
      if (location === 'Frontal') {
        // Frontal: X=ancho, Y=longitud del radiador, Z=grosor.
        const thicknessZ = frontThicknessZ, startY = -lengthZ/2 + fanSize/2;
        box(radiatorWidthX, lengthZ, thicknessZ, mat.radiator, x, y, z);
        for (let i=0; i<fans; i++) {
          const fanY = startY + i * (fanSize + fanGap);
          // El ventilador queda detrás del radiador, hacia el interior del chasis.
          addFanVisual(fanOption, 'front', x, y+fanY, z-thicknessZ/2-12/2-1, flowSign);
        }
      } else if (location === 'Lateral') {
        // Lateral: X=grosor, Y=longitud, Z=ancho; anclado a la pared lateral.
        const thicknessX = 18, startY = -lengthZ/2 + fanSize/2;
        const lateralY = y, lateralZ = state.radiatorOffsetZ;
        const lateralLimits = coolingLimits('radiator', size, 'Lateral');
        const safeZ = Math.max(lateralLimits.zMin, Math.min(lateralLimits.zMax, lateralZ));
        const wallX = state.doubleChamber
          ? chamberDividerX(effectiveChassisWidthScene()) - thicknessX/2 - 4
          : state.width*scale/2 - thicknessX/2 - 4;
        box(thicknessX, lengthZ, radiatorWidthX, mat.radiator, wallX, lateralY, safeZ);
        for (let i=0; i<fans; i++) {
          const fanY = startY + i * (fanSize + fanGap);
          // El ventilador queda por debajo/hacia dentro de la pared lateral,
          // sin sobresalir del chasis ni deformar su plano YZ.
          const fanX = state.doubleChamber
            ? wallX - thicknessX/2 - 12/2 - 3
            : wallX - thicknessX/2 - 12/2 - 3;
          addFanVisual(fanOption, 'lateral', fanX, lateralY+fanY, safeZ, flowSign);
        }
      } else {
        // Superior/inferior: X=ancho, Y=grosor, Z=longitud; ventiladores consecutivos en Z.
        const startZ = -lengthZ/2 + fanSize/2;
        box(radiatorWidthX, thicknessY, lengthZ, mat.radiator, x, y, z);
        for (let i=0; i<fans; i++) {
          const fanZ = startZ + i * (fanSize + fanGap);
          // El paquete de ventiladores va en la cara interior del radiador:
          // debajo en la parte superior y encima en la parte inferior.
          const fanY = location === 'Superior'
            ? y - thicknessY/2 - 12/2 - 3
            : y + thicknessY/2 + 12/2 + 3;
          addFanVisual(fanOption, 'top', x, fanY, z+fanZ, flowSign);
        }
      }
    }
    function addCooling() {
      syncCoolingConflicts();
      if (state.radiatorEnabled) addRadiator(state.radiatorSize, state.radiatorLocation);
      Object.entries(state.fanGroups).forEach(([location, group]) => { if (group.enabled && !(state.radiatorEnabled && state.radiatorLocation === location)) addFanAssembly(group.size, location, group.count, group); });
    }
    function syncCoolingConflicts() {
      if (!state.fanGroups) return;
      const occupiedByRadiator = state.radiatorEnabled ? state.radiatorLocation : null;
      if (occupiedByRadiator && state.fanGroups[occupiedByRadiator]) state.fanGroups[occupiedByRadiator].enabled = false;
      if (state.fanGroups.Trasero) state.fanGroups.Trasero.count = 1;
    }
    function rebuild() {
      normalizeCoolingSelections();
      clampMotherboardOffsets();
      clampCoolingOffsets();
      applyChassisAppearance();
      while (model.children.length) { const child = model.children.pop(); child.geometry?.dispose(); }
      const scale = .82, w = effectiveChassisWidthScene(), h = state.height * scale, d = state.depth * scale, t = 8;
      const mountingPanelMaterial = mat.metal;
      // La chapa trasera funciona como elemento de inspeccion en el visor:
      // no escribe profundidad y se dibuja por ambas caras para conservar
      // la lectura de sus huecos al orbitar incluso detras del vidrio.
      // La lamina trasera comparte el azul estructural de las laminas
      // perforadas superior e inferior, no el metal oscuro de la bandeja.
      const rearPanelMaterial = mat.edge.clone();
      rearPanelMaterial.transparent = false;
      // Igual acabado y opacidad que el resto de las piezas metálicas.
      rearPanelMaterial.opacity = 1;
      rearPanelMaterial.depthWrite = true;
      // Respeta la profundidad para que componentes internos cercanos
      // queden por delante de la lamina y no sean cubiertos visualmente.
      rearPanelMaterial.depthTest = true;
      rearPanelMaterial.side = THREE.DoubleSide;
      const dividerX = chamberDividerX(w);
      // El frente es la cubierta azul translúcida; la pared de montaje de la placa
      // permanece opaca para que no parezca un panel de vidrio invertido.
      // La tapa superior usa una lámina perforada real, igual que la división
      // inferior: los huecos atraviesan el espesor y se perciben desde ambas caras.
      const topHoles = [], topRadius = 3.6, topStep = 12;
      const topXMin = -w/2 + 18, topXMax = w/2 - 18;
      const topZMin = -d/2 + 18, topZMax = d/2 - 18;
      let topRow = 0;
      for(let z=topZMin; z<=topZMax; z+=topStep, topRow++) {
        const stagger = topRow % 2 ? topStep/2 : 0;
        for(let x=topXMin+stagger; x<=topXMax; x+=topStep) topHoles.push({x,z,r:topRadius});
      }
      perforatedPanel(w, t, d, mat.edge, 0, h, 0, topHoles);
      // La lamina inferior copia exactamente la reticula perforada superior.
      perforatedPanel(w, t, d, mat.edge, 0, 0, 0, topHoles);
      box(t, h, d, mat.glass, -w/2, h/2, 0); box(t, h, d, mountingPanelMaterial, w/2, h/2, 0);
      // La rejilla trasera permanece visible aunque el ventilador esté apagado,
      // igual que las perforaciones superior y divisora. El tamaño sigue la
      // selección guardada para Trasero y usa 120 mm como valor seguro inicial.
      const rearFan = state.fanGroups?.Trasero || {size:'120 mm'};
      {
        const rearFanSize = Number((rearFan.size || '120 mm').replace(' mm','')) * scale;
        const board = motherboardSpecs[state.mbFormat], boardH = board.w*scale, boardY = h*.66 + state.mbOffsetY*scale;
        const trayX = motherboardTrayX(w);
        const boardX = trayX - 7, cutoutX = boardX - 18, cutoutW = 45*scale;
        const cutoutH = motherboardSpecs.mATX.w*scale*.5, cutoutY = Math.min(h - cutoutH/2 - 10, boardY + boardH/2 - cutoutH/2);
        const rearX = cutoutX - cutoutW/2 - rearFanSize/2 - 8, rearY = cutoutY;
        const rearZ = -d/2;
        const rearOpenings = [];
        const expansionSlotOpenings = [];
        const grilleHoles = [], auxiliaryGrilleHoles = [], grilleRadius = 3.6, grilleStep = 12;
        // Recorte real del I/O de la placa base.
        rearOpenings.push({x:cutoutX, y:cutoutY-h/2, w:cutoutW, h:cutoutH});

        // Las ranuras PCI siempre pertenecen al conjunto trasero de la placa:
        // se centran con el recorte I/O y se apilan inmediatamente debajo.
        // No deben calcularse con el ancho total, porque al activar doble
        // cámara el panel crece y una posición fija las desplaza a la cámara
        // secundaria.
        // Siete ranuras PCIe traseras para GPU, Ethernet y otras tarjetas.
        // Se colocan debajo del I/O y se desplazan junto con la placa base.
        // Geometria de bracket ATX: siete slots con paso de 20.32 mm,
        // abertura larga y separacion minima entre cubiertas.
        const slotCount = state.mbFormat === 'Mini-ITX' ? 2 : state.mbFormat === 'mATX' ? 4 : 7;
        // Abertura PCI más contenida en X: conserva el inicio alineado con
        // el borde izquierdo del I/O y evita que el hueco se prolongue de
        // más hacia la cámara interior.
        const slotW = Math.min(92*scale, w*.46);
        const ioBottomLocal = cutoutY - h/2 - cutoutH/2;
        const separatorYWorld = state.doubleChamber ? 8 : storageSeparatorYScene();
        const panelSafeBottom = separatorYWorld - h/2 + 10;
        const desiredSlotTop = ioBottomLocal - 12*scale;
        // El tamaño físico del hueco no cambia entre chasis; solo cambia la
        // cantidad según el formato de la placa base.
        const slotPitch = 20.32*scale;
        const slotH = 18*scale;
        const slotGap = slotPitch - slotH;
        const slotStackH = slotCount*slotH + (slotCount-1)*slotGap;
        // Proporción PCI más realista y alineación exacta: el borde izquierdo
        // de cada slot coincide con el borde izquierdo del recorte I/O.
        // Desplazamiento conjunto hacia X negativa: el extremo positivo del
        // bloque queda a 20 mm de la pared positiva del panel trasero.
        const positiveClearanceX = 40*scale;
        const pciEndX = w/2 - positiveClearanceX;
        const pciStartX = pciEndX - slotW;
        const slotX = pciStartX + (pciEndX - pciStartX)/2;
        const boundedSlotW = pciEndX - pciStartX;
        // El primer PCI parte unos milímetros después del borde inferior de
        // la placa base, no del borde inferior del I/O. Si el conjunto de
        // siete slots necesita más altura, se limita al panel sin salirse.
        const panelSafeTop = panelSafeBottom + slotStackH;
        const slotStackTop = Math.max(panelSafeTop, Math.min(desiredSlotTop, h/2 - 10));
        const slotStartY = slotStackTop - slotStackH + slotH/2;
        const slotStackCenterY = slotStartY + (slotCount-1)*slotPitch/2;
        for(let i=0; i<slotCount; i++) {
          const slotY = slotStartY + i*(slotH + slotGap);
          // slotY ya está en coordenadas locales del panel trasero. Restar
          // h/2 aquí volvía a desplazar las PCI fuera de la chapa.
          const slot = {x:slotX, y:slotY, w:boundedSlotW, h:slotH};
          rearOpenings.push(slot);
          expansionSlotOpenings.push(slot);
        }

        const auxiliaryOpening = {
          x: slotX - slotW/2 - 10*scale - (20*scale)/2,
          // slotStackCenterY ya está expresado en coordenadas locales del
          // panel; no se vuelve a restar h/2.
          y: slotStackCenterY,
          w: 20*scale,
          h: Math.min(slotStackH, h*.42)
        };
        rearOpenings.push(auxiliaryOpening);

        // Reticula principal restaurada a su posicion original, junto al I/O.
        const fanGridSize = Math.min(rearFanSize, w-24*scale);
        const ventX = rearX, ventY = rearY-h/2;
        for(let gy=-fanGridSize/2+18; gy<=fanGridSize/2-18; gy+=grilleStep) {
          const row = Math.round((gy + fanGridSize/2 - 18) / grilleStep);
          const stagger = row % 2 ? grilleStep/2 : 0;
          for(let gx=-fanGridSize/2+18+stagger; gx<=fanGridSize/2-18; gx+=grilleStep) {
            grilleHoles.push({x:ventX+gx, y:ventY+gy, r:grilleRadius});
          }
        }

        // Segunda zona perforada junto a la ranura adicional, con la misma
        // altura y limitada al interior del panel trasero.
        const auxiliaryVentW = Math.min(48*scale, w*.24), auxiliaryVentH = auxiliaryOpening.h;
        const auxiliaryVentX = Math.max(-w/2 + auxiliaryVentW/2 + 10*scale, auxiliaryOpening.x - auxiliaryOpening.w/2 - 6*scale - auxiliaryVentW/2);
        const auxiliaryVentY = slotStackCenterY;
        const auxiliaryVentMargin = 8;
        for(let gy=-auxiliaryVentH/2+auxiliaryVentMargin; gy<=auxiliaryVentH/2-auxiliaryVentMargin; gy+=grilleStep) {
          const row = Math.round((gy + auxiliaryVentH/2 - auxiliaryVentMargin) / grilleStep);
          const stagger = row % 2 ? grilleStep/2 : 0;
          for(let gx=-auxiliaryVentW/2+auxiliaryVentMargin+stagger; gx<=auxiliaryVentW/2-auxiliaryVentMargin; gx+=grilleStep) {
            auxiliaryGrilleHoles.push({x:auxiliaryVentX+gx, y:auxiliaryVentY+gy, r:grilleRadius});
          }
        }

        // Recorte real de la fuente, alineado con su volumen interior.
        const psuSpecValue = psuSpec();
        const psuW = Math.min(psuSpecValue.width*scale, w-24);
        const psuH = Math.min(psuSpecValue.height*scale, h*.28);
        const psuX = state.doubleChamber ? w/2 - doubleChamberExtraMm()*.82/2 : w/2 - psuW/2 - 8;
        const psuY = state.doubleChamber ? h*.20 : psuH/2 + 10;
        // El recorte es siempre menor que la fuente: deja una pestaña
        // perimetral para apoyar y fijar la PSU con tornillos.
        const psuOpeningW = Math.max(12, Math.min(psuW - 8*scale, w-16));
        const psuOpeningH = Math.max(12, Math.min(psuH - 8*scale, h-16));
        const psuOpeningX = Math.max(-w/2 + psuOpeningW/2 + 8, Math.min(w/2 - psuOpeningW/2 - 8, psuX));
        const psuOpeningY = Math.max(psuOpeningH/2 + 8, Math.min(h - psuOpeningH/2 - 8, psuY));
        rearOpenings.push({x:psuOpeningX, y:psuOpeningY-h/2, w:psuOpeningW, h:psuOpeningH});
        // Material oscuro y opaco para conservar la lectura del panel detrás
        // del vidrio y desde la cara interior o exterior del gabinete.
        // Una unica pieza estructural con todas las aberturas atravesando el espesor.
        const rearPanelMesh = panelWithOpenings(w, h, t, rearPanelMaterial, 0, h/2, rearZ, rearOpenings, grilleHoles.concat(auxiliaryGrilleHoles));
        // La chapa debe verse, pero no debe proyectar una sombra triangular
        // sobre la placa, los slots o los ventiladores al orbitar la escena.
        rearPanelMesh.castShadow = false;
        rearPanelMesh.receiveShadow = false;

        // Sombreado interior de las aberturas: muestra los huecos sin crear
        // marcos de otro color ni una superficie que tape los componentes.
        if (false) {
        const openingShadowMaterial = mat.cutout.clone();
        openingShadowMaterial.transparent = true;
        openingShadowMaterial.opacity = .5;
        openingShadowMaterial.depthWrite = false;
        // Solo estas siluetas de los huecos se muestran por delante para
        // conservar su lectura; la lamina completa sigue respetando profundidad.
        // Los huecos se dibujan siempre para conservar I/O, PCI y rejilla.
        // El ventilador usa un renderOrder posterior y queda por encima.
        openingShadowMaterial.depthTest = false;
        openingShadowMaterial.side = THREE.DoubleSide;
        // El recorte I/O y el de la PSU permanecen como huecos físicos;
        // no se añade una placa oscura móvil sobre ellos.
        // Sombra visual del recorte I/O: acompana el desplazamiento vertical
        // de la placa y conserva la lectura del hueco desde el exterior.
        const ioOpening = rearOpenings[0];
        const ioShadow = new THREE.Mesh(new THREE.PlaneGeometry(ioOpening.w, ioOpening.h), openingShadowMaterial);
        ioShadow.position.set(ioOpening.x, h/2 + ioOpening.y, rearZ + t/2 + .5);
        ioShadow.renderOrder = 3;
        model.add(ioShadow);

        const auxiliaryShadow = new THREE.Mesh(new THREE.PlaneGeometry(auxiliaryOpening.w, auxiliaryOpening.h), openingShadowMaterial);
        auxiliaryShadow.position.set(auxiliaryOpening.x, h/2 + auxiliaryOpening.y, rearZ + t/2 + .5);
        auxiliaryShadow.renderOrder = 3;
        model.add(auxiliaryShadow);

        expansionSlotOpenings.forEach(slot => {
          const shadow = new THREE.Mesh(new THREE.PlaneGeometry(slot.w, slot.h), openingShadowMaterial);
          shadow.position.set(slot.x, h/2 + slot.y, rearZ + t/2 + .5);
          shadow.renderOrder = 3;
          model.add(shadow);
        });

        grilleHoles.forEach(hole => {
          const shadow = new THREE.Mesh(new THREE.CircleGeometry(hole.r, 16), openingShadowMaterial);
          shadow.position.set(hole.x, h/2 + hole.y, rearZ + t/2 + .5);
          shadow.renderOrder = 3;
          model.add(shadow);
        });
        auxiliaryGrilleHoles.forEach(hole => {
          const shadow = new THREE.Mesh(new THREE.CircleGeometry(hole.r, 16), openingShadowMaterial);
          shadow.position.set(hole.x, h/2 + hole.y, rearZ + t/2 + .5);
          shadow.renderOrder = 3;
          model.add(shadow);
        });
        }
      }
      box(w, h, t, mat.front, 0, h/2, d/2);
      addFeet(w, d);
      addStorageVolumes(w, h, d);
      if (state.doubleChamber) {
        box(4, h-20, d-20, mat.edge, dividerX, h/2, 0);
        // Cámara secundaria ampliada en X: la PSU queda totalmente contenida.
      }
      addMotherboard(h, w, d);
      addCooling();
      applyRenderMode();
      updateLabels();
    }
    function updateLabels() { document.getElementById('dimensionBadge').textContent = `${state.preset} · ${state.height} × ${effectiveChassisWidthMm()} × ${state.depth} mm`; document.getElementById('sceneStatus').textContent = `Placa ${state.mbFormat} · ${state.radiatorEnabled ? `Radiador ${state.radiatorSize}` : 'Sin radiador'} · ${state.doubleChamber ? 'Doble cámara activa' : 'Cámara única'}${state.renderMode ? ' · Render sólido' : ''}`; }
    function motherboardLimits() {
      const spec = motherboardSpecs[state.mbFormat], scale = .82;
      const h = state.height * scale, d = state.depth * scale;
      const boardH = spec.w * scale, baseY = h * .66;
      const margin = 12;
      const separatorY = !state.doubleChamber ? storageSeparatorYScene() : 0;
      const yMin = Math.ceil((Math.max(boardH/2 + margin, separatorY + boardH/2 + margin) - baseY) / scale);
      const yMax = Math.floor((h - margin - boardH/2 - baseY) / scale);
      return { yMin: Math.min(yMin, yMax), yMax: Math.max(yMin, yMax) };
    }
    function clampMotherboardOffsets() {
      const limits = motherboardLimits();
      state.mbOffsetY = Math.max(limits.yMin, Math.min(limits.yMax, state.mbOffsetY));
    }
    function chassisContextCard() { return `<div class="rounded-xl border border-cyan/30 bg-cyan/5 px-3 py-3"><div class="text-[10px] uppercase tracking-wider text-cyan">Chasis activo</div><div class="mt-1 text-sm font-semibold text-ink">${state.preset}</div><div class="mt-1 text-[11px] text-muted">${state.height} × ${effectiveChassisWidthMm()} × ${state.depth} mm · ${state.doubleChamber?'Doble cámara':'Cámara única'}</div></div>`; }
    function psuSelectorCard() { return `<div class="rounded-xl border border-line bg-slate-950/20 p-3"><div class="text-xs text-ink font-medium">Compartimiento de fuente</div><div class="text-[10px] text-muted mt-1">Reserva espacio para PSU y discos; el separador inferior mantiene libre la cámara principal.</div><label class="block text-[11px] text-muted mt-3">Formato de fuente<select id="psuType" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm">${Object.entries(psuSpecs).map(([key,spec])=>`<option value="${key}">${spec.label}</option>`).join('')}</select></label><div class="text-[10px] text-muted mt-2">${psuSpec().width} × ${psuSpec().height} × ${psuSpec().depth} mm · ATX/SFX/TFX/Flex ATX</div></div>`; }
    function renderCoolingControls() {
      normalizeCoolingSelections();
      syncCoolingConflicts();
      clampCoolingOffsets();
      const positions = ['Frontal','Trasero','Superior','Inferior','Lateral'];
      const radiatorOptions = ['Superior','Frontal','Lateral'].map(pos=>{const occupied=state.fanGroups[pos]?.enabled, fits=Object.keys(radiatorLengths).some(size=>radiatorFits(size,pos));return `<option value="${pos}" ${(occupied||!fits)?'disabled':''}>${pos}${occupied?' (ocupado)':!fits?' (sin espacio)':''}</option>`;}).join('');
      const radiatorSizeOptions = Object.keys(radiatorLengths).map(size=>{const validLocations=['Superior','Frontal','Lateral'].filter(pos=>radiatorFits(size,pos));return `<option ${validLocations.length?'':'disabled'}>${size}${validLocations.length?'':' · no cabe'}</option>`;}).join('');
      const unavailableLargeRadiators = ['360 mm','420 mm'].filter(size=>!['Superior','Frontal','Lateral'].some(pos=>radiatorFits(size,pos)));
      const radiatorWarning = unavailableLargeRadiators.length ? `<div class="rounded-lg border border-amber-400/40 bg-amber-300/10 px-3 py-2 text-[11px] text-amber-200">Aviso: ${unavailableLargeRadiators.join(' y ')} no caben en este chasis con la configuración actual. Las opciones incompatibles están desactivadas.</div>` : '';
      const fanSizeOptions = pos => ['120 mm','140 mm'].map(size=>`<option ${fanFits(size,pos,1)?'':'disabled'}>${size}${fanFits(size,pos,1)?'':' · no cabe'}</option>`).join('');
      const radiatorLimits = coolingLimits('radiator',null,state.radiatorLocation);
      const radiatorAxes = state.radiatorLocation === 'Frontal' ? ['X','Y'] : state.radiatorLocation === 'Lateral' ? ['Y','Z'] : state.radiatorLocation === 'Inferior' ? ['Z'] : ['X','Z'];
      const radiatorPositionControls = `<div class="mt-3 border-t border-line pt-3"><div class="text-[11px] text-muted mb-2">Posición dentro del chasis · ${state.radiatorLocation}</div>${radiatorAxes.map(axis=>{const key=`radiatorOffset${axis}`,min=axis==='X'?radiatorLimits.xMin:axis==='Y'?radiatorLimits.yMin:radiatorLimits.zMin,max=axis==='X'?radiatorLimits.xMax:axis==='Y'?radiatorLimits.yMax:radiatorLimits.zMax;return `<label class="block text-[11px] text-muted mt-2">Desplazamiento ${axis} <output id="${key}Value" class="float-right text-ink">${state[key].toFixed(0)} mm</output><input id="${key}" type="range" min="${min.toFixed(0)}" max="${max.toFixed(0)}" value="${state[key].toFixed(0)}" ${rangeDisabled(min,max)} class="mt-2 w-full accent-cyan"></label>`;}).join('')}</div>`;
      const radiatorLateral = state.radiatorLocation === 'Lateral' ? `<div class="mt-3 border-t border-line pt-3"><div class="text-[11px] text-muted mb-2">Posición lateral limitada por placa y chasis</div><label class="block text-[11px] text-muted">Altura Y <output id="radiatorOffsetYValue" class="float-right text-ink">${state.radiatorOffsetY.toFixed(0)} mm</output><input id="radiatorOffsetY" type="range" min="${radiatorLimits.yMin.toFixed(0)}" max="${radiatorLimits.yMax.toFixed(0)}" value="${state.radiatorOffsetY.toFixed(0)}" class="mt-2 w-full accent-cyan"></label><label class="block text-[11px] text-muted mt-3">Profundidad Z <output id="radiatorOffsetZValue" class="float-right text-ink">${state.radiatorOffsetZ.toFixed(0)} mm</output><input id="radiatorOffsetZ" type="range" min="${radiatorLimits.zMin.toFixed(0)}" max="${radiatorLimits.zMax.toFixed(0)}" value="${state.radiatorOffsetZ.toFixed(0)}" class="mt-2 w-full accent-cyan"></label></div>` : '';
      const fanCards = positions.map(pos=>{ const g=state.fanGroups[pos]; const occupied=state.radiatorEnabled && state.radiatorLocation===pos; const limits=coolingLimits('fan',g.size,pos,g.count); const axes=pos==='Frontal'?['X','Y']:pos==='Lateral'?['Y','Z']:(pos==='Superior'||pos==='Inferior'?['X','Z']:[]); const positionControls=g.enabled&&axes.length?`<div class="mt-3 border-t border-line pt-3"><div class="text-[11px] text-muted mb-2">Posición dentro del chasis · ${pos}</div>${axes.map(axis=>{const key=axis==='X'?'offsetX':axis==='Y'?'offsetY':'offsetZ',min=axis==='X'?limits.xMin:axis==='Y'?limits.yMin:limits.zMin,max=axis==='X'?limits.xMax:axis==='Y'?limits.yMax:limits.zMax;return `<label class="block text-[11px] text-muted mt-2">Desplazamiento ${axis} <output id="fan-${pos.toLowerCase()}-${axis.toLowerCase()}-value" class="float-right text-ink">${g[key].toFixed(0)} mm</output><input data-fan-offset="${pos}:${axis}" type="range" min="${min.toFixed(0)}" max="${max.toFixed(0)}" value="${g[key].toFixed(0)}" ${rangeDisabled(min,max)} class="mt-2 w-full accent-cyan"></label>`;}).join('')}</div>`:''; return `<details class="rounded-xl border border-line bg-slate-950/20 p-3" ${g.enabled?'open':''}><summary class="cursor-pointer list-none flex items-center justify-between text-xs text-ink"><span>${pos} ${occupied?'· ocupado por radiador':''}</span><input data-fan-enabled="${pos}" type="checkbox" class="accent-cyan h-4 w-4" ${g.enabled?'checked':''} ${occupied?'disabled':''}></summary><div class="pt-3"><div class="grid grid-cols-2 gap-2"><label class="text-[11px] text-muted">Tamaño<select data-fan-size="${pos}" class="control mt-1 w-full rounded-lg px-2 py-2 text-sm"><option>120 mm</option><option>140 mm</option></select></label><label class="text-[11px] text-muted">Cantidad<input data-fan-count="${pos}" type="number" min="${pos==='Inferior'?2:1}" max="${pos==='Trasero'?1:6}" class="control mt-1 w-full rounded-lg px-2 py-2 text-sm" value="${g.count}"></label></div><label class="mt-3 flex items-center justify-between rounded-lg border border-line bg-slate-950/30 px-3 py-2 text-[11px] text-muted"><span>Invertir dirección</span><input data-fan-invert="${pos}" type="checkbox" class="accent-cyan h-4 w-4" ${g.invert?'checked':''}></label>${positionControls}</div></details>`; }).join('');
      controlsEl.innerHTML=`<div class="space-y-3"><details class="rounded-xl border border-line bg-slate-950/20 p-3" open><summary class="cursor-pointer list-none flex items-center justify-between text-xs text-ink"><span>Refrigeración líquida</span><input id="radiatorEnabled" type="checkbox" class="accent-cyan h-4 w-4" ${state.radiatorEnabled?'checked':''}></summary><div class="pt-3"><label class="text-[11px] text-muted">Tamaño<select id="radiatorSize" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm">${radiatorSizeOptions}</select></label><label class="block text-[11px] text-muted mt-3">Ubicación<select id="radiatorLocation" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm">${radiatorOptions}</select></label><label class="mt-3 flex items-center justify-between rounded-lg border border-line bg-slate-950/30 px-3 py-2 text-[11px] text-muted"><span>Invertir dirección</span><input id="radiatorInverted" type="checkbox" class="accent-cyan h-4 w-4" ${state.radiatorInverted?'checked':''}></label>${radiatorPositionControls}</div></details><details class="rounded-xl border border-line bg-slate-950/20 p-3" open><summary class="cursor-pointer list-none text-xs text-ink">Ventiladores individuales</summary><div class="pt-3 space-y-3">${fanCards}<button id="addFanGroup" class="w-full rounded-lg border border-cyan bg-cyan/10 px-3 py-3 text-xs font-semibold text-cyan hover:bg-cyan/20">+ Agregar ventiladores</button></div></details></div>`;
      controlsEl.insertAdjacentHTML('afterbegin', chassisContextCard());
      if(state.radiatorLocation==='Inferior') document.getElementById('radiatorOffsetX')?.closest('label')?.remove();
      const radiatorPanel= document.getElementById('radiatorEnabled')?.closest('details');
      if(radiatorPanel && radiatorWarning) radiatorPanel.querySelector('div.pt-3')?.insertAdjacentHTML('afterbegin', radiatorWarning);
      const radiatorBody= radiatorPanel?.querySelector('div.pt-3');
      if(radiatorBody && !state.radiatorEnabled) radiatorBody.classList.add('hidden');
      document.querySelectorAll('[data-fan-size]').forEach(el=>Array.from(el.options).forEach(opt=>{const required=el.dataset.fanSize==='Inferior'?2:1;opt.disabled=!fanFits(opt.value,el.dataset.fanSize,required);}));
      document.querySelectorAll('[data-fan-count]').forEach(el=>{const pos=el.dataset.fanCount,g=state.fanGroups[pos],minCount=pos==='Inferior'?2:1,max=maxFanCount(g.size,pos);el.max=String(Math.max(minCount,max));el.value=String(Math.max(minCount,Math.min(g.count,Math.max(minCount,max))));});
      document.getElementById('radiatorSize').value=state.radiatorSize; document.getElementById('radiatorLocation').value=state.radiatorLocation;
      document.getElementById('radiatorEnabled').onchange=e=>{state.radiatorEnabled=e.target.checked;renderCoolingControls();rebuild();};
      document.getElementById('radiatorInverted').onchange=e=>{state.radiatorInverted=e.target.checked;rebuild();};
      document.getElementById('radiatorSize').onchange=e=>{state.radiatorSize=e.target.value;if(!radiatorFits(state.radiatorSize,state.radiatorLocation)){const next=['Superior','Frontal','Lateral'].find(pos=>!state.fanGroups[pos]?.enabled&&radiatorFits(state.radiatorSize,pos));if(next)state.radiatorLocation=next;}clampCoolingOffsets();renderCoolingControls();rebuild();};
      document.getElementById('radiatorLocation').onchange=e=>{state.radiatorLocation=e.target.value;syncCoolingConflicts();clampCoolingOffsets();renderCoolingControls();rebuild();};
      document.querySelectorAll('[data-fan-enabled]').forEach(el=>el.onchange=()=>{state.fanGroups[el.dataset.fanEnabled].enabled=el.checked;syncCoolingConflicts();renderCoolingControls();rebuild();});
      document.querySelectorAll('[data-fan-invert]').forEach(el=>el.onchange=()=>{state.fanGroups[el.dataset.fanInvert].invert=el.checked;rebuild();});
      document.querySelectorAll('[data-fan-size]').forEach(el=>{el.value=state.fanGroups[el.dataset.fanSize].size;el.onchange=()=>{state.fanGroups[el.dataset.fanSize].size=el.value;clampCoolingOffsets();renderCoolingControls();rebuild();};});
      document.querySelectorAll('[data-fan-count]').forEach(el=>el.oninput=()=>{const g=state.fanGroups[el.dataset.fanCount],minCount=el.dataset.fanCount==='Inferior'?2:1;g.count=Math.max(minCount,Math.min(6,Number(el.value)||minCount));normalizeCoolingSelections();clampCoolingOffsets();renderCoolingControls();rebuild();});
      document.querySelectorAll('[data-fan-offset]').forEach(el=>el.oninput=()=>{const [pos,axis]=el.dataset.fanOffset.split(':');const g=state.fanGroups[pos];const key=axis==='X'?'offsetX':axis==='Y'?'offsetY':'offsetZ';g[key]=Number(el.value)||0;clampCoolingOffsets();document.getElementById(`fan-${pos.toLowerCase()}-${axis.toLowerCase()}-value`).textContent=`${g[key].toFixed(0)} mm`;rebuild();});
      ['radiatorOffsetX','radiatorOffsetY','radiatorOffsetZ'].forEach(id=>{const el=document.getElementById(id);if(el)el.oninput=()=>{state[id]=Number(el.value)||0;clampCoolingOffsets();document.getElementById(`${id}Value`).textContent=`${state[id].toFixed(0)} mm`;rebuild();};});
      const addFanButton=document.getElementById('addFanGroup'); if(addFanButton) addFanButton.onclick=()=>{const next=positions.find(pos=>!state.fanGroups[pos].enabled && !(state.radiatorEnabled&&state.radiatorLocation===pos));if(next){state.fanGroups[next].enabled=true;renderCoolingControls();rebuild();}};
    }
    function chassisCustomizationControls() {
      const palette = [['#171b22','Negro mate'],['#f1f5f9','Blanco ártico'],['#687381','Gris titanio'],['#1d668f','Azul metálico'],['#9f2432','Rojo crimson']];
      const textures = [['none','Liso'],['brushed','Aluminio cepillado'],['mesh','Rejilla metálica'],['carbon','Fibra de carbono'],['wood','Madera'],['geometric','Patrón geométrico']];
      return `<details class="rounded-xl border border-cyan/30 bg-cyan/5 p-3" open><summary class="cursor-pointer list-none flex items-center justify-between text-xs text-ink"><span>Personalización de chasis</span><span class="text-[10px] text-cyan">En tiempo real</span></summary><div class="pt-4 space-y-4"><div><div class="text-[11px] text-muted mb-2">Pintura general</div><div class="grid grid-cols-5 gap-2">${palette.map(([color,label])=>`<button type="button" title="${label}" data-paint-preset="${color}" class="h-7 rounded-md border ${state.paintColor.toLowerCase()===color?'border-white ring-2 ring-cyan':'border-line'}" style="background:${color}"></button>`).join('')}</div><label class="block text-[11px] text-muted mt-3">Color personalizado<div class="flex gap-2 mt-1"><input id="paintColor" type="color" value="${state.paintColor}" class="h-9 w-12 rounded cursor-pointer bg-transparent"><span class="control flex-1 rounded-lg px-3 py-2 text-xs text-ink">${state.paintColor.toUpperCase()}</span></div></label><label class="block text-[11px] text-muted mt-3">Acabado<select id="paintFinish" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm"><option value="matte" ${state.paintFinish==='matte'?'selected':''}>Mate · alta rugosidad</option><option value="satin" ${state.paintFinish==='satin'?'selected':''}>Satinado · equilibrado</option><option value="gloss" ${state.paintFinish==='gloss'?'selected':''}>Brillante · baja rugosidad</option></select></label></div><div><div class="text-[11px] text-muted mb-2">Textura del panel frontal exterior</div><div class="grid grid-cols-2 gap-2">${textures.map(([value,label])=>`<button type="button" data-front-texture="${value}" class="rounded-lg border px-2 py-2 text-left text-[11px] ${state.frontTexture===value?'border-cyan bg-cyan/10 text-ink':'border-line text-muted'}">${label}</button>`).join('')}</div><label class="block text-[11px] text-muted mt-3">Cargar textura propia<input id="frontTextureFile" type="file" accept="image/*" class="control mt-1 w-full rounded-lg px-2 py-2 text-[11px]"></label><div id="frontTextureStatus" class="text-[10px] text-muted mt-2">${state.frontTextureName || 'Se aplica sobre el panel frontal mediante map y roughnessMap.'}</div></div><div><div class="text-[11px] text-muted mb-2">Panel lateral opuesto a la placa base</div><div class="grid grid-cols-2 gap-2"><label class="rounded-lg border px-3 py-2 text-[11px] ${state.glassStyle==='clear'?'border-cyan bg-cyan/10 text-ink':'border-line text-muted'}"><input type="radio" name="glassStyle" value="clear" class="mr-2 accent-cyan" ${state.glassStyle==='clear'?'checked':''}>Vidrio claro</label><label class="rounded-lg border px-3 py-2 text-[11px] ${state.glassStyle==='dark'?'border-cyan bg-cyan/10 text-ink':'border-line text-muted'}"><input type="radio" name="glassStyle" value="dark" class="mr-2 accent-cyan" ${state.glassStyle==='dark'?'checked':''}>Vidrio oscuro</label></div><div class="text-[10px] text-muted mt-2">El vidrio oscuro reduce la transmisión y aplica un tinte azul ahumado.</div></div></div></details>`;
    }
    function bindChassisCustomization() {
      document.querySelectorAll('[data-paint-preset]').forEach(el=>el.onclick=()=>{state.paintColor=el.dataset.paintPreset;renderControls('panels');rebuild();});
      const color=document.getElementById('paintColor'); if(color) color.oninput=e=>{state.paintColor=e.target.value;rebuild();};
      const finish=document.getElementById('paintFinish'); if(finish) finish.onchange=e=>{state.paintFinish=e.target.value;rebuild();};
      document.querySelectorAll('[data-front-texture]').forEach(el=>el.onclick=()=>{state.frontTexture=el.dataset.frontTexture;state.frontTextureName='';renderControls('panels');rebuild();});
      const file=document.getElementById('frontTextureFile'); if(file) file.onchange=e=>{const selected=e.target.files?.[0];if(!selected)return;const url=URL.createObjectURL(selected), image=new Image();image.onload=()=>{state.frontTexture='custom';state.frontTextureName=selected.name;setFrontTexture('custom',image);URL.revokeObjectURL(url);renderControls('panels');rebuild();};image.src=url;};
      document.querySelectorAll('input[name="glassStyle"]').forEach(el=>el.onchange=()=>{state.glassStyle=el.value;renderControls('panels');rebuild();});
    }
    function renderControls(tab='dimensions') {
      if (tab === 'cooling') { renderCoolingControls(); return; }
      const common = `<div class="space-y-5"><div><label class="text-xs text-muted">Tamaño predefinido</label><select id="preset" class="control mt-2 w-full rounded-lg px-3 py-2 text-sm"><option>Mini-ITX</option><option>Micro-ATX</option><option>Mid-Tower</option><option>Full-Tower</option><option>Personalizado</option></select></div><div class="grid grid-cols-3 gap-2">${[['height','Alto'],['width','Ancho'],['depth','Fondo']].map(([key,label])=>`<label class="text-[11px] text-muted">${label}<input id="${key}" type="number" min="100" class="control mt-1 w-full rounded-lg px-2 py-2 text-sm text-ink" value="${state[key]}"><span class="text-[10px]">mm</span></label>`).join('')}</div><label class="flex items-center justify-between rounded-lg border border-line bg-slate-950/20 p-3"><span><span class="block text-xs text-ink">Doble cámara</span><span class="block text-[10px] text-muted mt-1">Separa PSU y almacenamiento</span></span><input id="doubleChamber" type="checkbox" class="accent-cyan h-4 w-4" ${state.doubleChamber?'checked':''}></label></div>`;
      const panels = `<div class="space-y-5"><div><label class="text-xs text-muted">Material de paneles exteriores</label><div class="mt-2 space-y-2">${['Metal perforado','Vidrio templado','Panel de madera'].map(x=>`<button data-material="${x}" class="material-btn w-full rounded-lg border px-3 py-3 text-left text-xs ${state.material===x?'border-cyan bg-cyan/10 text-ink':'border-line text-muted'}">${x}<span class="block text-[10px] mt-1 opacity-70">${x==='Vidrio templado'?'Transparencia 40%':'Acabado de prototipo'}</span></button>`).join('')}</div></div>${chassisCustomizationControls()}</div>`;
      const limits = motherboardLimits();
      const motherboard = `<div class="space-y-5"><div><label class="text-xs text-muted">Factor de forma</label><select id="mbFormat" class="control mt-2 w-full rounded-lg px-3 py-2 text-sm"><option>Mini-ITX</option><option>mATX</option><option>ATX</option><option>E-ATX</option></select><div class="text-[10px] text-muted mt-2">Genera automáticamente el área de placa, separadores y recortes I/O.</div></div><div><div class="flex items-center justify-between"><label class="text-xs text-muted">Altura de la placa</label><button id="centerMotherboard" class="text-[10px] text-cyan hover:text-ink">Centrar Y</button></div><div class="mt-3"><label class="block text-[11px] text-muted">Altura Y <output id="mbOffsetYValue" class="float-right text-ink">${state.mbOffsetY} mm</output><input id="mbOffsetY" type="range" min="${limits.yMin}" max="${limits.yMax}" step="1" class="mt-2 w-full accent-cyan" value="${state.mbOffsetY}"></label></div><div class="text-[10px] text-muted mt-2">Z fijo: borde posterior a 4 mm del panel trasero.</div></div><div class="rounded-xl border border-line bg-slate-950/20 p-3"><div class="text-xs text-ink font-medium">Elementos generados</div><div class="mt-3 space-y-2 text-[11px] text-muted"><div class="flex justify-between"><span>Separadores</span><span class="text-copper text-amber-300">Patrón compatible</span></div><div class="flex justify-between"><span>Recorte I/O · plano XY</span><span class="text-amber-300">Activo</span></div><div class="flex justify-between"><span>Ranuras de expansión</span><span class="text-amber-300">Visualizadas</span></div></div></div></div>`;
      const placeholder = `<div class="rounded-xl border border-dashed border-line p-5 text-center"><div class="text-2xl mb-3">◉</div><div class="text-sm text-ink">Módulo en la siguiente entrega</div><div class="text-xs text-muted mt-2">La arquitectura del panel ya está preparada para añadir componentes interactivos.</div></div>`;
      const radiatorLocationOptions = ['Superior','Frontal','Lateral'].map(pos=>`<option value="${pos}" ${state.fanEnabled && state.fanLocation === pos ? 'disabled' : ''}>${pos}${state.fanEnabled && state.fanLocation === pos ? ' (ocupado)' : ''}</option>`).join('');
      const fanLocationOptions = ['Frontal','Trasero','Superior','Inferior','Lateral'].map(pos=>`<option value="${pos}" ${state.radiatorEnabled && state.radiatorLocation === pos ? 'disabled' : ''}>${pos}${state.radiatorEnabled && state.radiatorLocation === pos ? ' (ocupado)' : ''}</option>`).join('');
      const radiatorLateralLimits = coolingLimits('radiator'), fanLateralLimits = coolingLimits('fan');
      const radiatorLateralControls = state.radiatorLocation === 'Lateral' ? `<div class="mt-3 border-t border-line pt-3"><div class="text-[11px] text-muted mb-2">Posición lateral · espacio libre junto a la placa</div><label class="block text-[11px] text-muted">Altura Y <output id="radiatorOffsetYValue" class="float-right text-ink">${state.radiatorOffsetY} mm</output><input id="radiatorOffsetY" type="range" min="${radiatorLateralLimits.yMin}" max="${radiatorLateralLimits.yMax}" value="${state.radiatorOffsetY}" class="mt-2 w-full accent-cyan"></label><label class="block text-[11px] text-muted mt-3">Profundidad Z <output id="radiatorOffsetZValue" class="float-right text-ink">${state.radiatorOffsetZ} mm</output><input id="radiatorOffsetZ" type="range" min="${radiatorLateralLimits.zMin}" max="${radiatorLateralLimits.zMax}" value="${state.radiatorOffsetZ}" class="mt-2 w-full accent-cyan"></label></div>` : '';
      const fanLateralControls = state.fanLocation === 'Lateral' ? `<div class="mt-3 border-t border-line pt-3"><div class="text-[11px] text-muted mb-2">Posición lateral · espacio libre junto a la placa</div><label class="block text-[11px] text-muted">Altura Y <output id="fanOffsetYValue" class="float-right text-ink">${state.fanOffsetY} mm</output><input id="fanOffsetY" type="range" min="${fanLateralLimits.yMin}" max="${fanLateralLimits.yMax}" value="${state.fanOffsetY}" class="mt-2 w-full accent-cyan"></label><label class="block text-[11px] text-muted mt-3">Profundidad Z <output id="fanOffsetZValue" class="float-right text-ink">${state.fanOffsetZ} mm</output><input id="fanOffsetZ" type="range" min="${fanLateralLimits.zMin}" max="${fanLateralLimits.zMax}" value="${state.fanOffsetZ}" class="mt-2 w-full accent-cyan"></label></div>` : '';
      const cooling = `<div class="space-y-5"><div class="rounded-xl border border-line bg-slate-950/20 p-3"><label class="flex items-center justify-between text-xs text-ink"><span>Activar radiador</span><input id="radiatorEnabled" type="checkbox" class="accent-cyan h-4 w-4" ${state.radiatorEnabled?'checked':''}></label><div class="mt-3"><label class="text-[11px] text-muted">Tamaño</label><select id="radiatorSize" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm">${Object.keys(radiatorLengths).map(x=>`<option>${x}</option>`).join('')}</select></div><div class="mt-3"><label class="text-[11px] text-muted">Ubicación</label><select id="radiatorLocation" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm">${radiatorLocationOptions}</select></div>${radiatorLateralControls}</div><div class="rounded-xl border border-line bg-slate-950/20 p-3"><label class="flex items-center justify-between text-xs text-ink"><span>Ventiladores individuales</span><input id="fanEnabled" type="checkbox" class="accent-cyan h-4 w-4" ${state.fanEnabled?'checked':''}></label><div class="grid grid-cols-2 gap-2 mt-3"><label class="text-[11px] text-muted">Tamaño<select id="fanSize" class="control mt-1 w-full rounded-lg px-2 py-2 text-sm"><option>120 mm</option><option>140 mm</option></select></label><label class="text-[11px] text-muted">Cantidad<input id="fanCount" type="number" min="1" max="6" class="control mt-1 w-full rounded-lg px-2 py-2 text-sm" value="${state.fanCount}"></label></div><div class="mt-3"><label class="text-[11px] text-muted">Ranura</label><select id="fanLocation" class="control mt-1 w-full rounded-lg px-3 py-2 text-sm">${fanLocationOptions}</select></div>${fanLateralControls}<div class="text-[10px] text-muted mt-3">Las posiciones ocupadas se deshabilitan automáticamente.</div></div></div>`;
      controlsEl.innerHTML = chassisContextCard() + (tab === 'dimensions' ? common : tab === 'panels' ? panels : tab === 'motherboard' ? motherboard : tab === 'cooling' ? cooling : placeholder);
      document.querySelectorAll('#preset option').forEach(option=>{if(option.textContent.trim()==='Full-Tower') option.remove();});
      if(tab==='dimensions') controlsEl.insertAdjacentHTML('beforeend', psuSelectorCard());
      const mbSelect=document.getElementById('mbFormat'); if(mbSelect) Array.from(mbSelect.options).forEach(opt=>{opt.disabled=!motherboardFits(opt.value);});
      if (tab === 'dimensions') { document.getElementById('preset').value = state.preset; document.getElementById('preset').onchange = e => { state.preset=e.target.value; const p={ 'Mini-ITX':[300,220,360], 'Micro-ATX':[390,225,420], 'Mid-Tower':[450,220,480], 'Full-Tower':[620,260,620] }[state.preset]; if(p){[state.height,state.width,state.depth]=p; renderControls(tab);} rebuild(); }; ['height','width','depth'].forEach(k=>document.getElementById(k).oninput=e=>{state[k]=Math.max(100,Number(e.target.value)||100);state.preset='Personalizado';rebuild();}); document.getElementById('doubleChamber').onchange=e=>{state.doubleChamber=e.target.checked;renderControls('dimensions');rebuild();}; }
      const psuSelect=document.getElementById('psuType'); if(psuSelect){psuSelect.value=state.psuType;psuSelect.onchange=e=>{state.psuType=e.target.value;clampCoolingOffsets();renderControls('dimensions');rebuild();};}
      document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{state.material=b.dataset.material;renderControls('panels');rebuild();});
      if (tab === 'panels') bindChassisCustomization();
      if (tab === 'motherboard') { document.getElementById('mbFormat').value = state.mbFormat; document.getElementById('mbFormat').onchange=e=>{state.mbFormat=e.target.value;clampMotherboardOffsets();renderControls('motherboard');rebuild();}; document.getElementById('mbOffsetY').oninput=e=>{state.mbOffsetY=Number(e.target.value)||0;clampMotherboardOffsets();document.getElementById('mbOffsetYValue').textContent=`${state.mbOffsetY} mm`;rebuild();}; document.getElementById('centerMotherboard').onclick=()=>{state.mbOffsetY=0;renderControls('motherboard');rebuild();}; }
      if (tab === 'cooling') { document.getElementById('radiatorSize').value=state.radiatorSize; document.getElementById('radiatorLocation').value=state.radiatorLocation; document.getElementById('fanSize').value=state.fanSize; document.getElementById('fanLocation').value=state.fanLocation; document.getElementById('radiatorEnabled').onchange=e=>{state.radiatorEnabled=e.target.checked;syncCoolingConflicts();renderControls('cooling');rebuild();}; document.getElementById('fanEnabled').onchange=e=>{state.fanEnabled=e.target.checked;syncCoolingConflicts();renderControls('cooling');rebuild();}; document.getElementById('radiatorSize').onchange=e=>{state.radiatorSize=e.target.value;clampCoolingOffsets();renderControls('cooling');rebuild();}; document.getElementById('radiatorLocation').onchange=e=>{state.radiatorLocation=e.target.value;syncCoolingConflicts();clampCoolingOffsets();renderControls('cooling');rebuild();}; document.getElementById('fanSize').onchange=e=>{state.fanSize=e.target.value;clampCoolingOffsets();renderControls('cooling');rebuild();}; document.getElementById('fanLocation').onchange=e=>{state.fanLocation=e.target.value;syncCoolingConflicts();clampCoolingOffsets();renderControls('cooling');rebuild();}; document.getElementById('fanCount').oninput=e=>{state.fanCount=Math.max(1,Math.min(6,Number(e.target.value)||1));clampCoolingOffsets();rebuild();}; ['radiatorOffsetY','radiatorOffsetZ','fanOffsetY','fanOffsetZ'].forEach(id=>{const el=document.getElementById(id);if(el) el.oninput=e=>{state[id]=Number(e.target.value)||0;clampCoolingOffsets();document.getElementById(`${id}Value`).textContent=`${state[id]} mm`;rebuild();};}); }
    }
    document.addEventListener('change', event=>{
      if(event.target?.id!=='preset') return;
      const formatByPreset={'Mini-ITX':'Mini-ITX','Micro-ATX':'mATX','Mid-Tower':'ATX'};
      const nextFormat=formatByPreset[event.target.value];
      if(nextFormat && state.mbFormat!==nextFormat){
        state.mbFormat=nextFormat;
        clampMotherboardOffsets();
        rebuild();
      }
    });
    document.querySelectorAll('.tab').forEach(tab=>tab.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));tab.classList.add('active');renderControls(tab.dataset.tab);});
    document.querySelectorAll('.view-btn').forEach(btn=>btn.onclick=()=>{ const p={front:[0,330,850],side:[850,330,0],top:[0,950,1]}[btn.dataset.view]; camera.position.set(...p); orbit.target.set(0,220,0); orbit.update(); });
    document.getElementById('resetBtn').onclick=()=>{Object.assign(state,defaults,{renderMode:false});state.psuType='ATX';customFrontTexturePair=null;document.getElementById('renderBtn').textContent='Generar render';renderControls('dimensions');rebuild();};
    document.getElementById('renderBtn').onclick=()=>{state.renderMode=!state.renderMode;const button=document.getElementById('renderBtn');button.textContent=state.renderMode?'Salir del render':'Generar render';button.classList.toggle('bg-cyan',state.renderMode);button.classList.toggle('text-slate-950',state.renderMode);rebuild();};
    document.getElementById('summaryBtn').onclick=()=>{document.getElementById('summaryContent').textContent=`MODELO\n${state.preset}\n\nDIMENSIONES\nAlto: ${state.height} mm\nAncho: ${state.width} mm\nFondo: ${state.depth} mm\n\nESTRUCTURA\nDoble cámara: ${state.doubleChamber?'Sí':'No'}\nMaterial: ${state.material}\n\nPLACA BASE\nFactor de forma: ${state.mbFormat}\nAltura Y: ${state.mbOffsetY} mm\nHolgura fija trasera: 4 mm\nPlano de montaje: YZ\nRecortes traseros: plano XY\nSeparadores: patrón generado\n\nREFRIGERACIÓN\nRadiador: ${state.radiatorEnabled?`${state.radiatorSize} · ${state.radiatorLocation}`:'Desactivado'}\nVentiladores: ${state.fanEnabled?`${state.fanCount} × ${state.fanSize} · ${state.fanLocation}`:'Desactivados'}\n\nEstado: prototipo listo para ampliar`;document.getElementById('summaryModal').classList.remove('hidden');document.getElementById('summaryModal').classList.add('flex');};
    function radiatorFanCount(size) { const unit = (size === '280 mm' || size === '420 mm') ? 140 : 120; return Math.max(1, Math.round(radiatorLengths[size] / unit)); }
    function getDesignSummary() {
      const board = motherboardSpecs[state.mbFormat];
      const fans = Object.entries(state.fanGroups).filter(([,group])=>group.enabled).map(([location,group])=>({location,sizeMm:Number(group.size.replace(' mm','')),count:group.count,invertedFlow:group.invert,offsetMm:{x:Math.round(group.offsetX||0),y:Math.round(group.offsetY||0),z:Math.round(group.offsetZ||0)}}));
      const radiator = state.radiatorEnabled ? {sizeMm:radiatorLengths[state.radiatorSize],location:state.radiatorLocation,fanSizeMm:(state.radiatorSize==='280 mm'||state.radiatorSize==='420 mm')?140:120,fanCount:radiatorFanCount(state.radiatorSize),invertedFlow:state.radiatorInverted,offsetMm:{x:Math.round(state.radiatorOffsetX||0),y:Math.round(state.radiatorOffsetY||0),z:Math.round(state.radiatorOffsetZ||0)}} : null;
      return {format:'EnsambleFree technical design',version:1,model:state.preset,chassis:{heightMm:state.height,widthMm:effectiveChassisWidthMm(),baseWidthMm:state.width,depthMm:state.depth,doubleChamber:state.doubleChamber,material:state.material,psuFormat:state.psuType,psuDimensionsMm:psuSpec(),storageLayout:state.doubleChamber?'Cámara trasera: PSU + bahías 3.5/2.5':'Compartimento inferior separado: PSU + bahías 3.5/2.5'},motherboard:{formFactor:state.mbFormat,widthMm:board.h,heightMm:board.w,mountingPlane:'YZ',trayClearanceZMm:4,heightOffsetYMm:state.mbOffsetY,standoffCount:board.holes.length,standoffPatternMm:board.holes},cooling:{radiator,individualFans:fans},fabrication:{ioCutout:{plane:'XY',widthMm:45,heightMm:Math.round(motherboardSpecs.mATX.w*.5),rearClearanceMm:4},expansionSlots:'Visualized beside the motherboard',panelMaterials:{outer:state.material},feet:4}};
    }
    function summaryText(summary) {
      const lines=['ENSAMBLEFREE · RESUMEN TÉCNICO','','CHASIS',`Modelo: ${summary.model}`,`Dimensiones: ${summary.chassis.heightMm} × ${summary.chassis.widthMm} × ${summary.chassis.depthMm} mm`,`Doble cámara: ${summary.chassis.doubleChamber?'Sí':'No'}`,`Material: ${summary.chassis.material}`,'','PLACA BASE',`Factor: ${summary.motherboard.formFactor}`,`Medidas: ${summary.motherboard.widthMm} × ${summary.motherboard.heightMm} mm`,`Plano de montaje: ${summary.motherboard.mountingPlane}`,`Altura Y: ${summary.motherboard.heightOffsetYMm} mm`,`Separadores: ${summary.motherboard.standoffCount}`,`Holgura trasera Z: ${summary.motherboard.trayClearanceZMm} mm`,'','REFRIGERACIÓN'];
      if(summary.cooling.radiator){const r=summary.cooling.radiator;lines.push(`Radiador: ${r.sizeMm} mm · ${r.location}`,`Ventiladores del radiador: ${r.fanCount} × ${r.fanSizeMm} mm`,`Desplazamiento: X ${r.offsetMm.x} · Y ${r.offsetMm.y} · Z ${r.offsetMm.z} mm`);}else lines.push('Radiador: Desactivado');
      if(summary.cooling.individualFans.length) summary.cooling.individualFans.forEach(f=>lines.push(`Ventiladores ${f.location}: ${f.count} × ${f.sizeMm} mm`,`  Desplazamiento: X ${f.offsetMm.x} · Y ${f.offsetMm.y} · Z ${f.offsetMm.z} mm`)); else lines.push('Ventiladores individuales: Desactivados');
      lines.push('','RECORTES Y FABRICACIÓN',`Recorte I/O: ${summary.fabrication.ioCutout.widthMm} × ${summary.fabrication.ioCutout.heightMm} mm · plano ${summary.fabrication.ioCutout.plane}`,`Separación I/O trasera: ${summary.fabrication.ioCutout.rearClearanceMm} mm`,`Patrón de tornillos: ${summary.motherboard.standoffCount} puntos`,`Patas: ${summary.fabrication.feet}`,'','Estado: configuración validada en tiempo real');return lines.join('\n');
    }
    function downloadDesign(filename, content, type) { const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download=filename; link.click(); setTimeout(()=>URL.revokeObjectURL(url),500); }
    let currentSummary = null;
    document.getElementById('summaryBtn').onclick=()=>{currentSummary=getDesignSummary();document.getElementById('summaryContent').textContent=summaryText(currentSummary);document.getElementById('summaryModal').classList.remove('hidden');document.getElementById('summaryModal').classList.add('flex');};
    document.getElementById('exportJson').onclick=()=>{const data=currentSummary||getDesignSummary();downloadDesign('ensamblefree-diseno.json',JSON.stringify(data,null,2),'application/json');};
    document.getElementById('exportTxt').onclick=()=>{const data=currentSummary||getDesignSummary();downloadDesign('ensamblefree-resumen.txt',summaryText(data),'text/plain;charset=utf-8');};
    document.getElementById('closeSummary').onclick=()=>document.getElementById('summaryModal').classList.add('hidden');
    function resize(){const r=viewport.getBoundingClientRect();camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);} window.addEventListener('resize',resize); resize(); renderControls(); rebuild();
    function animate(){requestAnimationFrame(animate);orbit.update();renderer.render(scene,camera);} animate();
