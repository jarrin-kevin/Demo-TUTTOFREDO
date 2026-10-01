using System.Drawing;
using System.Drawing.Printing;
using System.Globalization;
using ESC_POS_USB_NET.Printer;

namespace TuttoImpresora;

public record ImpresoraOptions
{
    // Vacío = impresora predeterminada de Windows.
    public string Nombre { get; init; } = string.Empty;
    public string CodePage { get; init; } = "IBM437";
    public string Logo { get; init; } = "logo.png";
    public int LineasAntesDelCorte { get; init; } = 4;
}

// Arma el ticket en texto de 48 columnas (papel de 80 mm, fuente A) y lo
// manda RAW por ESC/POS: sin márgenes del driver y corte justo al final.
public static class TicketPrinter
{
    const int Cols = 48;
    const int ColCant = 4, ColUnit = 9, ColTotal = 10;
    const int ColDesc = Cols - ColCant - ColUnit - ColTotal; // 25

    static readonly object Gate = new();
    static readonly CultureInfo Num = CultureInfo.InvariantCulture;

    public static string NombreImpresora(ImpresoraOptions o) =>
        string.IsNullOrWhiteSpace(o.Nombre) ? new PrinterSettings().PrinterName : o.Nombre.Trim();

    public static void Imprimir(Ticket t, ImpresoraOptions o)
    {
        lock (Gate)
        {
            var p = new Printer(NombreImpresora(o), o.CodePage);

            p.Append(new byte[] { 0x1B, 0x40 }); // ESC @ : reinicia la impresora
            p.Append(new byte[] { 0x1B, 0x74, TablaDeCaracteres(o.CodePage) }); // ESC t : tildes y ñ

            p.AlignCenter();
            var logo = Path.Combine(AppContext.BaseDirectory, o.Logo);
            if (File.Exists(logo))
            {
                using var bmp = new Bitmap(logo);
                p.Image(bmp);
            }
            p.BoldMode("TUTTO FREDDO");
            p.Append(t.Local.Nombre);
            foreach (var l in Ajustar(t.Local.Direccion, Cols)) p.Append(l);
            p.Separator();

            p.Append("¡Gracias por tu compra!");
            p.Append("Pedido N°");
            p.DoubleWidth3();
            p.BoldMode(t.Orden);
            p.NormalWidth();

            p.AlignLeft();
            p.Append($"Fecha y hora : {t.FechaHora}");
            p.Append($"Forma de pago: {t.FormaPago}");
            p.Separator();

            ImprimirCliente(p, t.Cliente);
            p.Separator();

            p.BoldMode(Col("Descripción", ColDesc) + Der("Cant", ColCant) + Der("V.Unit", ColUnit) + Der("V.Total", ColTotal));
            foreach (var prod in t.Productos)
            {
                var nombre = Ajustar(prod.Nombre, ColDesc - 1);
                p.Append(Col(nombre[0], ColDesc) + Der(prod.Cantidad.ToString(Num), ColCant) + Der(Dinero(prod.ValorUnitario), ColUnit) + Der(Dinero(prod.ValorTotal), ColTotal));
                foreach (var l in nombre.Skip(1)) p.Append(l);
                if (!string.IsNullOrWhiteSpace(prod.Opciones))
                    foreach (var l in Ajustar(prod.Opciones, Cols - 2)) p.Append("  " + l);
            }
            p.Separator();

            p.Append(Fila($"Base imponible IVA {t.IvaPorcentaje}%", Dinero(t.BaseImponible)));
            p.Append(Fila("Base imponible 0%", "0.00"));
            p.Append(Fila($"IVA {t.IvaPorcentaje}%", Dinero(t.Iva)));
            p.BoldMode(Fila("TOTAL USD", Dinero(t.Total)));
            p.Separator();

            p.AlignCenter();
            if (t.PagoPendiente)
            {
                p.BoldMode("PAGO PENDIENTE: acércate a caja");
                p.Separator();
            }
            p.Append("Todos nuestros V.Unit incluyen IVA");
            if (t.FacturaPorCorreo) p.Append("Tu factura electrónica llegará a tu correo");
            p.Append("Retira tu pedido cuando llamen tu número");

            p.NewLines(Math.Max(1, o.LineasAntesDelCorte)); // que el texto pase la cuchilla
            // GS V 'B' 1 = corte parcial real en esta impresora (el corte de la
            // librería daba problemas).
            p.Append(new byte[] { 0x1D, 0x56, 0x42, 0x01 });
            p.PrintDocument();
        }
    }

    static void ImprimirCliente(Printer p, Cliente c)
    {
        if (c.Tipo is not ("cedula" or "ruc"))
        {
            p.AlignCenter();
            p.BoldMode("CONSUMIDOR FINAL");
            p.AlignLeft();
            p.Append("C.I./RUC : 9999999999999");
            return;
        }
        var ruc = c.Tipo == "ruc";
        foreach (var l in Ajustar($"{(ruc ? "Razón social" : "Cliente")} : {c.Nombre}", Cols)) p.Append(l);
        p.Append($"{(ruc ? "RUC" : "Cédula")} : {c.Identificacion}");
        if (!string.IsNullOrWhiteSpace(c.Direccion))
            foreach (var l in Ajustar($"Dirección : {c.Direccion}", Cols)) p.Append(l);
        if (!string.IsNullOrWhiteSpace(c.Correo))
            foreach (var l in Ajustar($"Correo : {c.Correo}", Cols)) p.Append(l);
    }

    // ESC t n según la tabla de caracteres elegida.
    static byte TablaDeCaracteres(string codePage) => codePage.ToUpperInvariant() switch
    {
        "IBM850" => 2,
        "IBM860" => 3,
        "IBM858" => 19,
        "WINDOWS-1252" => 16,
        _ => 0, // IBM437
    };

    static string Dinero(decimal v) => v.ToString("0.00", Num);
    static string Col(string s, int w) => s.Length >= w ? s[..w] : s.PadRight(w);
    static string Der(string s, int w) => s.Length >= w ? s[..w] : s.PadLeft(w);

    static string Fila(string izquierda, string derecha)
    {
        var espacio = Cols - derecha.Length;
        return Col(izquierda, espacio) + derecha;
    }

    // Parte un texto en líneas de máximo `ancho` caracteres, por palabras.
    static List<string> Ajustar(string texto, int ancho)
    {
        var lineas = new List<string>();
        var actual = string.Empty;
        foreach (var palabra in (texto ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            var resto = palabra;
            while (resto.Length > ancho)
            {
                if (actual.Length > 0) { lineas.Add(actual); actual = string.Empty; }
                lineas.Add(resto[..ancho]);
                resto = resto[ancho..];
            }
            if (actual.Length == 0) actual = resto;
            else if (actual.Length + 1 + resto.Length <= ancho) actual += " " + resto;
            else { lineas.Add(actual); actual = resto; }
        }
        if (actual.Length > 0 || lineas.Count == 0) lineas.Add(actual);
        return lineas;
    }
}
