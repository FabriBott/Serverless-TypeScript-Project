export const exampleMiddleware = async (event: any, context: any) => {
    // Realizar validaciones o algún procesamiento adicional
    console.log("Middleware processing request:", event);

    // Puedes modificar el `event` antes de que llegue al handler
    if (!event.body) {
        throw new Error("No body found in the request");
    }

    // Modificar el evento si es necesario (por ejemplo, parsear o limpiar datos)
    event.processed = true; // ejemplo de agregar un campo

    return event;  // Devolvemos el evento modificado
};
