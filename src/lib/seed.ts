import type { Categoria, Espacio, TipoTransaccion } from '@/types';

interface SeedCategoria {
  nombre: string;
  tipo: TipoTransaccion;
  icono: string;
}

const SEED: Record<Espacio, SeedCategoria[]> = {
  personal: [
    { nombre: 'Comida y restaurantes', tipo: 'gasto', icono: 'UtensilsCrossed' },
    { nombre: 'Supermercado', tipo: 'gasto', icono: 'ShoppingCart' },
    { nombre: 'Transporte', tipo: 'gasto', icono: 'Car' },
    { nombre: 'Combustible', tipo: 'gasto', icono: 'Fuel' },
    { nombre: 'Renta / Hipoteca', tipo: 'gasto', icono: 'Home' },
    { nombre: 'Servicios públicos', tipo: 'gasto', icono: 'Receipt' },
    { nombre: 'Internet / Celular', tipo: 'gasto', icono: 'Wifi' },
    { nombre: 'Entretenimiento', tipo: 'gasto', icono: 'Tv' },
    { nombre: 'Suscripciones', tipo: 'gasto', icono: 'CreditCard' },
    { nombre: 'Salud', tipo: 'gasto', icono: 'Heart' },
    { nombre: 'Farmacia', tipo: 'gasto', icono: 'Pill' },
    { nombre: 'Educación', tipo: 'gasto', icono: 'GraduationCap' },
    { nombre: 'Ropa', tipo: 'gasto', icono: 'Shirt' },
    { nombre: 'Hogar', tipo: 'gasto', icono: 'Sofa' },
    { nombre: 'Mascotas', tipo: 'gasto', icono: 'PawPrint' },
    { nombre: 'Regalos', tipo: 'gasto', icono: 'Gift' },
    { nombre: 'Tecnología', tipo: 'gasto', icono: 'Smartphone' },
    { nombre: 'Viajes', tipo: 'gasto', icono: 'Plane' },
    { nombre: 'Belleza / Cuidado personal', tipo: 'gasto', icono: 'Sparkles' },
    { nombre: 'Seguros', tipo: 'gasto', icono: 'Shield' },
    { nombre: 'Impuestos', tipo: 'gasto', icono: 'FileText' },
    { nombre: 'Hijos / Familia', tipo: 'gasto', icono: 'Baby' },
    { nombre: 'Deportes / Gym', tipo: 'gasto', icono: 'Dumbbell' },
    { nombre: 'Otros gastos', tipo: 'gasto', icono: 'MoreHorizontal' },
    { nombre: 'Salario', tipo: 'ingreso', icono: 'Briefcase' },
    { nombre: 'Freelance', tipo: 'ingreso', icono: 'Laptop' },
    { nombre: 'Inversiones', tipo: 'ingreso', icono: 'TrendingUp' },
    { nombre: 'Reembolso', tipo: 'ingreso', icono: 'RotateCcw' },
    { nombre: 'Alquiler recibido', tipo: 'ingreso', icono: 'Home' },
    { nombre: 'Regalo', tipo: 'ingreso', icono: 'Gift' },
    { nombre: 'Venta', tipo: 'ingreso', icono: 'Tag' },
    { nombre: 'Otros ingresos', tipo: 'ingreso', icono: 'Plus' },
  ],
  barberia: [
    { nombre: 'Insumos', tipo: 'gasto', icono: 'Package' },
    { nombre: 'Productos de venta', tipo: 'gasto', icono: 'ShoppingBag' },
    { nombre: 'Renta del local', tipo: 'gasto', icono: 'Home' },
    { nombre: 'Servicios públicos', tipo: 'gasto', icono: 'Receipt' },
    { nombre: 'Internet / Celular', tipo: 'gasto', icono: 'Wifi' },
    { nombre: 'Sueldos', tipo: 'gasto', icono: 'Users' },
    { nombre: 'Comisiones', tipo: 'gasto', icono: 'Percent' },
    { nombre: 'Marketing / Publicidad', tipo: 'gasto', icono: 'Megaphone' },
    { nombre: 'Equipo / Herramientas', tipo: 'gasto', icono: 'Wrench' },
    { nombre: 'Mantenimiento', tipo: 'gasto', icono: 'Hammer' },
    { nombre: 'Mobiliario', tipo: 'gasto', icono: 'Armchair' },
    { nombre: 'Capacitación', tipo: 'gasto', icono: 'BookOpen' },
    { nombre: 'Transporte', tipo: 'gasto', icono: 'Car' },
    { nombre: 'Combustible', tipo: 'gasto', icono: 'Fuel' },
    { nombre: 'Insumos de limpieza', tipo: 'gasto', icono: 'SprayCan' },
    { nombre: 'Impuestos', tipo: 'gasto', icono: 'FileText' },
    { nombre: 'Seguros', tipo: 'gasto', icono: 'Shield' },
    { nombre: 'Otros gastos', tipo: 'gasto', icono: 'MoreHorizontal' },
    { nombre: 'Corte', tipo: 'ingreso', icono: 'Scissors' },
    { nombre: 'Barba', tipo: 'ingreso', icono: 'Sparkles' },
    { nombre: 'Combo corte + barba', tipo: 'ingreso', icono: 'Package' },
    { nombre: 'Tinte / Color', tipo: 'ingreso', icono: 'Palette' },
    { nombre: 'Diseño / Rayita', tipo: 'ingreso', icono: 'PenTool' },
    { nombre: 'Tratamiento capilar', tipo: 'ingreso', icono: 'Droplet' },
    { nombre: 'Venta de producto', tipo: 'ingreso', icono: 'ShoppingBag' },
    { nombre: 'Servicio extra', tipo: 'ingreso', icono: 'Plus' },
    { nombre: 'Propina', tipo: 'ingreso', icono: 'Heart' },
    { nombre: 'Otros ingresos', tipo: 'ingreso', icono: 'MoreHorizontal' },
  ],
};

export function buildSeedCategorias(espacio: Espacio): Omit<Categoria, 'id'>[] {
  return SEED[espacio].map((c, i) => ({
    nombre: c.nombre,
    espacio,
    tipo: c.tipo,
    icono: c.icono,
    orden: i,
  }));
}
