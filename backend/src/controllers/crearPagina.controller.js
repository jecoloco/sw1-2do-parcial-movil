import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';
import archiver from 'archiver';
import { response } from '../middlewares/catchedAsync.js';
import { getSalaById } from '../models/sala.model.js';
import { rm } from 'fs/promises';
import multer from 'multer';
import { tmpdir } from 'os';

const rutaBase = path.join(tmpdir(), 'proyectos_flutter_generados');
if (!fs.existsSync(rutaBase)) {
  fs.mkdirSync(rutaBase, { recursive: true });
}
const upload = multer({ storage: multer.memoryStorage() });

class CrearPaginaController {
  chatMessages = {};

  constructor() {
    this.crear = this.crear.bind(this);
    this.exportar = this.exportar.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.sendChatMessage = this.sendChatMessage.bind(this);
  }

  capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  toLowerCamelCase(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
  }

  generarFlutterWidgets(componentes) {
    const escape = (str) => str ? String(str).replace(/'/g, "\\'").replace(/\n/g, '\\n') : '';
    const parseColor = (hex, defaultColor = 'Theme.of(context).primaryColor') => {
      if (!hex || hex === 'null') return defaultColor;
      if (hex.startsWith('#')) {
        const color = hex.slice(1);
        return `const Color(0xFF${color.padEnd(6, '0')})`;
      }
      return defaultColor;
    };

    return componentes.map((comp) => {
      const p = comp.props || {};
      const x = parseFloat(comp.x) || 0;
      const y = parseFloat(comp.y) || 0;
      const widthPerc = parseFloat(p.width?.toString().replace('%', '')) || 30;
      const heightValue = p.height;
      const idSuffix = this.toLowerCamelCase(`${comp.tipo}_${comp.id.slice(-5)}`);

      let heightCode;
      if (typeof heightValue === 'string' && heightValue.endsWith('%')) {
          const perc = parseFloat(heightValue) || 0;
          heightCode = `constraints.maxHeight * ${(perc / 100).toFixed(4)}`;
      } else if (heightValue && heightValue !== 'auto') {
          heightCode = `${parseFloat(heightValue.toString().replace('px', '')) || 50.0}`;
      } else {
        const defaultHeights = { input: 56, textarea: 120, button: 48, checkbox: 48, checklist: 150, radiogroup: 150, image: 150, tabla: 250, label: 40, clock: 50, select: 60 };
        heightCode = `${defaultHeights[comp.tipo] || 50.0}`;
      }
      
      const posicion = `Positioned(
        left: constraints.maxWidth * ${(x / 100).toFixed(4)},
        top: constraints.maxHeight * ${(y / 100).toFixed(4)},
        width: constraints.maxWidth * ${(widthPerc / 100).toFixed(4)},
        height: ${heightCode},
        child: `;

      let widget = `Container(
          padding: const EdgeInsets.all(8.0),
          decoration: BoxDecoration( color: Colors.red.withOpacity(0.1), border: Border.all(color: Colors.red), borderRadius: BorderRadius.circular(8), ),
          child: Center(child: Text('Error: ${escape(comp.tipo)}', style: TextStyle(color: Colors.red, fontSize: 12))),
        )`;

      switch (comp.tipo) {
        case 'input':
          widget = `Material(
            color: Colors.transparent,
            child: TextFormField(
              controller: _${idSuffix}Controller,
              decoration: InputDecoration( hintText: '${escape(p.placeholder)}', border: const OutlineInputBorder(), filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 12.0), ),
              onChanged: (value) => setState(() => _${idSuffix}Value = value),
            ),
          )`;
          break;
        case 'textarea':
          widget = `Material(
            color: Colors.transparent,
            child: TextFormField(
              controller: _${idSuffix}Controller,
              maxLines: 100,
              decoration: InputDecoration( hintText: '${escape(p.placeholder)}', border: const OutlineInputBorder(), filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.all(12.0), ),
              onChanged: (value) => setState(() => _${idSuffix}Value = value),
            ),
          )`;
          break;
        case 'checkbox':
          widget = `InkWell(
              onTap: () => setState(() => _${idSuffix} = !_${idSuffix}),
              child: Row(
                children: [
                  Checkbox(
                    value: _${idSuffix},
                    onChanged: (v) => setState(() => _${idSuffix} = v ?? false),
                  ),
                  Expanded(
                    child: Text('${escape(p.label)}', overflow: TextOverflow.clip),
                  ),
                ],
              ),
            )`;
          break;
        case 'checklist':
          const items = (p.items || '').split(',').map(i => i.trim());
          const checklistItems = items.map((item, i) => `
            InkWell(
              onTap: () => setState(() => _${idSuffix}${i} = !_${idSuffix}${i}),
              child: Row(
                children: [
                  Checkbox(
                    value: _${idSuffix}${i},
                    onChanged: (v) => setState(() => _${idSuffix}${i} = v ?? false),
                  ),
                  Expanded(
                    child: Text('${escape(item)}', overflow: TextOverflow.clip),
                  ),
                ],
              ),
            )`).join(',');
          widget = `Container( decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade400)), child: SingleChildScrollView( child: Column( children: [ ${checklistItems} ], ), ), )`;
          break;
        case 'radiogroup':
          const opciones = (p.opciones || '').split(',').map(i => i.trim());
          const radioItems = opciones.map(opt => `
            InkWell(
              onTap: () => setState(() => _${idSuffix} = '${escape(opt)}'),
              child: Row(
                children: [
                  Radio<String>(
                    value: '${escape(opt)}',
                    groupValue: _${idSuffix},
                    onChanged: (v) => setState(() => _${idSuffix} = v),
                  ),
                  Expanded(
                    child: Text('${escape(opt)}', overflow: TextOverflow.clip),
                  ),
                ],
              ),
            )`).join(',');
          widget = `Container( decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade400)), child: SingleChildScrollView( child: Column( children: [ ${radioItems} ], ), ), )`;
          break;
        case 'select':
          const opcionesSel = (p.opciones || '').split(',').map(i => i.trim());
          const dropdownItems = opcionesSel.map(val => `DropdownMenuItem<String>(value: '${escape(val)}', child: Text('${escape(val)}'))`).join(',');
          widget = `Material(
            color: Colors.transparent,
            child: DropdownButtonFormField<String>(
              value: _${idSuffix},
              decoration: const InputDecoration(border: OutlineInputBorder(), filled: true, fillColor: Colors.white, contentPadding: EdgeInsets.symmetric(horizontal: 12.0)),
              onChanged: (v) => setState(() => _${idSuffix} = v),
              items: [${dropdownItems}],
            ),
          )`;
          break;
        case 'label':
          widget = `Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('${escape(p.contenido)}', style: TextStyle(fontSize: ${parseFloat(p.fontSize?.toString().replace('px', '')) || 16})),
              ),
            )`;
          break;
        case 'button':
          widget = `SizedBox.expand(
              child: ElevatedButton(
                onPressed: () { if(mounted) ScaffoldMessenger.of(context).showSnackBar( SnackBar( content: Text('${escape(p.accion)}'), ), ); },
                style: ElevatedButton.styleFrom( backgroundColor: ${parseColor(p.backgroundColor)}, foregroundColor: ${parseColor(p.color, 'Colors.white')}, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), elevation: 2.0 ),
                child: Text('${escape(p.contenido)}'),
              ),
            )`;
          break;
        case 'image':
          widget = `SizedBox.expand(
              child: Image.network(
                '${escape(p.src)}', fit: BoxFit.cover,
                errorBuilder: (c, e, s) => const Center(child: Icon(Icons.broken_image, color: Colors.grey, size: 40)),
                loadingBuilder: (c, child, p) => p == null ? child : const Center(child: CircularProgressIndicator()),
              ),
            )`;
          break;
        case 'clock':
          widget = `Container(
              color: Colors.black,
              child: Center(
                child: StreamBuilder(
                  stream: Stream.periodic(const Duration(seconds: 1), (i) => i),
                  builder: (context, snapshot) {
                    final now = DateTime.now();
                    final timeString = '\${now.hour.toString().padLeft(2, '0')}:\${now.minute.toString().padLeft(2, '0')}:\${now.second.toString().padLeft(2, '0')}';
                    return Text(timeString, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold));
                  }
                )
              )
            )`;
          break;
        case 'tabla':
          const headers = (p.encabezados || '').split(',').map(h => h.trim());
          const filas = Array.isArray(p.contenidoTabla) ? p.contenidoTabla : [];
          const tableHeaders = headers.map(h => `Padding(padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0), child: Text('${escape(h)}', style: const TextStyle(fontWeight: FontWeight.bold)))`).join(',');
          const tableRows = filas.map(row => {
            const cells = Array.isArray(row) ? row.map(cell => `Padding(padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0), child: Text('${escape(cell.toString())}'))`).join(',') : '';
            return `TableRow(children: [${cells}])`;
          }).join(',');
          widget = `SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: Table(
                border: TableBorder.all(color: Colors.grey.shade400, width: ${parseFloat(p.borderWidth) || 1.0}),
                defaultColumnWidth: const IntrinsicColumnWidth(),
                children: [
                  if ("${tableHeaders}".isNotEmpty) TableRow( decoration: BoxDecoration(color: Colors.grey.shade200), children: [${tableHeaders}]),
                  ${tableRows}
                ],
              ),
            ),
          )`;
          break;
      }
      return `${posicion}${widget}),`;
    }).join('\n');
  }

  generarVariablesEstado(componentes) {
    let stateVariables = '';
    const controllers = [];
    const escape = (str) => str ? String(str).replace(/'/g, "\\'") : '';
    componentes.forEach(comp => {
      const idSuffix = this.toLowerCamelCase(`${comp.tipo}_${comp.id.slice(-5)}`);
      const p = comp.props || {};
      switch (comp.tipo) {
        case 'input': case 'textarea':
          controllers.push(`  final TextEditingController _${idSuffix}Controller = TextEditingController(text: '${escape(p.contenido)}');`);
          stateVariables += `  late String _${idSuffix}Value = '${escape(p.contenido || '')}';\n`;
          break;
        case 'checkbox': stateVariables += `  bool _${idSuffix} = ${p.checked === true};\n`; break;
        case 'radiogroup':
          const opciones = (p.opciones || ' , ').split(',');
          stateVariables += `  String? _${idSuffix} = '${escape(p.seleccionado || opciones[0]?.trim())}';\n`;
          break;
        case 'select':
          const opcionesSel = (p.opciones || ' , ').split(',');
          stateVariables += `  String? _${idSuffix} = '${escape(p.seleccionado || opcionesSel[0]?.trim())}';\n`;
          break;
        case 'checklist':
          (p.items || ' , ').split(',').forEach((_, i) => { stateVariables += `  bool _${idSuffix}${i} = false;\n`; });
          break;
      }
    });
    return { stateVariables, controllers };
  }
  
  generarFlutterComponente(className, viewName, componentes) {
    const stateClassName = `_${className}State`;
    const { stateVariables, controllers } = this.generarVariablesEstado(componentes);
    const widgets = this.generarFlutterWidgets(componentes);
    const escape = (str) => str ? String(str).replace(/'/g, "\\'") : '';

    const disposeControllers = controllers.length > 0 ? `
  @override
  void dispose() {
    ${controllers.map(controller => {
      const match = controller.match(/(_\w+Controller)/);
      return match ? `${match[1]}.dispose();` : '';
    }).filter(Boolean).join('\n    ')}
    super.dispose();
  }` : '';
    
    const viewComponentsList = `const viewComponents = ${JSON.stringify(componentes.map(c => ({ y: c.y, tipo:c.tipo, props: { height: c.props.height } })))};`;
    
    const totalHeightCalculation = `
          final double calculatedContentHeight = (() {
            double maxBottom = 0;
            for (final comp in viewComponents) {
              final y = (double.tryParse(comp['y']?.toString() ?? '0') ?? 0) / 100.0;
              final props = comp['props'] as Map<String, dynamic>?;
              final heightValue = props?['height'];

              double heightInPixels = 0;
              if (heightValue is String && heightValue.endsWith('%')) {
                heightInPixels = constraints.maxHeight * ((double.tryParse(heightValue.replaceAll('%','')) ?? 0) / 100.0);
              } else if (heightValue != null && heightValue != 'auto') {
                heightInPixels = double.tryParse(heightValue.toString().replaceAll('px','')) ?? 50.0;
              } else {
                const defaultHeights = {'input': 56.0, 'textarea': 120.0, 'button': 48.0, 'checkbox': 48.0, 'checklist': 150.0, 'radiogroup': 150.0, 'image': 150.0, 'tabla': 250.0, 'label': 40.0, 'clock': 50.0, 'select': 60.0};
                heightInPixels = defaultHeights[comp['tipo']] ?? 50.0;
              }
              
              final bottomEdge = (constraints.maxHeight * y) + heightInPixels;
              if (bottomEdge > maxBottom) {
                maxBottom = bottomEdge;
              }
            }
            return maxBottom;
          })();
          
          final totalHeight = math.max(constraints.maxHeight, calculatedContentHeight);
          `;

    return `
import 'package:flutter/material.dart';
import 'dart:math' as math;

class ${className} extends StatefulWidget {
  const ${className}({super.key});
  
  @override
  State<${className}> createState() => ${stateClassName}();
}

class ${stateClassName} extends State<${className}> {
${controllers.join('\n')}
${stateVariables}
${disposeControllers}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${escape(viewName)}'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          ${viewComponentsList}
          ${totalHeightCalculation}

          return SingleChildScrollView(
            child: SizedBox(
              width: constraints.maxWidth,
              height: totalHeight,
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  ${widgets}
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}`.trim();
  }
  
  // El resto de la clase no necesita cambios
  generarRutasYImports(libPath, vistasData) {
    const rutas = [];
    const imports = [];
    for (const vista of vistasData) {
      if (!vista || typeof vista.nombre !== 'string') continue;
      const nombreRuta = vista.nombre.toLowerCase().replace(/[\s\W]+/g, '-');
      const nombreClase = `${this.capitalize(nombreRuta.replace(/-/g, ''))}Page`;
      const nombreArchivo = `${nombreRuta}_page.dart`;
      const componentCode = this.generarFlutterComponente(nombreClase, vista.nombre, vista.componentes || []);
      const componentPath = path.join(libPath, nombreArchivo);
      fs.writeFileSync(componentPath, componentCode);
      imports.push(`import 'pages/${nombreArchivo}';`);
      rutas.push(`'/${nombreRuta}': (context) => const ${nombreClase}()`);
    }
    return { rutas, imports };
  }

  generarFlutterAppDesdeJSON(proyectoPath, tituloProyecto, vistasData) {
    const libPath = path.join(proyectoPath, 'lib');
    const pagesPath = path.join(libPath, 'pages');
    fs.mkdirSync(pagesPath, { recursive: true });
    const { rutas, imports } = this.generarRutasYImports(pagesPath, vistasData);
    if (rutas.length === 0) throw new Error("JSON no contiene vistas válidas.");
    const rutaInicial = vistasData[0].nombre.toLowerCase().replace(/[\s\W]+/g, '-');
    const pubspecContent = `name: ${tituloProyecto}\ndescription: App Flutter generada.\npublish_to: 'none'\nversion: 1.0.0+1\n\nenvironment:\n  sdk: '>=3.2.0 <4.0.0'\n\ndependencies:\n  flutter:\n    sdk: flutter\n  cupertino_icons: ^1.0.2\n\ndev_dependencies:\n  flutter_test:\n    sdk: flutter\n  flutter_lints: ^2.0.0\n\nflutter:\n  uses-material-design: true`;
    fs.writeFileSync(path.join(proyectoPath, 'pubspec.yaml'), pubspecContent);
    const mainContent = `import 'package:flutter/material.dart';\n${imports.join('\n')}\n\nvoid main() => runApp(const MyApp());\n\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      debugShowCheckedModeBanner: false,\n      title: '${this.capitalize(tituloProyecto.replace(/_/g, ' '))}',\n      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple), useMaterial3: true, scaffoldBackgroundColor: const Color(0xFFF8F9FA)),\n      initialRoute: '/${rutaInicial}',\n      routes: {\n        ${rutas.join(',\n        ')}\n      },\n    );\n  }\n}`;
    fs.writeFileSync(path.join(libPath, 'main.dart'), mainContent.trim());
  }

  async nuevoArchivoFlutter(titulo) {
    const comando = `flutter create --platforms=android,ios,web ${titulo}`;
    console.log(`🚀 Ejecutando: ${comando} en ${rutaBase}`);
    return new Promise((resolve, reject) => {
      exec(comando, { cwd: rutaBase, timeout: 180000 }, (err, stdout, stderr) => {
        if (err) { console.error('❌ Error creando proyecto Flutter:', stderr); return reject(new Error(`Error creando proyecto Flutter: ${stderr}`)); }
        console.log('✅ Proyecto Flutter creado.');
        resolve();
      });
    });
  }

  async comprimirProyecto(titulo) {
    const rutaFinal = path.join(rutaBase, titulo);
    const zipPath = path.join(rutaBase, `${titulo}.zip`);
    console.log(`📦 Comprimiendo: ${zipPath}`);
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => { console.log(`✅ Compresión finalizada: ${archive.pointer()} bytes`); resolve(); });
      archive.on('error', (err) => { console.error('❌ Error comprimiendo:', err); reject(err); });
      archive.pipe(output);
      archive.directory(rutaFinal, false);
      archive.finalize();
    });
  }

