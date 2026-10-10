#!/usr/bin/env node

/**
 * Manager Library - Demonstration Seeder Utility (T-21)
 * Ficha ADSO 3413974 · SENA
 *
 * Populates data exclusively via the HTTP API:
 * - >= 40 books across 5 fixed categories
 * - 10 library members
 * - 1 librarian user
 * - >= 15 loans
 * - Exactly 3 overdue loan items (using backdated loaned_at)
 */

const API_BASE = process.env.API_URL || 'http://localhost:8000/api/v1';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin12345';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const errorMsg = data && data.message ? data.message : `HTTP ${res.status}`;
    throw new Error(`[${res.status}] ${path}: ${errorMsg} - ${JSON.stringify(data)}`);
  }

  return data;
}

const BOOKS_DATA = [
  // Novela
  { title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Novela', copies: 5 },
  { title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', category: 'Novela', copies: 4 },
  { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', category: 'Novela', copies: 3 },
  { title: 'La ciudad y los perros', author: 'Mario Vargas Llosa', category: 'Novela', copies: 4 },
  { title: 'Conversación en La Catedral', author: 'Mario Vargas Llosa', category: 'Novela', copies: 3 },
  { title: 'Rayuela', author: 'Julio Cortázar', category: 'Novela', copies: 4 },
  { title: 'Ficciones', author: 'Jorge Luis Borges', category: 'Novela', copies: 5 },
  { title: 'El Aleph', author: 'Jorge Luis Borges', category: 'Novela', copies: 4 },
  { title: 'Pedro Páramo', author: 'Juan Rulfo', category: 'Novela', copies: 3 },
  { title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', category: 'Novela', copies: 4 },
  { title: 'Crónica de una muerte anunciada', author: 'Gabriel García Márquez', category: 'Novela', copies: 4 },

  // Poesía
  { title: 'Veinte poemas de amor y una canción desesperada', author: 'Pablo Neruda', category: 'Poesía', copies: 4 },
  { title: 'Canto General', author: 'Pablo Neruda', category: 'Poesía', copies: 3 },
  { title: 'Piedra de Sol', author: 'Octavio Paz', category: 'Poesía', copies: 3 },
  { title: 'Rimas y Leyendas', author: 'Gustavo Adolfo Bécquer', category: 'Poesía', copies: 4 },
  { title: 'Romancero Gitano', author: 'Federico García Lorca', category: 'Poesía', copies: 4 },
  { title: 'Poeta en Nueva York', author: 'Federico García Lorca', category: 'Poesía', copies: 3 },
  { title: 'Los heraldos negros', author: 'César Vallejo', category: 'Poesía', copies: 3 },
  { title: 'Trilce', author: 'César Vallejo', category: 'Poesía', copies: 3 },

  // Ensayo
  { title: 'El laberinto de la soledad', author: 'Octavio Paz', category: 'Ensayo', copies: 4 },
  { title: 'Las venas abiertas de América Latina', author: 'Eduardo Galeano', category: 'Ensayo', copies: 5 },
  { title: 'Sapiens: De animales a dioses', author: 'Yuval Noah Harari', category: 'Ensayo', copies: 5 },
  { title: 'Homo Deus: Breve historia del mañana', author: 'Yuval Noah Harari', category: 'Ensayo', copies: 4 },
  { title: 'El elogio de la locura', author: 'Erasmo de Rotterdam', category: 'Ensayo', copies: 3 },
  { title: 'El arte de la guerra', author: 'Sun Tzu', category: 'Ensayo', copies: 5 },
  { title: 'El príncipe', author: 'Nicolás Maquiavelo', category: 'Ensayo', copies: 4 },
  { title: 'La sociedad del cansancio', author: 'Byung-Chul Han', category: 'Ensayo', copies: 4 },

  // Ciencia
  { title: 'Cosmos', author: 'Carl Sagan', category: 'Ciencia', copies: 5 },
  { title: 'El mundo y sus demonios', author: 'Carl Sagan', category: 'Ciencia', copies: 4 },
  { title: 'Breve historia del tiempo', author: 'Stephen Hawking', category: 'Ciencia', copies: 5 },
  { title: 'El gen egoísta', author: 'Richard Dawkins', category: 'Ciencia', copies: 3 },
  { title: 'Una breve historia de casi todo', author: 'Bill Bryson', category: 'Ciencia', copies: 4 },
  { title: 'Astrophysics for People in a Hurry', author: 'Neil deGrasse Tyson', category: 'Ciencia', copies: 4 },
  { title: 'La partícula divina', author: 'Leon Lederman', category: 'Ciencia', copies: 3 },
  { title: 'El origen de las especies', author: 'Charles Darwin', category: 'Ciencia', copies: 4 },

  // Historia
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'Historia', copies: 4 },
  { title: 'Historia de dos ciudades', author: 'Charles Dickens', category: 'Historia', copies: 3 },
  { title: 'Historia de Colombia y sus oligarquías', author: 'Antonio Caballero', category: 'Historia', copies: 5 },
  { title: 'La rebelión de las ratas', author: 'Fernando Soto Aparicio', category: 'Historia', copies: 4 },
  { title: 'La vorágine', author: 'José Eustasio Rivera', category: 'Historia', copies: 4 },
  { title: 'Breve historia de Roma', author: 'Pedro López Barja', category: 'Historia', copies: 3 },
  { title: 'Los pilares de la Tierra', author: 'Ken Follett', category: 'Historia', copies: 4 },
];

const MEMBERS_DATA = [
  { full_name: 'Ana María Gómez', document_number: '1010203041' },
  { full_name: 'Carlos Andrés Rodríguez', document_number: '1010203042' },
  { full_name: 'Luisa Fernanda Martínez', document_number: '1010203043' },
  { full_name: 'Juan David Pérez', document_number: '1010203044' },
  { full_name: 'Valentina Restrepo Torres', document_number: '1010203045' },
  { full_name: 'Santiago Morales Silva', document_number: '1010203046' },
  { full_name: 'Mariana Castro Ortiz', document_number: '1010203047' },
  { full_name: 'Felipe Vargas Navarro', document_number: '1010203048' },
  { full_name: 'Camila Rojas Mendoza', document_number: '1010203049' },
  { full_name: 'Andrés Felipe Vega', document_number: '1010203050' },
];

async function main() {
  console.log('🚀 Iniciando sembrador de demostración de Manager Library...');
  console.log(`📡 Conectando a ${API_BASE}`);

  // 1. Health check
  const health = await request('/health');
  console.log(`✅ Salud del backend: ${health.status}`);

  // 2. Login Admin
  const adminAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS })
  });
  const adminToken = adminAuth.access_token;
  console.log(`🔑 Sesión admin iniciada con éxito (rol: ${adminAuth.role})`);

  // 3. Crear Bibliotecario
  const biblioUsername = 'bibliotecario_demo';
  let librarianToken;
  try {
    await request('/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        username: biblioUsername,
        password: 'bibliotecario123',
        role: 'librarian'
      })
    });
    console.log(`👤 Bibliotecario '${biblioUsername}' creado exitosamente.`);
  } catch (err) {
    console.log(`ℹ️ Bibliotecario '${biblioUsername}' ya existe o no requiere creación.`);
  }

  const biblioAuth = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: biblioUsername, password: 'bibliotecario123' })
  });
  librarianToken = biblioAuth.access_token;
  console.log(`🔑 Sesión de bibliotecario iniciada con éxito.`);

  // 4. Obtener categorías
  const categories = await request('/categories', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`📚 ${categories.length} categorías disponibles en el sistema.`);
  const catMap = {};
  for (const c of categories) {
    catMap[c.name] = c.id;
  }

  // 5. Sembrar Libros (>= 40)
  console.log(`📖 Sembrando ${BOOKS_DATA.length} libros en catálogo...`);
  const createdBooks = [];
  let baseIsbn = 9789580000000n;

  for (let i = 0; i < BOOKS_DATA.length; i++) {
    const b = BOOKS_DATA[i];
    const catId = catMap[b.category] || categories[0].id;
    const isbn = (baseIsbn + BigInt(i + 1)).toString();

    try {
      const book = await request('/books', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          title: b.title,
          author: b.author,
          isbn: isbn,
          category_id: catId,
          total_copies: b.copies
        })
      });
      createdBooks.push(book);
    } catch (err) {
      // Si ya existe por ISBN, buscarlo
      const found = await request(`/books?q=${encodeURIComponent(b.title)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (found.items && found.items.length > 0) {
        createdBooks.push(found.items[0]);
      }
    }
  }
  console.log(`✅ ${createdBooks.length} libros listos en catálogo.`);

  // 6. Sembrar Socios (10)
  console.log(`👥 Sembrando ${MEMBERS_DATA.length} socios...`);
  const createdMembers = [];
  for (const m of MEMBERS_DATA) {
    try {
      const mem = await request('/members', {
        method: 'POST',
        headers: { Authorization: `Bearer ${librarianToken}` },
        body: JSON.stringify(m)
      });
      createdMembers.push(mem);
    } catch (err) {
      const found = await request(`/members?q=${encodeURIComponent(m.document_number)}`, {
        headers: { Authorization: `Bearer ${librarianToken}` }
      });
      if (found.items && found.items.length > 0) {
        createdMembers.push(found.items[0]);
      }
    }
  }
  console.log(`✅ ${createdMembers.length} socios listos.`);

  // 7. Sembrar Préstamos (>= 15)
  console.log('🔄 Registrando préstamos de prueba...');
  const loans = [];

  // Prestamos regulares (activos y devueltos)
  for (let i = 0; i < 12; i++) {
    const member = createdMembers[i % createdMembers.length];
    const b1 = createdBooks[(i * 2) % createdBooks.length];
    const b2 = createdBooks[(i * 2 + 1) % createdBooks.length];

    try {
      const loan = await request('/loans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${librarianToken}` },
        body: JSON.stringify({
          member_id: member.id,
          items: [{ book_id: b1.id }, { book_id: b2.id }]
        })
      });
      loans.push(loan);

      // Devolver algunos préstamos para tener historial cerrado
      if (i % 2 === 0 && loan.items && loan.items.length > 0) {
        for (const item of loan.items) {
          await request(`/loans/${loan.id}/items/${item.id}/return`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${librarianToken}` }
          });
        }
      }
    } catch (e) {
      // Ignorar si el socio ya tiene préstamos máximos
    }
  }

  // 8. Crear exactamente 3 préstamos con ítems vencidos (overdue)
  // Usamos fechas de hace 20 días para que due_at sea hace 6 días
  console.log('⏳ Registrando exactamente 3 préstamos vencidos...');
  const overdueMembers = [createdMembers[7], createdMembers[8], createdMembers[9]];
  const overdueBooks = [createdBooks[15], createdBooks[16], createdBooks[17]];

  const backdate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();

  for (let i = 0; i < 3; i++) {
    try {
      const loan = await request('/loans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${librarianToken}` },
        body: JSON.stringify({
          member_id: overdueMembers[i].id,
          loaned_at: backdate,
          items: [{ book_id: overdueBooks[i].id }]
        })
      });
      loans.push(loan);
    } catch (e) {
      console.warn(`Aviso en préstamo vencido ${i}: ${e.message}`);
    }
  }

  // 9. Verificación final
  const overdueList = await request('/loans/overdue', {
    headers: { Authorization: `Bearer ${librarianToken}` }
  });
  console.log(`\n📊 Verificación de /loans/overdue:`);
  console.log(`   Líneas vencidas: ${overdueList.items.length}`);
  for (const it of overdueList.items) {
    console.log(`   - «${it.book_title}» (${it.member_name}), venció el ${it.due_at} (${it.days_late} días de retraso)`);
  }

  const today = new Date().toISOString().split('T')[0];
  const report = await request(`/reports/most-borrowed?from=2026-01-01&to=${today}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`\n📈 Verificación de /reports/most-borrowed:`);
  console.log(`   Filas en reporte: ${report.rows.length}`);
  if (report.rows.length > 0) {
    console.log(`   Libro más prestado: «${report.rows[0].book_title}» (${report.rows[0].times_borrowed} veces)`);
  }

  console.log('\n✨ ¡Sembrado de datos completado exitosamente!');
}

main().catch((err) => {
  console.error('\n❌ Error durante el sembrado:', err);
  process.exit(1);
});
