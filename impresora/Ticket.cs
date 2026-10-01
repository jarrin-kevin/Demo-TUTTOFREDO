namespace TuttoImpresora;

// Lo que manda el tótem al terminar el pedido (frontend/src/lib/ticket.js).
public class Ticket
{
    public Local Local { set; get; } = new();
    public string Orden { set; get; } = string.Empty;
    public string FechaHora { set; get; } = string.Empty;
    public string FormaPago { set; get; } = string.Empty;
    public Cliente Cliente { set; get; } = new();
    public List<Producto> Productos { set; get; } = [];
    public decimal BaseImponible { set; get; }
    public decimal Iva { set; get; }
    public int IvaPorcentaje { set; get; } = 15;
    public decimal Total { set; get; }
    public bool PagoPendiente { set; get; }
    public bool FacturaPorCorreo { set; get; }
}

public class Local
{
    public string Nombre { set; get; } = string.Empty;
    public string Direccion { set; get; } = string.Empty;
}

public class Cliente
{
    // "cedula" | "ruc" | "final"
    public string Tipo { set; get; } = "final";
    public string Nombre { set; get; } = string.Empty;
    public string Identificacion { set; get; } = string.Empty;
    public string Direccion { set; get; } = string.Empty;
    public string Correo { set; get; } = string.Empty;
}

public class Producto
{
    public string Nombre { set; get; } = string.Empty;
    public string Opciones { set; get; } = string.Empty;
    public int Cantidad { set; get; }
    public decimal ValorUnitario { set; get; }
    public decimal ValorTotal { set; get; }
}
