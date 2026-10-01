using System.Drawing;
using System.Drawing.Printing;
using System.Drawing.Text;
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
    // Ancho imprimible en puntos: 576 en 80 mm (512 en algunos modelos).
    public int AnchoPuntos { get; init; } = 576;
}

// Arma el ticket y lo manda RAW por ESC/POS: sin márgenes del driver y con
// corte justo al final. ESC_POS_USB_NET se usa para enviar a la impresora;
// el encabezado, los tamaños y la tabla de caracteres van con comandos
// ESC/POS estándar (los helpers de la librería salían mal en esta térmica).
public static class TicketPrinter
{
    static readonly object Gate = new();
    static readonly CultureInfo Num = CultureInfo.InvariantCulture;

    // Comandos ESC/POS.
    static readonly byte[] Reset = { 0x1B, 0x40 };            // ESC @
    static readonly byte[] SinModoChino = { 0x1C, 0x2E };     // FS . : apaga el modo de caracteres chinos
    static readonly byte[] Izquierda = { 0x1B, 0x61, 0 };     // ESC a 0
    static readonly byte[] Centro = { 0x1B, 0x61, 1 };        // ESC a 1
    static readonly byte[] NegritaSi = { 0x1B, 0x45, 1 };     // ESC E 1
    static readonly byte[] NegritaNo = { 0x1B, 0x45, 0 };     // ESC E 0
    static readonly byte[] TamanoNormal = { 0x1D, 0x21, 0x00 }; // GS ! 0
    static readonly byte[] TamanoDoble = { 0x1D, 0x21, 0x11 };  // GS ! 0x11 : doble ancho y alto, sin deformar
    static readonly byte[] CorteParcial = { 0x1D, 0x56, 0x42, 0x01 }; // GS V 'B' 1 : corte parcial real en esta impresora

    public static string NombreImpresora(ImpresoraOptions o) =>
        string.IsNullOrWhiteSpace(o.Nombre) ? new PrinterSettings().PrinterName : o.Nombre.Trim();

    public static void Imprimir(Ticket t, ImpresoraOptions o)
    {
        lock (Gate)
        {
            var cols = o.AnchoPuntos / 12; // fuente A: 12 puntos por carácter -> 48 columnas
            var p = new Printer(NombreImpresora(o), o.CodePage);
            void Linea(string s) => p.Append(s.Length == 0 ? " " : s);
            void Separador() => Linea(new string('-', cols));

            p.Append(Reset);
            p.Append(SinModoChino);
            p.Append(new byte[] { 0x1B, 0x74, TablaDeCaracteres(o.CodePage) }); // ESC t : tildes y ñ

            // Encabezado: logo pequeño arriba a la izquierda y los datos del local al lado.
            using (var encabezado = Encabezado(t.Local, o))
                p.Append(Raster(encabezado));
            p.Append(Izquierda);
            Separador();

            p.Append(Centro);
            Linea("¡Gracias por tu compra!");
            Linea("Pedido N°");
            p.Append(TamanoDoble);
            p.Append(NegritaSi);
            Linea(t.Orden);
            p.Append(NegritaNo);
            p.Append(TamanoNormal);

            p.Append(Izquierda);
            Linea($"Fecha y hora : {t.FechaHora}");
            Linea($"Forma de pago: {t.FormaPago}");
            Separador();

            ImprimirCliente(p, t.Cliente, cols);
            Separador();

            const int colCant = 4, colUnit = 9, colTotal = 10;
            var colDesc = cols - colCant - colUnit - colTotal;
            p.Append(NegritaSi);
            Linea(Col("Descripción", colDesc) + Der("Cant", colCant) + Der("V.Unit", colUnit) + Der("V.Total", colTotal));
            p.Append(NegritaNo);
            foreach (var prod in t.Productos)
            {
                var nombre = Ajustar(prod.Nombre, colDesc - 1);
                Linea(Col(nombre[0], colDesc) + Der(prod.Cantidad.ToString(Num), colCant) + Der(Dinero(prod.ValorUnitario), colUnit) + Der(Dinero(prod.ValorTotal), colTotal));
                foreach (var l in nombre.Skip(1)) Linea(l);
                if (!string.IsNullOrWhiteSpace(prod.Opciones))
                    foreach (var l in Ajustar(prod.Opciones, cols - 2)) Linea("  " + l);
            }
            Separador();

            Linea(Fila($"Base imponible IVA {t.IvaPorcentaje}%", Dinero(t.BaseImponible), cols));
            Linea(Fila("Base imponible 0%", "0.00", cols));
            Linea(Fila($"IVA {t.IvaPorcentaje}%", Dinero(t.Iva), cols));
            p.Append(NegritaSi);
            Linea(Fila("TOTAL USD", Dinero(t.Total), cols));
            p.Append(NegritaNo);
            Separador();

            p.Append(Centro);
            if (t.PagoPendiente)
            {
                p.Append(NegritaSi);
                Linea("PAGO PENDIENTE");
                p.Append(NegritaNo);
                Linea("Acércate a caja para pagar");
                Separador();
            }
            Linea("Todos nuestros V.Unit incluyen IVA");
            if (t.FacturaPorCorreo) Linea("Tu factura electrónica llegará a tu correo");
            Linea("Retira tu pedido cuando llamen tu número");
            p.Append(Izquierda);

            p.NewLines(Math.Max(1, o.LineasAntesDelCorte)); // que el texto pase la cuchilla
            p.Append(CorteParcial);
            p.PrintDocument();
        }
    }

