# Sistema de inventario de prueba técnica para CPFFloors

## Contexto
```
Hagamos un ejercicio práctico de rol. Imagina que ya formas parte del equipo tecnológico de Juliam Corp LLC, una empresa de retailing encargada de suministrar insumos y productos para restaurantes (contenedores de plástico, vidrio, vasos, cubiertos, servilletas y empaques).
```

## Situación de ejemplo
```
Nuestro sistema de inventario está montado en varios archivos de Excel que usamos en el almacén, junto con unas macros que configuramos con ChatGPT para llevar rápido las entradas y salidas. Sin embargo, con la llegada de dos personas nuevas al equipo, cada quien creó su propio Excel y perdimos el control exacto de lo que realmente tenemos en stock.
Sabemos lo que vendemos por las órdenes de compra de los distribuidores, pero no tenemos el inventario físico actualizado. Esto ya está afectando la línea de despacho: hay clientes esperando en filas eternas y estamos empezando a perder ventas diarias.
Necesitamos recuperar el control en menos de una semana. Si es necesario reentrenar al personal, lo hacemos, pero necesitamos saber qué pedir para reabastecer el almacén antes de empezar a irnos a pérdidas.
```

## Tablas
```
enum UserRoles {
  seller
  manager
  admin
}

enum PaymentMethods {
  cash
  card
  transfer
}

table users as U {
  user_id int [pk]
  username string [max: 250, not null]
  password string [max: 250, not null]
  role UserRoles [max: 50]
  created_at timestamp
  updated_at timestamp
}

table clients as C {
  client_id int [pk]
  fullname string [max: 250, not null]
  address string [max: 500]
  main_tlf string [max: 50]
  sec_tlf string [max: 50]
  created_at timestamp
  updated_at timestamp
}

table products as P {
  product_id int [pk]
  name string [max: 250, not null]
  description string [max: 250]
  price double [not null]
  count int [not null, note: "Productos en stock"]
  iva double [note: "Impuesto"]
  created_at timestamp
  updated_at timestamp
}

table bills as B {
  bill_id int [pk]
  user_id int [ref: > U.user_id, note: "Vendedor"]
  client_id int [ref: > C.client_id, note: "Cliente"]
  payment_method PaymentMethods [not null]
  payment_ref string
  created_at timestamp
  updated_at timestamp
}

table bill_items as BI {
  bill_id int [pk, ref: > B.bill_id]
  product_id int [pk, ref: > P.product_id]
  count int [note: "Cantidad del producto"]
  total_price double [note: "Monto sin Impuesto"]
  total double [note: "Precio con Impuesto"]
}
```