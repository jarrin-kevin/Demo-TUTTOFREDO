// Componente de ticket para imprimir desde el navegador (SPA, sin backend).
// Usa window.print() -> pasa por el driver de Windows de la impresora,
// que ya confirmaste que corta bien (a diferencia del RAW de ESC_POS_USB_NET).

export default function Recibo({ comprobante, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const subtotal = comprobante.productos.reduce(
    (acc, p) => acc + Number(p.cantidad) * Number(p.costoProductoSinIva),
    0
  );
  const iva = Number(comprobante.total) - subtotal;

  return (
    <div>
      <div className="recibo-acciones no-print">
        <button onClick={handlePrint}>Imprimir</button>
        <button onClick={onClose}>Cerrar</button>
      </div>

      <div id="ticket" className="ticket">
        <p className="centro">Gracias por tu compra!</p>
        <p className="centro">{comprobante.cliente}</p>

        {comprobante.horaprogramada && (
          <>
            <hr />
            <p className="centro negrita">
              PROGRAMADO PARA RETIRAR A LAS: {comprobante.horaprogramada}
            </p>
            <hr />
          </>
        )}

        <p className="centro">Retira tu compra en el KHAFE POINT de cafeteria!</p>
        <hr />

        <p>Orden N° : {comprobante.orden}</p>
        <p>Fecha y Hora : {comprobante.fechaHora}</p>
        <p>Colegio : {comprobante.colegio}</p>
        <p>Saldo Inicial : {comprobante.saldoInicial} USD</p>
        <p>Saldo Final : {comprobante.saldoFinal} USD</p>
        <hr />

        <table>
          <thead>
            <tr>
              <th>Descripcion</th>
              <th>Cant</th>
              <th>V.Unit</th>
              <th>V.Total</th>
            </tr>
          </thead>
          <tbody>
            {comprobante.productos.map((p, i) => {
              const total = Number(p.cantidad) * Number(p.costoProductoSinIva);
              return (
                <tr key={i}>
                  <td>{p.nombreProducto}</td>
                  <td>{p.cantidad}</td>
                  <td>{Number(p.costoProductoSinIva).toFixed(2)}</td>
                  <td>{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <hr />

        <p className="derecha">BASE Imponible IVA %: {subtotal.toFixed(2)}</p>
        <p className="derecha">BASE Imponible 0 %  : 0.00</p>
        <p className="derecha">I.V.A               : {iva.toFixed(2)}</p>
        <p className="derecha">Total               : {Number(comprobante.total).toFixed(2)}</p>
        <hr />

        <p className="centro">Todos nuestros V. Unit incluyen IVA</p>
      </div>
    </div>
  );
}