    static void ImprimirCliente(Printer p, Cliente c, int cols)
    {
        if (c.Tipo is not ("cedula" or "ruc"))
        {
            p.Append(NegritaSi);
            p.Append("CONSUMIDOR FINAL");
            p.Append(NegritaNo);
            p.Append("C.I./RUC : 9999999999999");
            return;
        }
        var ruc = c.Tipo == "ruc";
        foreach (var l in Ajustar($"{(ruc ? "Razón social" : "Cliente")} : {c.Nombre}", cols)) p.Append(l);
        p.Append($"{(ruc ? "RUC" : "Cédula")} : {c.Identificacion}");
        if (!string.IsNullOrWhiteSpace(c.Direccion))
            foreach (var l in Ajustar($"Dirección : {c.Direccion}", cols)) p.Append(l);
        if (!string.IsNullOrWhiteSpace(c.Correo))
            foreach (var l in Ajustar($"Correo : {c.Correo}", cols)) p.Append(l);
    }

    // Encabezado como imagen del ancho del papel: logo a la izquierda y el
    // nombre, local y dirección a la derecha (texto sin suavizado = nítido).
    static Bitmap Encabezado(Local local, ImpresoraOptions o)
    {
        const int alto = 128, lado = 112, margen = 8;
        var bmp = new Bitmap(o.AnchoPuntos, alto);
        using var g = Graphics.FromImage(bmp);
        g.Clear(Color.White);
        g.TextRenderingHint = TextRenderingHint.SingleBitPerPixelGridFit;

        var rutaLogo = Path.Combine(AppContext.BaseDirectory, o.Logo);
        if (File.Exists(rutaLogo))
        {
            using var logo = Image.FromFile(rutaLogo);
            var escala = Math.Min((float)lado / logo.Width, (float)lado / logo.Height);
            int w = (int)(logo.Width * escala), h = (int)(logo.Height * escala);
            g.DrawImage(logo, 0, (alto - h) / 2, w, h);
        }

        var x = lado + 16;
        var ancho = o.AnchoPuntos - x;
        using var titulo = new Font("Arial", 34, FontStyle.Bold, GraphicsUnit.Pixel);
        using var subtitulo = new Font("Arial", 22, FontStyle.Bold, GraphicsUnit.Pixel);
        using var texto = new Font("Arial", 20, FontStyle.Regular, GraphicsUnit.Pixel);
        g.DrawString("TUTTO FREDDO", titulo, Brushes.Black, x, margen);
        var nombreLocal = local.Nombre.Replace("Tutto Freddo - ", "", StringComparison.OrdinalIgnoreCase);
        g.DrawString(nombreLocal, subtitulo, Brushes.Black, new RectangleF(x, margen + 42, ancho, 28));
        g.DrawString(local.Direccion, texto, Brushes.Black, new RectangleF(x, margen + 72, ancho, alto - margen - 72));
        return bmp;
    }

    // Imagen a GS v 0 (raster de bits): un bit por punto, negro = 1.
    static byte[] Raster(Bitmap bmp)
    {
        int anchoBytes = (bmp.Width + 7) / 8, alto = bmp.Height;
        var datos = new List<byte>(8 + anchoBytes * alto)
        {
            0x1D, 0x76, 0x30, 0x00,
            (byte)(anchoBytes & 0xFF), (byte)(anchoBytes >> 8),
            (byte)(alto & 0xFF), (byte)(alto >> 8),
        };
        for (var y = 0; y < alto; y++)
            for (var bx = 0; bx < anchoBytes; bx++)
            {
                byte b = 0;
                for (var bit = 0; bit < 8; bit++)
                {
                    var x = bx * 8 + bit;
                    if (x >= bmp.Width) continue;
                    var c = bmp.GetPixel(x, y);
                    var luz = 0.299 * c.R + 0.587 * c.G + 0.114 * c.B;
                    if (c.A > 127 && luz < 128) b |= (byte)(0x80 >> bit);
                }
                datos.Add(b);
            }
        return datos.ToArray();
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
    static string Fila(string izquierda, string derecha, int cols) => Col(izquierda, cols - derecha.Length) + derecha;

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
