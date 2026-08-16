'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export type ClavePolitica =
  | 'contacto'
  | 'privacidad'
  | 'reembolso'
  | 'envio'
  | 'terminos'
  | null

interface PoliticasModalProps {
  politica: ClavePolitica
  onCerrar: () => void
}

const CONTENIDO_POLITICAS: Record<
  Exclude<ClavePolitica, null>,
  { titulo: string; contenido: string }
> = {
  contacto: {
    titulo: 'Información de contacto',
    contenido: `
Información de contacto
Contáctanos ¿Tienes alguna pregunta? No dude en comunicarse con nosotros en:
www.barberworld.com.co

Nuestro equipo de soporte en Barberworld está aquí para estar 100% comprometido contigo y brindarte la mejor experiencia de compra posible. Nuestro horario de trabajo es de lunes a sábado de 9 a.m. a 6 p.m. En cualquier caso contamos con asistentes las 24 horas dispuestos a responder tu correo electrónico lo antes posible.

Teléfono: 3223320949
Email: barberworldstore@gmail.com
Dirección: Calle 8 #20-30, C.C Siete Mares Oficina 206-207
    `,
  },
  privacidad: {
    titulo: 'Políticas de privacidad',
    contenido: `
QUÉ INFORMACIÓN PERSONAL RECOPILAMOS

Cuando visitas el Sitio, recopilamos automáticamente cierta información sobre tu dispositivo, incluida información sobre tu navegador web, dirección IP, zona horaria y algunas de las cookies que están instaladas en tu dispositivo.

Además, a medida que navegas por el Sitio, recopilamos información sobre las páginas web individuales o los productos que ves, qué sitios web o términos de búsqueda te remiten al Sitio, e información sobre cómo interactúas con el Sitio. Nos referimos a esta información recopilada automáticamente como Información del Dispositivo (device information).

Recopilamos información del dispositivo utilizando las siguientes tecnologías:

Cookies: son archivos de datos que se colocan en tu dispositivo o computadora y con frecuencia incluyen un identificador único anónimo.
Archivos de registro: rastrean las acciones que ocurren en el Sitio y recopilan datos, incluida tu dirección IP, el tipo de navegador, el proveedor de servicios de Internet, las páginas de referencia/salida y las marcas de fecha y hora.
Además, cuando efectúas una compra o intentas realizar una compra a través del Sitio, recopilamos cierta información tuya, como tu nombre, dirección de facturación, dirección de envío, información de pago, incluidos números de tarjetas de crédito (menciona todos los tipos de pagos aceptados), dirección de email y el número de teléfono. Esto se denomina Información del Pedido.

Al referirnos a Información Personal en esta Política de Privacidad, estamos hablando tanto de la Información del Dispositivo como de la Información del Pedido.

CÓMO USAMOS TU INFORMACIÓN PERSONAL

Utilizamos la Información de Pedido que recopilamos por lo general para cumplir con los pedidos realizados a través del Sitio (incluido el procesamiento de tu información de pago, la organización del envío y el envío de facturas y/o confirmaciones de pedidos).

Además, usamos esta Información del Pedido para: comunicarnos contigo, examinar nuestros pedidos para detectar posibles riesgos o fraudes, para (en línea con las preferencias que has compartido con nosotros) ofrecerte información o publicidad relacionada con nuestros productos o servicios.

Utilizamos la Información del Dispositivo que recopilamos para ayudarnos a detectar posibles riesgos y fraudes (en particular, tu dirección IP) y, en general, para mejorar y optimizar nuestro sitio.

COMPARTIENDO TU INFORMACIÓN PERSONAL

Compartimos tu Información Personal con terceros para ayudarnos a utilizarla como se describió anteriormente.

También empleamos Google Analytics para ayudarnos a comprender cómo nuestros clientes usan Barberworld. Cómo usa Google tu Información Personal.

Finalmente, también podemos compartir tu Información Personal para cumplir con las leyes y regulaciones aplicables, para responder a una citación, una orden de registro u otras solicitudes legales de información que recibimos, o para proteger nuestros derechos.

PUBLICIDAD DE COMPORTAMIENTO

Utilizamos tu Información Personal para proporcionarte anuncios específicos o comunicaciones de marketing que creemos que pueden ser de tu interés.

TUS DERECHOS

Si eres un residente europeo, tienes derecho a acceder a la información personal que tenemos sobre ti y a solicitar que tu información personal se corrija, actualice o elimine. Si deseas ejercer este derecho, por favor contáctanos.

Además, si eres un residente europeo, notamos que estamos procesando tu información para cumplir con los contratos que podríamos tener contigo (por ejemplo, si realizas un pedido a través del Sitio), o de otra manera para perseguir nuestros intereses comerciales legítimos mencionados anteriormente.

Ten en cuenta que tu información se transferirá fuera de Europa, incluso a Canadá y Estados Unidos.

RETENCIÓN DE DATOS

Cuando realices un pedido a través del Sitio, mantendremos tu Información de Pedido para nuestros registros a menos que y hasta que nos solicites eliminar esta información.

MENORES

El Sitio no está destinado a personas menores de edad.

CAMBIOS
Podemos actualizar esta política de privacidad de vez en cuando para reflejar, por ejemplo, cambios en nuestras prácticas o por otras razones operativas, legales o reglamentarias.
    `,
  },
  reembolso: {
    titulo: 'Políticas de reembolso',
    contenido: `
Política de reembolso
Proceso de Devolución
El proceso de devolución se llevará a cabo en las siguientes etapas:

Reporte de la Devolución: El cliente deberá enviar la información requerida a través de nuestros medios de atención.
Generación de la Devolución: Una vez recibida la solicitud, en un plazo máximo de 15 días, se aprobara y generará una orden de devolución con la transportadora que se encargó inicialmente del pedido. Trabajamos con las siguientes empresas: Servientrega, Envía, Coordinadora, Domina, Interrapidisimo.
Recogida del Producto: La transportadora recogerá el producto en la ubicación a la que fue enviada el pedido. Dependiendo de la ubicación del cliente, también puede optar por dejar el producto en una oficina de la transportadora.
Inspección y Reposición: Una vez que el producto llegue a las oficinas de nuestros proveedores, se llevará a cabo una inspección. Tras confirmar el problema, se enviará un nuevo producto con la misma transportadora.

1A. Notificación de Devolución:
Si un cliente recibe un producto defectuoso y decide que desea devolverlo, debe informarnos dentro de las primeras 72 horas después de recibirlo. Desafortunadamente, no podemos aceptar devoluciones ni solicitudes de reembolso después de este período de tiempo.

2B. Reporte de Devolución:
Para iniciar el proceso de devolución, por favor contacte a nuestro equipo de servicio al cliente vía Whatsapp al número (+57 3223320949), proporcionando la siguiente información:

Nombre Completo
Correo electrónico
Número de teléfono
Transportadora
Número De Guía
Explicación detallada del caso en TEXTO
Video del funcionamiento del producto
Este proceso nos ayuda a entender mejor su situación y acelerar el proceso de devolución.

3C. Cambio de Producto:
No realizamos reembolsos en efectivo. Sin embargo, nos comprometemos a cambiar el producto dentro de los próximos 30 días hábiles después de recibir y verificar la información y el producto devuelto. El producto de reemplazo será del mismo tipo y valor que el producto original que compró.

4D. Descuento por Devolución:
Entendemos que las devoluciones pueden causar inconvenientes a nuestros clientes. Para compensar este inconveniente, ofrecemos un descuento del 5% en su próxima compra. Este descuento será aplicado en su cuenta después de que se haya completado el proceso de devolución.
    `,
  },
  envio: {
    titulo: 'Políticas de envío',
    contenido: `
Política de envío
En Barberworld entendemos que los gastos de envío pueden ser un dolor de cabeza para nuestros clientes, por eso ofrecemos las mejores tarifas de envío a toda Colombia para todos los pedidos.

El tiempo de entrega varía según la ubicación del cliente. Aseguramos que todos nuestros envíos son seguidos y rastreados para garantizar que lleguen a tiempo.

Para asegurar una entrega exitosa, es importante que proporcione una dirección de envío válida y completa, así como un número de contacto para que podamos ponernos en contacto con usted en caso de cualquier problema con su envío. Si tiene alguna pregunta sobre nuestra política de envío o si necesita asistencia con su pedido, no dude en ponerse en contacto con nuestro servicio al cliente. Estaremos encantados de ayudarlo.
    `,
  },
  terminos: {
    titulo: 'Términos de servicio',
    contenido: `
Términos del servicio
Todos los términos se refieren a la oferta, aceptación y consideración del pago necesario para efectuar el proceso de nuestra asistencia al Cliente de la manera más adecuada, ya sea mediante reuniones formales de una duración fija, o por cualquier otro medio, con el propósito expreso de conocer las necesidades del Cliente con respecto a la provisión de los servicios/productos declarados de la Compañía, de acuerdo con y sujeto a la ley vigente de Colombia.

Cualquier uso de la terminología anterior u otras palabras en singular, plural, mayúsculas y/o, él/ella o ellos, se consideran intercambiables y, por lo tanto, se refieren a lo mismo.

Cookies
Empleamos el uso de cookies. Al utilizar el sitio web de Barberworld usted acepta el uso de cookies de acuerdo con la política de privacidad de Barberworld. La mayoría de los modernos sitios web interactivos de hoy en día usan cookies para permitirnos recuperar los detalles del usuario para cada visita.

Las cookies se utilizan en algunas áreas de nuestro sitio para habilitar la funcionalidad de esta área y la facilidad de uso para las personas que lo visitan. Algunos de nuestros socios afiliados/publicitarios también pueden usar cookies.

Licencia
A menos que se indique lo contrario, Barberworld y/o sus licenciatarios les pertenecen los derechos de propiedad intelectual de todo el material en Barberworld

Todos los derechos de propiedad intelectual están reservados. Puedes ver y/o imprimir páginas desde www.barberworld.com.co para tu uso personal sujeto a las restricciones establecidas en estos términos y condiciones.

No debes:

Volver a publicar material desde www.barberworld.com.co.
Vender, alquilar u otorgar una sub-licencia de material desde www.barberworld.com.co
Reproducir, duplicar o copiar material desde www.barberworld.com.co.
Redistribuir contenido de Barberworld a menos de que el contenido se haga específicamente para la redistribución.

Aviso legal
En la medida máxima permitida por la ley aplicable, excluimos todas las representaciones, garantías y condiciones relacionadas con nuestro sitio web y el uso de este sitio web (incluyendo, sin limitación, cualquier garantía implícita por la ley con respecto a la calidad satisfactoria, idoneidad para el propósito y/o el uso de cuidado y habilidad razonables).

Nada en este aviso legal:

Limita o excluye nuestra o su responsabilidad por muerte o lesiones personales resultantes de negligencia.
Limita o excluye nuestra o su responsabilidad por fraude o tergiversación fraudulenta.
Limita cualquiera de nuestras o sus responsabilidades de cualquier manera que no esté permitida por la ley aplicable.
Excluye cualquiera de nuestras o sus responsabilidades que no pueden ser excluidas bajo la ley aplicable.
    `,
  },
}

export default function PoliticasModal({ politica, onCerrar }: PoliticasModalProps) {
  if (!politica) return null

  const { titulo, contenido } = CONTENIDO_POLITICAS[politica]

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCerrar}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-[#12283F] mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {titulo}
                </Dialog.Title>

                <div className="mt-2">
                  <div className="text-[#64748B] text-sm whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto">
                    {contenido}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full bg-[#12283F] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1C3D5F] transition-colors"
                    onClick={onCerrar}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}