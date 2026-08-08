const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('./src/config/database');

function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    // DD/MM/YYYY to YYYY-MM-DD
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return null;
}

function parseNumber(numStr) {
  if (!numStr) return 0;
  // Handle commas as decimal separator if any
  return parseFloat(numStr.replace(',', '.')) || 0;
}

async function importClientes() {
  return new Promise((resolve, reject) => {
    const clientes = [];
    fs.createReadStream(path.join(__dirname, '../import/Clientes TODOS.csv'))
      .pipe(csv())
      .on('data', (row) => {
        // Parse Nombre y Apellidos
        const fullName = (row['NOMBRE CLIENTE'] || 'Cliente Desconocido').trim();
        const spaceIdx = fullName.indexOf(' ');
        let nombre = fullName;
        let apellidos = '-';
        if (spaceIdx > 0) {
          nombre = fullName.substring(0, spaceIdx);
          apellidos = fullName.substring(spaceIdx + 1);
        }

        const dni = row['DNI'] || null;
        const fechaNacimiento = parseDate(row['FECHA NACIMIENTO']);
        const telefono = row['TELÉFONO'] || null;
        const direccion = row['DIRECCIÓN'] || null;
        const email = row['Correo'] || null;
        const sexo = row['Sexo'] || null;
        const foto = row['Foto'] || null;
        
        const fechaAtencion = row['FECHA DE ATENCIÓN'] || '';
        const servicio = row['Servicio'] || '';
        let notas = '';
        if (fechaAtencion) notas += `Fecha de Atención: ${fechaAtencion}\n`;
        if (servicio) notas += `Servicio: ${servicio}\n`;

        clientes.push([
          nombre, apellidos, email, dni, direccion, telefono, fechaNacimiento, notas.trim(), sexo, foto
        ]);
      })
      .on('end', async () => {
        let inserted = 0;
        for (const c of clientes) {
          try {
            const res = await pool.query(
              `INSERT INTO clientes (nombre, apellidos, email, dni, direccion, telefono, fecha_nacimiento, notas, sexo, foto_perfil)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING`,
              c
            );
            inserted += res.rowCount;
          } catch (err) {
            console.error('Error insertando cliente', c[0], err.message);
          }
        }
        console.log(`✅ Clientes procesados: ${inserted} (de ${clientes.length})`);
        resolve();
      })
      .on('error', reject);
  });
}

async function importInventario() {
  return new Promise((resolve, reject) => {
    const productos = [];
    let skuCounter = 1;

    fs.createReadStream(path.join(__dirname, '../import/Inventario piercing.csv'))
      .pipe(csv())
      .on('data', (row) => {
        const nombre = row['Articulo'] || 'Articulo Desconocido';
        const precioCompra = parseNumber(row['Coste Unitario']);
        const precioVenta = parseNumber(row['Precio de venta CAJA']) || parseNumber(row['Valor Unitario']);
        const stockActual = parseNumber(row['Stock']);
        const proveedor = row['Marca'] || '';
        
        let descripcion = `Color: ${row['color'] || '-'}\nMaterial: ${row['Material'] || '-'}\nMedidas: ${row['medidas piercing'] || '-'}\nFormato: ${row['formato'] || '-'}\nUnidades: ${row['unidades de medida'] || '-'}`;

        const sku = `PIERCING-${skuCounter.toString().padStart(4, '0')}`;
        skuCounter++;

        productos.push([
          sku, nombre, descripcion, 'piercing', precioCompra, precioVenta, stockActual, proveedor
        ]);
      })
      .on('end', async () => {
        let inserted = 0;
        for (const p of productos) {
          try {
            await pool.query(
              `INSERT INTO productos (sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock_actual, proveedor)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (sku) DO NOTHING`,
              p
            );
            inserted++;
          } catch (err) {
            console.error('Error insertando producto', p[1], err.message);
          }
        }
        console.log(`✅ Productos procesados: ${inserted} (de ${productos.length})`);
        resolve();
      })
      .on('error', reject);
  });
}

async function run() {
  try {
    console.log('Iniciando importación...');
    await importClientes();
    // await importInventario(); ya inyectado
    console.log('🎉 Importación de clientes completada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error en la importación:', error);
    process.exit(1);
  }
}

run();