  async enviarZipYLimpiar(res, titulo) {
    const rutaProyecto = path.join(rutaBase, titulo);
    const zipPath = path.join(rutaBase, `${titulo}.zip`);
    try {
      res.download(zipPath, `${titulo}.zip`, async (err) => {
        if (err) console.error('❌ Error enviando zip:', err);
        else console.log('✅ Zip enviado.');
        console.log(`🧹 Limpiando: ${titulo}`);
        try {
          await rm(rutaProyecto, { recursive: true, force: true });
          await rm(zipPath, { force: true });
          console.log('🗑️ Archivos temporales eliminados.');
        } catch (cleanError) {
          console.error('❌ Error limpiando archivos:', cleanError);
        }
      });
    } catch (error) {
      console.error('❌ Error antes de enviar/limpiar:', error.message);
      if (!res.headersSent) response(res, 500, { error: 'Error preparando descarga' });
    }
  }

  async exportar(req, res) {
    const { id } = req.params;
    if (!id || id === 'undefined') return response(res, 400, { error: 'ID de sala inválido.' });
    try {
      console.log(`📋 Iniciando exportación para sala: ${id}`);
      const dbResult = await getSalaById(id);
      if (!dbResult) return response(res, 404, { error: 'Sala no encontrada' });
      const sala = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      let vistasData;
      try {
        vistasData = JSON.parse(sala.xml || '[]');
        if (!Array.isArray(vistasData)) vistasData = [];
      } catch (e) {
        return response(res, 500, { error: "Formato de datos de sala corrupto." });
      }
      if (vistasData.length === 0) {
        vistasData = [{ nombre: 'Principal', componentes: [{ id: 'demo_001', tipo: 'label', x: 10, y: 10, props: { contenido: 'App generada', fontSize: '24px', width: '80%', height: 'auto' } }] }];
      }
      const tituloProyecto = sala.title ? sala.title.toLowerCase().replace(/[\s\W]+/g, '_') : `proyecto_sala_${id}`;
      console.log(`🏗️ Creando proyecto: ${tituloProyecto}`);
      await this.nuevoArchivoFlutter(tituloProyecto); 
      const proyectoPath = path.join(rutaBase, tituloProyecto);
      console.log(`🔧 Generando código...`);
      this.generarFlutterAppDesdeJSON(proyectoPath, tituloProyecto, vistasData);      
      console.log(`📦 Comprimiendo...`);
      await this.comprimirProyecto(tituloProyecto);
      console.log(`📤 Enviando al cliente...`);
      await this.enviarZipYLimpiar(res, tituloProyecto);
    } catch (error) {
      console.error('❌ Error al exportar:', error.stack);
      if (!res.headersSent) return response(res, 500, { error: 'Error inesperado al exportar', detalles: error.message });
    }
  }

