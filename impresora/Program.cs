using System.Text;
using TuttoImpresora;

// Tablas de caracteres de la térmica (IBM437, 850...) para tildes y ñ.
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
});
var opciones = builder.Configuration.GetSection("Impresora").Get<ImpresoraOptions>() ?? new ImpresoraOptions();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
var log = app.Logger;

// La página del tótem (GitHub Pages) llama a este servicio en 127.0.0.1:
// Chrome pide permiso de "red local" con este encabezado en el preflight.
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
        ctx.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
    await next();
});
app.UseCors();

app.MapGet("/estado", () => Results.Ok(new { ok = true, impresora = TicketPrinter.NombreImpresora(opciones) }));

app.MapPost("/imprimir", (Ticket ticket) =>
{
    try
    {
        TicketPrinter.Imprimir(ticket, opciones);
        log.LogInformation("Pedido {Orden} impreso", ticket.Orden);
        return Results.Ok(new { ok = true });
    }
    catch (Exception e)
    {
        log.LogError(e, "No se pudo imprimir el pedido {Orden}", ticket.Orden);
        return Results.Problem(e.Message);
    }
});

// Ticket de prueba: abre http://127.0.0.1:5123/prueba en el navegador.
app.MapGet("/prueba", () =>
{
    var prueba = new Ticket
    {
        Local = new Local { Nombre = "Tutto Freddo - Challuabamba", Direccion = "Av. del Bombero y Challuabamba" },
        Orden = "000",
        FechaHora = DateTime.Now.ToString("dd/MM/yyyy HH:mm"),
        FormaPago = "Prueba",
        Cliente = new Cliente { Tipo = "final" },
        Productos =
        [
            new Producto { Nombre = "Litro de helado", Opciones = "Oreo", Cantidad = 1, ValorUnitario = 9.00m, ValorTotal = 9.00m },
            new Producto { Nombre = "Mantecado Brownie", Cantidad = 1, ValorUnitario = 3.50m, ValorTotal = 3.50m },
        ],
        BaseImponible = 10.87m,
        Iva = 1.63m,
        Total = 12.50m,
    };
    TicketPrinter.Imprimir(prueba, opciones);
    return Results.Text("Ticket de prueba enviado a " + TicketPrinter.NombreImpresora(opciones));
});

app.Run();
