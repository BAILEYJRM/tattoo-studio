import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Cookie as CookieIcon, Info, HelpCircle, ArrowLeft } from 'lucide-react';

const LegalLayout = ({ title, icon, children }) => (
  <div className="min-h-screen text-gray-200 bg-[#050505]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
    
    {/* Navbar */}
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-black text-2xl tracking-tighter text-white uppercase" style={{ letterSpacing: '-0.05em' }}>KuroIchi</Link>
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
      </div>
    </nav>

    {/* Header Decorator */}
    <div className="relative pt-32 pb-16 px-6 border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(220,38,38,0.15), transparent 70%)' }} />
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          {icon}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{title}</h1>
        <p className="mt-4 text-gray-400 font-medium">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
      </div>
    </div>

    {/* Content */}
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed prose-h2:text-white prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/5 max-w-none">
        {children}
      </div>
    </main>
  </div>
);

export const Terminos = () => (
  <LegalLayout title="Términos y Condiciones" icon={<FileText className="w-8 h-8" />}>
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
  <LegalLayout title="Política de Privacidad" icon={<Shield className="w-8 h-8" />}>
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
  <LegalLayout title="Política de Cookies" icon={<CookieIcon className="w-8 h-8" />}>
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
  <LegalLayout title="Política de Compra y Venta" icon={<FileText className="w-8 h-8" />}>
    <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
    <h2>1. Facturación</h2>
    <p>Los cargos se realizan al inicio de tu ciclo de facturación mensual o anual. Recibirás una factura oficial emitida por Cool Tattoo S.L. con CIF B64272024.</p>
    <h2>2. Reembolsos</h2>
    <p>Ofrecemos una garantía de devolución durante los primeros 14 días. Pasado este tiempo, no se realizan reembolsos por periodos parciales.</p>
    <p>Puedes cancelar tu suscripción en cualquier momento. Tu cuenta seguirá activa hasta el final del periodo pagado.</p>
  </LegalLayout>
);

export const AvisoLegal = () => (
  <LegalLayout title="Aviso Legal" icon={<Info className="w-8 h-8" />}>
    <h2>1. Datos Identificativos</h2>
    <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos: la empresa titular de dominio web es Cool Tattoo S.L. (en adelante KuroIchi), con domicilio a estos efectos en C/Generalitat, 5, 08960 Sant Just Desvern, Barcelona, España, número de C.I.F.: B64272024.</p>
    <h2>2. Usuarios</h2>
    <p>El acceso y/o uso de este portal de KuroIchi atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.</p>
    <h2>3. Propiedad Intelectual e Industrial</h2>
    <p>KuroIchi por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).</p>
  </LegalLayout>
);

export const FAQ = () => (
  <LegalLayout title="Preguntas Frecuentes (FAQ)" icon={<HelpCircle className="w-8 h-8" />}>
    <h2>¿Qué es KuroIchi?</h2>
    <p>KuroIchi es un software integral de gestión diseñado específicamente para estudios de tatuaje. Permite organizar citas, llevar el control de inventario, registrar consentimientos digitales, contabilidad y más.</p>
    <h2>¿Necesito instalar algo?</h2>
    <p>No. KuroIchi está 100% basado en la nube. Puedes acceder desde cualquier ordenador, tablet o móvil con conexión a internet sin necesidad de instalaciones complejas.</p>
    <h2>¿Qué pasa con los consentimientos digitales?</h2>
    <p>Nuestros consentimientos incluyen firma digital y tienen validez legal. Se almacenan de forma segura en la nube para que tú y tu estudio estéis siempre protegidos ante cualquier eventualidad.</p>
    <h2>¿Puedo cancelar mi suscripción cuando quiera?</h2>
    <p>Absolutamente. No exigimos permanencia. Si en algún momento decides que KuroIchi no es para ti, puedes cancelar la suscripción con un solo clic desde el panel de configuración.</p>
  </LegalLayout>
);