  async crear(req, res) {
    const { titulo } = req.body;
    if (!/^[a-zA-Z0-9_]+$/.test(titulo)) return response(res, 400, { error: 'Título inválido. Usa solo letras, números y guion bajo.' });
    try {
      await this.nuevoArchivoFlutter(titulo);
      await this.comprimirProyecto(titulo);
      await this.enviarZipYLimpiar(res, titulo);
    } catch (error) {
      console.error('❌ Error general en "crear":', error.message);
      return response(res, 500, { error: 'Error inesperado del servidor', detalles: error.message });
    }
  }

  async uploadImage(req, res) {
    upload.single('imagen')(req, res, (err) => {
      if (err) return response(res, 500, { error: 'Error al procesar el archivo' });
      if (!req.file) return response(res, 400, { error: 'No se proporcionó ninguna imagen' });
      console.log(`✅ Imagen recibida: ${req.file.originalname}. No se guardará.`);
      return response(res, 200, { xml: JSON.stringify({ message: "Imagen recibida pero no procesada en el backend." }) });
    });
  }

  async sendChatMessage(req, res) {
    const { id } = req.params;
    const { mensaje } = req.body;
    if (!id || !mensaje) return response(res, 400, { error: 'ID de sala y mensaje requeridos' });
    this.chatMessages[id] = this.chatMessages[id] || [];
    this.chatMessages[id].push({ mensaje, timestamp: new Date() });
    return response(res, 200, { respuesta: `Recibido en backend: "${mensaje}"` });
  }
}

export default new CrearPaginaController();
