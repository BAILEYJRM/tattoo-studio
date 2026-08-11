import React from 'react';
import { Link } from 'react-router-dom';

const LegalLayout = ({ title, children }) => (
  <div className="min-h-screen text-gray-200" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0a0a0a' }}>
    <nav className="border-b border-white/5 bg-black/50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
        <Link to="/" className="font-black text-2xl tracking-tighter text-white uppercase" style={{ letterSpacing: '-0.05em' }}>KuroIchi</Link>
      </div>
    </nav>
    <main className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black mb-10 text-white tracking-tighter">{title}</h1>
      <div className="prose prose-invert prose-p:text-gray-400 prose-h2:text-white max-w-none">
        {children}
      </div>
    </main>
  </div>
);

export const Terminos = () => (
  <LegalLayout title="Términos y Condiciones">
    <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
    <h2>1. Aceptación de los términos</h2>
    <p>Al acceder y utilizar KuroIchi (operado por Cool Tattoo S.L.), aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo, no utilices nuestros servicios.</p>
    <h2>2. Uso del servicio</h2>
    <p>Nuestra plataforma está diseñada para la gestión integral de estudios de tatuaje. Queda prohibido el uso para fines ilícitos o la reventa del software sin autorización.</p>
    <h2>3. Pagos y Suscripciones</h2>
    <p>El uso continuado de las herramientas premium requiere una suscripción activa. Puedes cancelar en cualquier momento desde tu panel de configuración.</p>
    <h2>4. Modificaciones</h2>
    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de cambios significativos.</p>
  </LegalLayout>
);

export const Privacidad = () => (
  <LegalLayout title="Política de Privacidad">
    <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
    <h2>1. Información que recopilamos</h2>
    <p>Recopilamos información necesaria para el funcionamiento del sistema: datos de contacto, historial de citas e información médica básica provista en los consentimientos (solo accesible por ti y tu estudio).</p>
    <h2>2. Uso de la información</h2>
    <p>Tus datos se usan exclusivamente para brindarte el servicio. No vendemos ni compartimos tu información con terceros para fines publicitarios.</p>
    <h2>3. Seguridad</h2>
    <p>Implementamos estrictas medidas de seguridad, incluyendo encriptación en reposo y en tránsito, para proteger toda la información almacenada en KuroIchi.</p>
  </LegalLayout>
);

export const Cookies = () => (
  <LegalLayout title="Política de Cookies">
    <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
    <h2>1. ¿Qué son las cookies?</h2>
    <p>Son pequeños archivos de texto que se guardan en tu dispositivo para mantener tu sesión activa y mejorar tu experiencia de usuario.</p>
    <h2>2. Cookies que utilizamos</h2>
    <p>Solo utilizamos cookies técnicas y esenciales para recordar tu inicio de sesión y preferencias del sistema. No utilizamos cookies de rastreo de terceros intrusivos.</p>
    <h2>3. Gestión de cookies</h2>
    <p>Puedes desactivar las cookies desde tu navegador, aunque esto impedirá que puedas iniciar sesión en la plataforma.</p>
  </LegalLayout>
);

export const CompraVenta = () => (
  <LegalLayout title="Política de Compra y Venta">
    <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
    <h2>1. Facturación</h2>
    <p>Los cargos se realizan al inicio de tu ciclo de facturación mensual o anual. Recibirás una factura oficial emitida por Cool Tattoo S.L. con CIF B64272024.</p>
    <h2>2. Reembolsos</h2>
    <p>Ofrecemos una garantía de devolución durante los primeros 14 días. Pasado este tiempo, no se realizan reembolsos por periodos parciales.</p>
    <h2>3. Cancelación</h2>
    <p>Puedes cancelar tu suscripción en cualquier momento. Tu cuenta seguirá activa hasta el final del periodo pagado.</p>
  </LegalLayout>
);
